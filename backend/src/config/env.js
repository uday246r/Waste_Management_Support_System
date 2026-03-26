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
    process.env.CLIENT_URL ||
    "http://localhost:5173",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

env.HAS_RAZORPAY_CREDENTIALS = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
);

module.exports = env;

