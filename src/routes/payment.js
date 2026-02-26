const express = require("express");
const paymentRouter = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const { userAuth } = require("../middlewares/auth");
const { companyAuth } = require("../middlewares/companyAuth");
const Payment = require("../models/payment");
const PickupRequest = require("../models/schedulePickup");
const User = require("../models/user");
const {
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    HAS_RAZORPAY_CREDENTIALS
} = require("../config/env");

// Initialize Razorpay
const razorpay = HAS_RAZORPAY_CREDENTIALS
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    })
    : null;

const ensureRazorpayConfigured = () => {
    if (!HAS_RAZORPAY_CREDENTIALS || !razorpay) {
        const error = new Error("Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        error.statusCode = 503;
        throw error;
    }
};

// Get Razorpay key for frontend
paymentRouter.get("/razorpay-key", (req, res) => {
    if (!RAZORPAY_KEY_ID) {
        return res.status(503).json({ message: "Razorpay key is not configured" });
    }
    res.json({ keyId: RAZORPAY_KEY_ID });
});

// Update user payment details (account number or UPI ID)
paymentRouter.post("/update-payment-details", userAuth, async (req, res) => {
    try {
        const { accountNumber, upiId } = req.body;
        const user = await User.findById(req.user._id);
        
        if (accountNumber) user.accountNumber = accountNumber;
        if (upiId) user.upiId = upiId;
        
        await user.save();
        res.json({ message: "Payment details updated", user });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Update company payment account details (for sending money)
paymentRouter.post("/update-company-payment-account", companyAuth, async (req, res) => {
    try {
        const { paymentAccountNumber, paymentUpiId, paymentBankName, paymentIfscCode, razorpayAccountId } = req.body;
        const Company = require("../models/company");
        const company = await Company.findById(req.company._id);
        
        if (paymentAccountNumber) company.paymentAccountNumber = paymentAccountNumber;
        if (paymentUpiId) company.paymentUpiId = paymentUpiId;
        if (paymentBankName) company.paymentBankName = paymentBankName;
        if (paymentIfscCode) company.paymentIfscCode = paymentIfscCode;
        if (razorpayAccountId) company.razorpayAccountId = razorpayAccountId;
        
        await company.save();
        res.json({ message: "Company payment account updated", company });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Request payment after pickup is complete (user side)
paymentRouter.post("/request-payment/:requestId", userAuth, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { accountNumber, upiId, amount } = req.body;

        const pickupRequest = await PickupRequest.findOne({
            _id: requestId,
            fromUserId: req.user._id,
            status: "picked-up"
        });

        if (!pickupRequest) {
            return res.status(404).json({ 
                message: "Pickup request not found or not completed" 
            });
        }

        // Update pickup request with amount
        if (amount) {
            pickupRequest.wasteAmount = amount;
            await pickupRequest.save();
        }

        // Check if payment request already exists
        const existingPayment = await Payment.findOne({ pickupRequestId: requestId });
        if (existingPayment) {
            return res.status(409).json({ 
                message: "Payment request already exists",
                payment: existingPayment
            });
        }

        // Create payment request
        const payment = new Payment({
            pickupRequestId: requestId,
            userId: req.user._id,
            companyId: pickupRequest.toCompanyId,
            amount: amount || pickupRequest.wasteAmount || 0,
            accountNumber: accountNumber || req.user.accountNumber,
            upiId: upiId || req.user.upiId,
            status: "pending"
        });

        const savedPayment = await payment.save();

        //  Clear feed cache
await clearUserFeedCache(req.user._id);

        res.json({ message: "Payment request created", payment: savedPayment });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Get pending/processing payment requests for company
paymentRouter.get("/company/pending-payments", companyAuth, async (req, res) => {
    try {
        const payments = await Payment.find({
            companyId: req.company._id,
            status: { $in: ["pending", "processing"] }
        })
        .populate("userId", "firstName lastName emailId accountNumber upiId")
        .populate("pickupRequestId", "wasteAmount wasteWeight")
        .sort({ createdAt: -1 });

        res.json({ data: payments });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Process payout to user (company side - using Razorpay Payouts or manual transfer)
paymentRouter.post("/process-payout/:paymentId", companyAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const Company = require("../models/company");
        const method = (req.query.method || "auto").toLowerCase();
        
        const payment = await Payment.findOne({
            _id: paymentId,
            companyId: req.company._id,
            status: { $in: ["pending", "processing"] }
        }).populate("userId");

        if (!payment) {
            return res.status(404).json({ message: "Payment request not found" });
        }

        const company = await Company.findById(req.company._id);
        
        // Check if company has payment account configured
        if (!company.paymentAccountNumber && !company.paymentUpiId && !company.razorpayAccountId) {
            return res.status(400).json({ 
                message: "Please configure your payment account first. Go to profile settings to add your account details.",
                requiresAccountSetup: true
            });
        }

        const amount = payment.amount;
        const amountInPaise = Math.round(amount * 100);
        const canUseRazorpay = Boolean(company.razorpayAccountId && payment.upiId);

        if (method === "razorpay" && !canUseRazorpay) {
            return res.status(400).json({
                message: "Razorpay payout is unavailable. Please add a Razorpay account ID and ensure the user has shared a UPI ID."
            });
        }

        // Try Razorpay Payouts if company has Razorpay account configured
        const shouldAttemptRazorpay = (method === "razorpay" || (method === "auto" && canUseRazorpay)) && payment.status === "pending";
        if (shouldAttemptRazorpay) {
            try {
                ensureRazorpayConfigured();
                // Create payout using Razorpay Payouts API
                const payoutData = {
                    account_number: company.razorpayAccountId,
                    fund_account: {
                        account_type: "vpa", // Virtual Payment Address (UPI)
                        vpa: {
                            address: payment.upiId
                        },
                        contact: {
                            name: payment.userId?.firstName || "User",
                            email: payment.userId?.emailId || "",
                            contact: "",
                            type: "customer"
                        }
                    },
                    amount: amountInPaise,
                    currency: "INR",
                    mode: "UPI",
                    purpose: "payout",
                    queue_if_low_balance: true,
                    reference_id: `payout_${paymentId}`,
                    narration: `Payment for waste collection - ${paymentId}`
                };

                const payout = await razorpay.payouts.create(payoutData);

                payment.razorpayOrderId = payout.id;
                payment.razorpayPaymentId = payout.id;
                payment.transferMethod = "razorpay_payout";

                // If Razorpay already marked the payout as processed/completed, reflect that immediately.
                const terminalStatuses = ["processed", "completed", "closed"];
                if (terminalStatuses.includes((payout.status || "").toLowerCase())) {
                    payment.status = "completed";
                } else {
                    // Otherwise keep it in processing; it will show as such in Transactions.
                    payment.status = "processing";
                }

                await payment.save();

                return res.json({
                    message: "Payout initiated successfully via Razorpay",
                    payoutId: payout.id,
                    status: payout.status,
                    payment
                });
            } catch (payoutErr) {
                console.error("Razorpay Payout error:", payoutErr);
                if (payoutErr.statusCode === 503) {
                    return res.status(503).json({ message: payoutErr.message });
                }
                if (method === "razorpay") {
                    return res.status(502).json({
                        message: "Unable to initiate Razorpay payout. Please try manual transfer.",
                        error: payoutErr.message
                    });
                }
                // Fall through to manual transfer option for auto mode
            }
        }

        // Manual transfer option - (re)mark as processing, company will transfer manually
        payment.transferMethod = "manual";
        if (payment.status === "pending") {
            payment.status = "processing";
            await payment.save();
        }

        return res.json({
            message: "Payment marked as processing. Please transfer the amount manually.",
            transferDetails: {
                amount,
                toAccountNumber: payment.accountNumber,
                toUpiId: payment.upiId,
                fromAccount: company.paymentAccountNumber || company.paymentUpiId || "Your configured account"
            },
            payment
        });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Mark payment as completed (after manual transfer or automatic payout)
paymentRouter.post("/complete-payment/:paymentId", companyAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { transactionId, notes } = req.body;

        const payment = await Payment.findOne({
            _id: paymentId,
            companyId: req.company._id,
            status: "processing"
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found or not in processing status" });
        }

        if (transactionId) {
            if (transactionId.startsWith("pout_")) {
                // Optional verification for Razorpay payout IDs (start with "pout_")
                if (!HAS_RAZORPAY_CREDENTIALS || !razorpay) {
                    return res.status(503).json({
                        message: "Razorpay credentials are not configured. Cannot verify payout ID."
                    });
                }
                try {
                    const payout = await razorpay.payouts.fetch(transactionId);
                    const amountMatches = payout && payout.amount === Math.round(payment.amount * 100);
                    const payoutStatus = (payout?.status || "").toLowerCase();
                    const payoutCompleted = ["processed", "completed", "closed"].includes(payoutStatus);

                    if (!amountMatches || !payoutCompleted) {
                        return res.status(400).json({
                            message: "Unable to verify Razorpay payout. Please ensure the payout is completed and amount matches."
                        });
                    }
                } catch (verificationErr) {
                    console.error("Razorpay verification failed:", verificationErr);
                    return res.status(400).json({
                        message: "Failed to verify Razorpay transaction ID. Please try again or contact support."
                    });
                }
            } else {
                // Basic validation for manual references (length & allowed characters)
                const manualPattern = /^[A-Za-z0-9_-]{6,40}$/;
                if (!manualPattern.test(transactionId)) {
                    return res.status(400).json({
                        message: "Invalid manual transaction reference. Use 6-40 characters, letters/numbers/underscore/dash only."
                    });
                }
            }
        }

        payment.status = "completed";
        if (transactionId) payment.razorpayPaymentId = transactionId;
        if (notes) payment.notes = notes;
        await payment.save();

        //  Clear feed cache after payment completion (user path included)
const pickup = await PickupRequest.findById(payment.pickupRequestId);
if (pickup) {
    await clearUserFeedCache(pickup.fromUserId);
}

        res.json({ message: "Payment marked as completed", payment });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Verify and complete payment (company side)
paymentRouter.post("/verify-payment/:paymentId", companyAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const payment = await Payment.findOne({
            _id: paymentId,
            companyId: req.company._id
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (!RAZORPAY_KEY_SECRET) {
            return res.status(503).json({
                message: "Razorpay credentials are not configured. Cannot verify payment."
            });
        }

        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const keySecret = RAZORPAY_KEY_SECRET;
        const generatedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(text)
            .digest("hex");

        if (generatedSignature === razorpay_signature) {
            payment.status = "completed";
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            await payment.save();

            res.json({ message: "Payment verified and completed", payment });
        } else {
            payment.status = "failed";
            await payment.save();

            //  Clear feed cache (payment verification failure path)
const pickup = await PickupRequest.findById(payment.pickupRequestId);
if (pickup) {
    await clearUserFeedCache(pickup.fromUserId);
}

            res.status(400).json({ message: "Payment verification failed", payment });
        }
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Get all transactions for user
paymentRouter.get("/user/transactions", userAuth, async (req, res) => {
    try {
        const payments = await Payment.find({
            userId: req.user._id
        })
        .populate("companyId", "companyName photoUrl emailId")
        .populate("pickupRequestId", "wasteAmount wasteWeight")
        .sort({ createdAt: -1 });

        res.json({ data: payments });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Get all transactions for company
paymentRouter.get("/company/transactions", companyAuth, async (req, res) => {
    try {
        const payments = await Payment.find({
            companyId: req.company._id
        })
        .populate("userId", "firstName lastName emailId accountNumber upiId")
        .populate("pickupRequestId", "wasteAmount wasteWeight")
        .sort({ createdAt: -1 });

        res.json({ data: payments });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = paymentRouter;

