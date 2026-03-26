const express = require('express');
const companyRouter = express.Router();
const { companyAuth } = require("../middlewares/companyAuth");
const PickupRequest = require('../models/schedulePickup');
const Video = require('../models/Video');

// const { companyFeedController } = require('../controllers/companyController');

companyRouter.get('/feed', companyAuth, async (req, res) => {
    try {
        const companyId = req.company._id;

        const statusAggregation = await PickupRequest.aggregate([
            { $match: { toCompanyId: companyId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statusTemplate = {
            totalPickupRequests: 0,
            pendingPickupRequests: 0,
            acceptedPickupRequests: 0,
            rejectedPickupRequests: 0,
            pickedUpPickupRequests: 0,
            interestedPickupRequests: 0,
            ignoredPickupRequests: 0,
        };

        statusAggregation.forEach(({ _id, count }) => {
            statusTemplate.totalPickupRequests += count;
            if (_id === 'pending') statusTemplate.pendingPickupRequests = count;
            if (_id === 'accepted') statusTemplate.acceptedPickupRequests = count;
            if (_id === 'rejected') statusTemplate.rejectedPickupRequests = count;
            if (_id === 'picked-up') statusTemplate.pickedUpPickupRequests = count;
            if (_id === 'interested') statusTemplate.interestedPickupRequests = count;
            if (_id === 'ignored') statusTemplate.ignoredPickupRequests = count;
        });

        const diyVideos = await Video.countDocuments({ userId: companyId });
        const recentRequests = await PickupRequest.find({ toCompanyId: companyId })
            .sort({ createdAt: -1 })
            .limit(250)
            .select("_id status createdAt updatedAt");

        const analyticsPayload = {
            ...statusTemplate,
            diyVideos,
        };

        res.status(200).json({
            ...analyticsPayload,
            company: {
                _id: companyId,
                companyName: req.company.companyName,
                wasteType: req.company.wasteType,
                location: req.company.location,
            },
            analytics: analyticsPayload,
            recentRequests,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = companyRouter;


// try {
//         const loggedInUser = req.user;

//         const page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 10;
//         limit = limit > 50 ? 50 : limit;
//         const skip = (page - 1) * limit;

//         // Find all pickup requests made by this user
//         const pickupRequests = await PickupRequest.find({
//             fromUserId: loggedInUser._id
//         }).select("toCompanyId");

//         const hideCompanyIds = new Set(pickupRequests.map(req => req.toCompanyId.toString()));
//         // console.log("Hide Company IDs:", Array.from(hideCompanyIds));

//         // Get companies that the user hasn't requested pickups from
//         const companies = await Company.find({
//             _id: { $nin: Array.from(hideCompanyIds) }
//         })
//         .select("companyName photoUrl wasteType pickupTimeFrom pickupTimeTo location about price")
//         .skip(skip)
//         .limit(limit);

//         // console.log("Fetched Companies:", companies);

//         res.json({ data: companies });
//     } catch (err) {
//         console.error("Error fetching feed data:", err);
//         res.status(400).json({ message: err.message });
//     }