const express = require('express');
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// requestRouter.post("/sendConnectionRequest",userAuth,  async(req,res) => {
//     const user = req.user;
//     console.log("Sending connection request");
//     res.send(user.firstName + "sent the connect request!");
// });

requestRouter.post(
  "/send/:status/:toUserId",  // This is where you're sending the connection request
  userAuth,
  async (req, res) => {
      try {
          const fromUserId = req.user._id;
          const toUserId = req.params.toUserId;
          const status = req.params.status;

          const allowedStatus = ["ignored", "interested"];
          
          if (!allowedStatus.includes(status)) {
              return res.status(400).json({ message: "Invalid status type: " + status });
          }

          // Check if the user exists
          const toUser = await User.findById(toUserId);
        //   console.log(toUser);
          if (!toUser) {
              return res.status(404).json({ message: "User not found - tfu" });
          }

          // Check for existing connection request
          const existingConnectionRequest = await ConnectionRequest.findOne({
              $or: [
                  { fromUserId, toUserId },
                  { fromUserId: toUserId, toUserId: fromUserId },
              ],
          });

          if (existingConnectionRequest) {
              if (existingConnectionRequest.status === "accepted") {
                  return res.status(200).json({
                      message: "Already friends",
                      status: "accepted",
                  });
              }

              return res.status(409).json({
                  message: "Request already sent",
                  status: existingConnectionRequest.status,
              });
          }

          // Create a new connection request
          const connectionRequest = new ConnectionRequest({
              fromUserId,
              toUserId,
              status,
          });

          const data = await connectionRequest.save();

          res.json({
              message: req.user.firstName + " is " + status + " in " + toUser.firstName,
              data,
          });

      } catch (err) {
          res.status(400).send("ERROR: " + err.message);
      }
  }
);


requestRouter.post(
    "/review/:status/:requestId",
    userAuth,
    async(req,res) => {
        try{
            const loggedInUser = req.user;
            const { status, requestId } = req.params;

            const allowedStatus = ["accepted", "rejected"];
            if(!allowedStatus.includes(status)){
                return res.status(400).json({ message: "Status not allowed!" });
            }

            const connectionRequest = await ConnectionRequest.findOne({
                _id: requestId,
                toUserId: loggedInUser._id,
                status: "interested",
            });

            if(!connectionRequest){
                return res
                .status(404)
                .json({ message: "Connection request not found" });
            }

            connectionRequest.status = status;

            const data = await connectionRequest.save();

            res.json({ message: "Connection request " + status, data });
            
            // validate the status
            // loggedInUser = toUserId
            // status = interested
            // request id should be valid
              
        } catch(err){
            res.status(400).send("ERROR: " + err);
        }
    }

)
 

module.exports = requestRouter;

