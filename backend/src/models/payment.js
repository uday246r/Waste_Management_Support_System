const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    pickupRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PickupRequest',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    accountNumber: {
        type: String,
    },
    upiId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    razorpayOrderId: {
        type: String,
    },
    razorpayPaymentId: {
        type: String,
    },
    razorpaySignature: {
        type: String,
    },
    transferMethod: {
        type: String,
        enum: ['razorpay_payout', 'manual', 'razorpay_payment'],
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

