// routes/user.js
const express = require('express');
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const Company = require('../models/company');
const PickupRequest = require('../models/schedulePickup');
const Payment = require('../models/payment');
const { cache, clearCacheByPattern } = require("../middlewares/cacheMiddleware");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender emailId about skills";

// Get received connection requests
userRouter.get("/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({
            message: "Data fetched successfully",
            data: connectionRequests,
        });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Get accepted connections
userRouter.get("/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" },
            ],
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({ data });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});


//  UPDATED: Show companies on user feed
// routes/user.js
userRouter.get("/feed", userAuth, cache(300), async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        // Find all pickup requests made by this user
        const pickupRequests = await PickupRequest.find({
            fromUserId: loggedInUser._id
        }).select("_id toCompanyId status");

        const pickupIds = pickupRequests.map(req => req._id);

        // Find payments associated with these pickup requests
        const payments = await Payment.find({
            pickupRequestId: { $in: pickupIds }
        }).select("pickupRequestId status");

        const paymentStatusByPickup = new Map();
        payments.forEach(p => {
            const key = p.pickupRequestId.toString();
            if (!paymentStatusByPickup.has(key)) {
                paymentStatusByPickup.set(key, p.status);
            }
        });

        // Hide companies where there is at least one pickup
        // that is not fully completed and paid.
        const hideCompanyIds = new Set();
        pickupRequests.forEach(req => {
            const pickupId = req._id.toString();
            const paymentStatus = paymentStatusByPickup.get(pickupId);

            const isPaid = paymentStatus === "completed";
            const isPickupDone = req.status === "picked-up" && isPaid;

            if (!isPickupDone) {
                hideCompanyIds.add(req.toCompanyId.toString());
            }
        });

        // Get companies that the user doesn't currently have an active/unpaid pickup with
        const companies = await Company.find({
            _id: { $nin: Array.from(hideCompanyIds) }
        })
            .select("companyName photoUrl wasteType pickupTimeFrom pickupTimeTo location about price")
            .skip(skip)
            .limit(limit);

        // console.log("Fetched Companies:", companies);

        res.json({ data: companies });
    } catch (err) {
        console.error("Error fetching feed data:", err);
        res.status(400).json({ message: err.message });
    }
});



module.exports = userRouter;
