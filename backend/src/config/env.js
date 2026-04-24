const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const possibleEnvFiles = [
  // path.resolve(__dirname, "../../env/.env"),
  path.resolve(__dirname, "../../.env"),
];

const envFile = possibleEnvFiles.find((filePath) => fs.existsSync(filePath));
if (envFile) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  GATE_ADMIN_EMAIL: process.env.GATE_ADMIN_EMAIL || "udaychauhan246r@gmail.com",
  SOCKET_ORIGIN:
    process.env.SOCKET_ORIGIN ||
    (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : ["http://localhost:5173", "http://127.0.0.1:5173", "https://wmss-uta.vercel.app"]),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GLOBAL_RATE_LIMIT_ENABLED: process.env.GLOBAL_RATE_LIMIT_ENABLED === "true",
  GLOBAL_RATE_LIMIT_MAX: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX || "500", 10),
  GLOBAL_RATE_LIMIT_WINDOW_SEC: parseInt(
    process.env.GLOBAL_RATE_LIMIT_WINDOW_SEC || "60",
    10
  ),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
};

env.HAS_RAZORPAY_CREDENTIALS = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
);

module.exports = env;

