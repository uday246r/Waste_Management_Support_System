const socket = require("socket.io");
const Message = require("../models/message");
const { SOCKET_ORIGIN } = require("../config/env");

const initalizedSocket = (server) =>{
    const io = socket(server,{
        cors:{
            origin: SOCKET_ORIGIN,
        },
    });

    io.on("connection", (socket)=>{
        console.log("User connected:", socket.id);

        socket.on("joinChat",({ firstName, userId, connectionId})=>{
            const roomId = [userId, connectionId].sort().join("_");
            socket.join(roomId);
            console.log(`${firstName} joined Room: ${roomId}`);
        });

        socket.on("sendMessage", async ({firstName, userId, connectionId, text})=>{
            const roomId = [userId, connectionId].sort().join("_");
            
            const newMessage = new Message({
                senderId: userId,
                receiverId: connectionId,
                text: text,
                firstName: firstName,
                roomId: roomId
            });
            
            const savedMessage = await newMessage.save();
            
            io.to(roomId).emit("messageReceived", { 
                firstName, 
                text, 
                userId: userId.toString(),
                timestamp: savedMessage.createdAt
            });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

module.exports = initalizedSocket;