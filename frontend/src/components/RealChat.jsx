import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createSocketConnection } from '../utils/socket';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const RealChat = () => {
    const {connectionId} = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const user = useSelector(Store=>Store.user);
    const userId = user?._id;
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesLoadedRef = useRef(false);

    const scrollToBottom = (smooth = false) => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
            block: "end",
        });
    };

    useEffect(() => {
        scrollToBottom(true);
    }, [messages]);

    // Handle page unload (browser close, refresh, navigation)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if(socketRef.current && socketRef.current.connected) {
                // Emit leaveChat before page unloads
                socketRef.current.emit("leaveChat", {
                    userId,
                    connectionId
                });
                // Note: disconnect() might not complete before page unloads
                // but leaveChat event should still be processed
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [userId, connectionId]);

    // Fetch previous messages from database
    useEffect(() => {
        const fetchMessages = async () => {
            if(!userId || !connectionId) return;
            
            try {
                setLoading(true);
                messagesLoadedRef.current = false;
                const res = await axios.get(BASE_URL + `/messages/${connectionId}`, {
                    withCredentials: true
                });
                
                if(res.data && res.data.data) {
                    const formattedMessages = res.data.data.map(msg => ({
                        firstName: msg.firstName,
                        text: msg.text,
                        userId: msg.senderId ? msg.senderId.toString() : msg.senderId,
                        timestamp: new Date(msg.createdAt)
                    }));
                    setMessages(formattedMessages);
                    messagesLoadedRef.current = true;
                }
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            } finally {
                setLoading(false);
            }
        };

        if(userId && connectionId) {
            fetchMessages();
        }

        return () => {
            messagesLoadedRef.current = false;
        };
    }, [userId, connectionId]);

    useEffect(()=>{
        if(!userId || !user || !user.firstName) return;

        const socket = createSocketConnection();
        socketRef.current = socket;
        
        // Connection event handlers
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            // Join chat after connection is established
            socket.emit("joinChat", {
                firstName: user.firstName,
                userId, 
                connectionId
            });
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        socket.on("reconnect_attempt", (attemptNumber) => {
            console.log("Attempting to reconnect... Attempt", attemptNumber);
        });

        socket.on("reconnect", (attemptNumber) => {
            console.log("Socket reconnected after", attemptNumber, "attempts");
            // Rejoin chat after reconnection
            socket.emit("joinChat", {
                firstName: user.firstName,
                userId, 
                connectionId
            });
        });

        socket.on("reconnect_error", (error) => {
            console.error("Reconnection error:", error);
        });

        socket.on("reconnect_failed", () => {
            console.error("Failed to reconnect after all attempts");
        });

        // Join chat (if already connected)
        if(socket.connected) {
            socket.emit("joinChat", {
                firstName: user.firstName,
                userId, 
                connectionId
            });
        }

        socket.on("messageReceived", ({firstName, text, userId: senderId, timestamp})=>{
            console.log(firstName + " : "+ text);
            
            // Prevent duplicate messages by checking if message already exists
            setMessages((prevMessages) => {
                const senderIdStr = senderId ? senderId.toString() : senderId;
                const currentTime = timestamp ? new Date(timestamp) : new Date();
                
                // Check if this message already exists (same text, sender, and within last 5 seconds)
                const messageExists = prevMessages.some(msg => {
                    const msgTime = new Date(msg.timestamp);
                    const timeDiff = Math.abs(currentTime - msgTime);
                    return msg.text === text && 
                           msg.userId && senderIdStr &&
                           msg.userId.toString() === senderIdStr.toString() &&
                           msg.firstName === firstName &&
                           timeDiff < 5000;
                });
                
                if(messageExists) {
                    return prevMessages;
                }
                
                return [...prevMessages, {
                    firstName, 
                    text, 
                    userId: senderIdStr, 
                    timestamp: currentTime
                }];
            });
            scrollToBottom(true);
        });

        socket.on("userJoined", ({userId: joinedUserId, firstName: joinedFirstName}) => {
            console.log(`${joinedFirstName} joined the chat`);
        });

        socket.on("userLeft", ({userId: leftUserId, reason}) => {
            console.log(`User ${leftUserId} left the chat. Reason: ${reason || 'unknown'}`);
        });

        // Cleanup function
        return () => {
            const socketToCleanup = socketRef.current;
            if(socketToCleanup) {
                try {
                    // Emit leaveChat before disconnecting (if connected)
                    if(socketToCleanup.connected) {
                        socketToCleanup.emit("leaveChat", {
                            userId,
                            connectionId
                        });
                    }
                    
                    // Remove all event listeners to prevent memory leaks
                    socketToCleanup.off("connect");
                    socketToCleanup.off("disconnect");
                    socketToCleanup.off("connect_error");
                    socketToCleanup.off("reconnect");
                    socketToCleanup.off("reconnect_attempt");
                    socketToCleanup.off("reconnect_error");
                    socketToCleanup.off("reconnect_failed");
                    socketToCleanup.off("messageReceived");
                    socketToCleanup.off("userJoined");
                    socketToCleanup.off("userLeft");
                    
                    // Disconnect socket
                    if(socketToCleanup.connected) {
                        socketToCleanup.disconnect();
                    }
                    socketRef.current = null;
                    console.log("Socket disconnected and cleaned up");
                } catch (error) {
                    console.error("Error during socket cleanup:", error);
                }
            }
        };
    },[userId, connectionId, user?.firstName])

    const sendMessage = () => {
        if(!socketRef.current || !newMessage.trim() || !user || !user.firstName) return;
        
        // Check if socket is connected
        if(!socketRef.current.connected) {
            console.warn("Socket is not connected. Attempting to connect...");
            socketRef.current.connect();
            // Wait a bit for connection, then send
            setTimeout(() => {
                if(socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit("sendMessage", {
                        firstName: user.firstName,
                        userId,
                        connectionId,
                        text: newMessage,
                    });
                    setNewMessage("");
                } else {
                    console.error("Failed to connect socket. Message not sent.");
                }
            }, 500);
            return;
        }
        
        socketRef.current.emit("sendMessage", {
            firstName: user.firstName,
            userId,
            connectionId,
            text: newMessage,
        });
        setNewMessage("");
        setTimeout(() => scrollToBottom(true), 50);
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

  return (
    <div className="min-h-screen bg-teal-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg h-[80vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4 rounded-t-lg">
                    <h1 className="text-2xl font-bold text-white">Chat</h1>
                    <p className="text-teal-100 text-sm mt-1">Conversation</p>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, index) => {
                                const isCurrentUser = msg.userId && userId && msg.userId.toString() === userId.toString();
                                return (
                                    <div
                                        key={index}
                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex flex-col max-w-xs lg:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                            {!isCurrentUser && (
                                                <span className="text-xs text-gray-500 mb-1 px-2">{msg.firstName}</span>
                                            )}
                                            <div
                                                className={`rounded-lg px-4 py-2 ${
                                                    isCurrentUser
                                                        ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white'
                                                        : 'bg-white text-gray-800 border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm break-words">{msg.text}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 mt-1 px-2">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Container */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RealChat