const express = require("express");
const pickupRequestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const { companyAuth } = require("../middlewares/companyAuth");
const PickupRequest = require("../models/schedulePickup");
const Company = require("../models/company");
const Payment = require("../models/payment");
const { clearCacheByPattern, clearUserFeedCache } = require("../middlewares/cacheMiddleware");

// ✅ Send pickup request from user to company
pickupRequestRouter.post("/send/:status/:toCompanyId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toCompanyId = req.params.toCompanyId; 
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested", "pending", "accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        const toCompany = await Company.findById(toCompanyId);
        if (!toCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        const existingRequest = await PickupRequest.findOne({ fromUserId, toCompanyId }).sort({ createdAt: -1 });
        if (existingRequest) {
            let canSendAnother = false;

            if (["rejected", "ignored"].includes(existingRequest.status)) {
                canSendAnother = true;
            } else if (existingRequest.status === "picked-up") {
                const completedPayment = await Payment.findOne({
                    pickupRequestId: existingRequest._id,
                    status: "completed",
                });
                if (completedPayment) {
                    canSendAnother = true;
                }
            }

            if (!canSendAnother) {
                return res.status(409).json({
                    message: "Request already sent",
                    status: existingRequest.status,
                });
            }
        }

        const newRequest = new PickupRequest({ fromUserId, toCompanyId, status });
        const data = await newRequest.save();

        //  Clear this user's feed cache (include '/user' prefix so pattern matches actual keys)
        //  original keys look like "__express__/user/feed?...__<userId>"
await clearUserFeedCache(fromUserId.toString());

        res.json({ message: "Pickup request " + status, data });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ Fetch pickup requests for the user
pickupRequestRouter.get("/user/requests/pickup", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;

        const pickupRequests = await PickupRequest.find({
            fromUserId,
            status: { $in: ["interested", "ignored", "pending", "accepted", "rejected", "picked-up"] },
        })
            .populate("fromUserId", "firstName lastName photoUrl age gender about emailId")
            .populate("toCompanyId", "companyName photoUrl about emailId");

        res.json({ data: pickupRequests });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ Fetch pickup requests for the company
pickupRequestRouter.get("/company/requests/pickup", companyAuth, async (req, res) => {
    try {
        const toCompanyId = req.company._id;

        const pickupRequests = await PickupRequest.find({
            toCompanyId,
            status: { $in: ["ignored", "interested", "pending", "accepted", "rejected", "picked-up"] },
        })
            .populate("fromUserId", "firstName lastName photoUrl age gender about emailId")
            .populate("toCompanyId", "companyName photoUrl about emailId");

        res.json({ data: pickupRequests });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ Accept or Reject pickup request (company side)
pickupRequestRouter.post("/review/:status/:requestId", companyAuth, async (req, res) => {
    try {
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected", "interested", "ignored"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        const pickupRequest = await PickupRequest.findOne({
            _id: requestId,
            toCompanyId: req.company._id,
            status: { $in: ["interested", "pending"] } // allow both states to be reviewed
        });

        if (!pickupRequest) {
            return res.status(404).json({ message: "Pickup request not found or not eligible for review." });
        }

        pickupRequest.status = status;
        const data = await pickupRequest.save();

        //  Clear feed cache for that user (ensure '/user' path is included)
await clearUserFeedCache(pickupRequest.fromUserId.toString());

        res.json({ message: `Pickup request ${status}`, data });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ Mark pickup request as "picked-up" (user side)
pickupRequestRouter.post("/mark-picked-up/:requestId", userAuth, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { wasteAmount, wasteWeight } = req.body;

        const pickupRequest = await PickupRequest.findOne({
            _id: requestId,
            fromUserId: req.user._id,
            status: "accepted" // Only accepted requests can be marked as picked up
        });

        if (!pickupRequest) {
            return res.status(404).json({ 
                message: "Pickup request not found or not eligible to be marked as picked up." 
            });
        }

        pickupRequest.status = "picked-up";
        if (wasteAmount) pickupRequest.wasteAmount = wasteAmount;
        if (wasteWeight) pickupRequest.wasteWeight = wasteWeight;
        const data = await pickupRequest.save();

        //  Clear feed cache
await clearUserFeedCache(pickupRequest.fromUserId.toString());

        res.json({ message: "Pickup request marked as picked up", data });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ Fetch all pickup requests (admin/debug purpose)
pickupRequestRouter.get("/all/requests", async (req, res) => {
    try {
        const allRequests = await PickupRequest.find()
            .populate("fromUserId", "firstName lastName photoUrl age gender about emailId")
            .populate("toCompanyId", "companyName photoUrl about emailId");

        res.json({ data: allRequests });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// ✅ Update pickup request status (user side)
pickupRequestRouter.post("/update-status/:status/:requestId", userAuth, async (req, res) => {
    try {
        const { status, requestId } = req.params;
        const allowedStatus = ["ignored", "interested", "pending", "accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        const pickupRequest = await PickupRequest.findOne({
            _id: requestId,
            fromUserId: req.user._id,
            status: { $in: ["ignored", "interested"] },
        });

        if (!pickupRequest) {
            return res.status(404).json({ message: "Pickup request not found or not eligible for update." });
        }

        pickupRequest.status = status;
        const data = await pickupRequest.save();

        //  Clear feed cache
await clearUserFeedCache(req.user._id.toString());

        res.json({ message: `Pickup request updated to ${status}`, data });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = pickupRequestRouter;