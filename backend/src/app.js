const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./utils/socket");
const connectDB = require("./config/database");
const {
   CLIENT_URL,
   PORT,
   GLOBAL_RATE_LIMIT_ENABLED,
   GLOBAL_RATE_LIMIT_MAX,
   GLOBAL_RATE_LIMIT_WINDOW_SEC,
} = require("./config/env");
const app = express();

// Render / reverse proxies: trust X-Forwarded-For so req.ip is the real client (avoids one shared rate-limit bucket for everyone).
app.set("trust proxy", 1);

// Middlewares
app.use(
   cors({
      origin: function (origin, callback) {
         const allowedOrigins = [
            "http://localhost:5173",
            "https://wmss-uta.vercel.app"
         ];
         
         if (CLIENT_URL) {
            // Support comma-separated URLs in CLIENT_URL
            allowedOrigins.push(...CLIENT_URL.split(',').map(url => url.trim()));
         }

         if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            callback(new Error("Not allowed by CORS"));
         }
      },
      credentials: true,
      exposedHeaders: [
         "Retry-After",
         "X-RateLimit-Limit",
         "X-RateLimit-Remaining",
         "X-RateLimit-Reset",
      ],
   })
);
app.use(express.json());
app.use(cookieParser());

const rateLimiter = require("./middlewares/rateLimiter");
if (GLOBAL_RATE_LIMIT_ENABLED) {
   app.use(
      rateLimiter({
         strategy: "sliding_window",
         limit: GLOBAL_RATE_LIMIT_MAX,
         window: GLOBAL_RATE_LIMIT_WINDOW_SEC,
         keyPrefix: "global",
      })
   );
}

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
// const gateRouter = require("./routes/gate");
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
// app.use("/api/gate", gateRouter);

const server = http.createServer(app);
initalizedSocket(server);

// Connect to DB and start server
const { cacheRedisClient } = require("./config/redis");

const startServer = async () => {
   try {
      await connectDB();
      console.log("Database connection established....");

      await cacheRedisClient.connect();
      // console.log("Redis connection established....");

      server.listen(PORT, () => {
         console.log(`Server successfully running on port ${PORT}....`);
      });
   } catch (err) {
      console.log("Error starting server:", err);
   }
};

startServer();
