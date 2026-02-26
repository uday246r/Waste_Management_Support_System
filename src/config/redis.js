const redis = require('redis');
require('dotenv').config(); // load once, globally

if (!process.env.REDIS_URL) {
    throw new Error(' REDIS_URL is missing in .env');
}

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: process.env.REDIS_URL.startsWith('rediss://'),
        rejectUnauthorized: false
    }
});

redisClient.on('connect', () => {
    console.log(' Redis Client Connected');
});

redisClient.on('error', (err) => {
    console.error(' Redis Client Error:', err);
});

module.exports = redisClient;
