
const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //reference to user collection
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //reference to user collection
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
},
 {  timestamps: true }
);

// To make queries fast we use concept of index and when write two index simultaneously called compound index as below - internal functioning done by mongoDB - beneficitial if we have billions of record in our database
connectionRequestSchema.index({ fromUserId : 1 , toUserId: 1});

 connectionRequestSchema.pre("save", function (next) {  // don't use arrow function here, arrow function get break when we use "this" with them
    const connectionRequest = this;
    // Check if the fromUserId is same as to toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection request to yourself!");
    }
    next();
});

const ConnectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = ConnectionRequestModel;