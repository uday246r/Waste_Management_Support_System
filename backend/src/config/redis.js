const redis = require('redis');
const Redis = require('ioredis');
require('dotenv').config(); // load once, globally

if (!process.env.REDIS_URL) {
    throw new Error(' REDIS_URL is missing in .env');
}

// 1. Existing Upstash Client (redis package)
const cacheRedisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: process.env.REDIS_URL.startsWith('rediss://') || process.env.REDIS_URL.includes('upstash.io'),
        rejectUnauthorized: false
    }
});

cacheRedisClient.on('connect', () => {
    console.log(' Upstash Cache Redis Client Connected');
});

cacheRedisClient.on('error', (err) => {
    console.error(' Upstash Cache Redis Client Error:', err);
});

// 2. New ioredis Client for Rate Limiting / BullMQ (Docker Redis)
const RATE_LIMIT_URL = process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

const isUpstash = RATE_LIMIT_URL.includes('upstash.io');
const tlsOptions = (RATE_LIMIT_URL.startsWith('rediss://') || isUpstash) ? { rejectUnauthorized: false } : undefined;

const rateLimitRedisClient = new Redis(RATE_LIMIT_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: false, // Prevents hanging requests if Redis drops
    tls: tlsOptions,
    retryStrategy(times) {
        // Reconnect after
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

rateLimitRedisClient.on('connect', () => {
    console.log(' Rate Limit (ioredis) Client Connected');
});

rateLimitRedisClient.on('error', (err) => {
    console.error(' Rate Limit (ioredis) Client Error:', err);
});

module.exports = {
    cacheRedisClient,
    rateLimitRedisClient
};
