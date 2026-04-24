const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./utils/socket");
const connectDB = require("./config/database");
const { cacheRedisClient } = require("./config/redis");
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

// Ensure DB and Redis are connected before processing requests (crucial for Vercel Serverless)
app.use(async (req, res, next) => {
   try {
      await connectDB();
      if (!cacheRedisClient.isOpen) {
         await cacheRedisClient.connect();
      }
      next();
   } catch (err) {
      console.error("Connection Error in Middleware:", err);
      next(err);
   }
});

// Middlewares
app.use(
   cors({
      origin: function (origin, callback) {
         const allowedOrigins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://wmss-uta.vercel.app"
         ];
         
         if (CLIENT_URL) {
            allowedOrigins.push(...CLIENT_URL.split(',').map(url => url.trim()));
         }

         // We avoid throwing an Error because that triggers an immediate 500 in Express,
         // bypassing all our other middleware.
         if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            // Passing false gracefully rejects CORS without crashing the app with 500
            callback(null, false);
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

// Global Error Handler to catch any unexpected crashes and return JSON
app.use((err, req, res, next) => {
   console.error("Unhandled Global Error:", err);
   res.status(500).json({
      success: false,
      message: "Internal Server Error (Caught by Global Handler)",
      error: err.message,
   });
});

const server = http.createServer(app);
initalizedSocket(server);

// Connect to DB and start server
const startServer = async () => {
   try {
      await connectDB();
      console.log("Database connection established....");

      if (!cacheRedisClient.isOpen) {
         await cacheRedisClient.connect();
      }
      // console.log("Redis connection established....");
      
      // On Vercel, we don't start the server manually like this because Vercel handles it via serverless functions.
      // But for local dev, we run `node src/app.js` and this will listen to the port.
      if (process.env.NODE_ENV !== "production") {
          server.listen(PORT, () => {
             console.log(`Server successfully running on port ${PORT}....`);
          });
      }
   } catch (err) {
      console.log("Error starting server:", err);
   }
};

startServer();

// Export the Express app as a Serverless Function for Vercel
module.exports = app;
