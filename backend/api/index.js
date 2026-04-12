const app = require('../src/app');

// Also ensure database and redis are connected for serverless functions
const connectDB = require('../src/config/database');
const { cacheRedisClient } = require('../src/config/redis');

let isDbConnected = false;

// Export an async handler that ensures DB connection before passing to Express
module.exports = async (req, res) => {
    if (!isDbConnected) {
        try {
            await connectDB();
            if (!cacheRedisClient.isOpen) {
                await cacheRedisClient.connect();
            }
            isDbConnected = true;
        } catch (error) {
            console.error("Vercel Init Error:", error);
            return res.status(500).json({ error: "Failed to initialize background services" });
        }
    }
    return app(req, res);
};
