const express = require('express');
const messageRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Message = require('../models/message');

// Get messages for a chat room
messageRouter.get("/:connectionId", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id.toString();
        const connectionId = req.params.connectionId;
        
        // Create roomId (same logic as in socket.js)
        const roomId = [loggedInUserId, connectionId].sort().join("_");
        
        // Fetch all messages for this room, sorted by creation time
        const messages = await Message.find({ roomId })
            .sort({ createdAt: 1 })
            .select("senderId receiverId text firstName createdAt");
        
        res.json({
            message: "Messages fetched successfully",
            data: messages
        });
    } catch (err) {
        res.status(400).json({ message: "ERROR: " + err.message });
    }
});

module.exports = messageRouter;




