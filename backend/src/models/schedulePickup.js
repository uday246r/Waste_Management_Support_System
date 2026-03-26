const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    toCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'interested', 'ignored', 'accepted', 'rejected', 'picked-up'],
        default: 'pending',
    },
    wasteAmount: {
        type: Number,
        default: 0,
    },
    wasteWeight: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

module.exports = PickupRequest;
