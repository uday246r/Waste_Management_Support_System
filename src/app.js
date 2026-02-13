const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./utils/socket");
const connectDB = require("./config/database");
const {
   CLIENT_URL,
   PORT,
} = require("./config/env");
const app = express();
// Middlewares
app.use(
   cors({
      origin: CLIENT_URL, // frontend URL
      credentials: true,
   })
);
app.use(express.json());
app.use(cookieParser());

// Import Routes
const authRouter = require("./routes/auth");
const companyAuthRouter = require("./routes/companyRoutes");
const profileRouter = require("./routes/profile");
const companyProfileRouter = require("./routes/companyProfile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const companyRouter = require("./routes/company");
const videoRouter = require("./routes/videoRoutes"); // ✅ NEW
const pickupRequestRouter = require("./routes/scheduleRequest");
const messageRouter = require("./routes/message");
const paymentRouter = require("./routes/payment");
const gateRouter = require("./routes/gate");
const initalizedSocket = require('./utils/socket');


// Use Routes
app.use("/auth/user", authRouter);
app.use("/auth/company", companyAuthRouter);
app.use("/profile", profileRouter);
app.use("/companyProfile", companyProfileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/videos", videoRouter);
app.use("/pickup", pickupRequestRouter);
app.use("/messages", messageRouter);
app.use("/payment", paymentRouter);
app.use("/api/gate", gateRouter);

const server = http.createServer(app);
initalizedSocket(server);

// Connect to DB and start server
const redisClient = require("./config/redis");

const startServer = async () => {
   try {
      await connectDB();
      console.log("Database connection established....");

      await redisClient.connect();
      // console.log("Redis connection established....");

      server.listen(PORT, () => {
         console.log(`Server successfully running on port ${PORT}....`);
      });
   } catch (err) {
      console.log("Error starting server:", err);
   }
};

startServer();
