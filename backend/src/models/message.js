const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for faster queries
messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;




