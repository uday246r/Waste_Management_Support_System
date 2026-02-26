
const redisClient = require('../config/redis');

/**
 * Generate standardized cache key
 */
const generateCacheKey = (req) => {
    let key = `__express__${req.originalUrl}`;

    if (req.user && req.user._id) {
        key += `__${req.user._id.toString()}`;
    }

    return key;
};


/**
 * Cache middleware (Cache-Aside Pattern)
 */
const cache = (duration) => {
    return async (req, res, next) => {
        const key = generateCacheKey(req);

        try {
            const cachedBody = await redisClient.get(key);

            if (cachedBody) {
                console.log(` Cache HIT: ${key}`);
                return res.json(JSON.parse(cachedBody));
            }

            console.log(` Cache MISS: ${key}`);

            res.sendResponse = res.json;
            res.json = async (body) => {
                await redisClient.setEx(key, duration, JSON.stringify(body));
                res.sendResponse(body);
            };

            next();
        } catch (err) {
            console.error("Redis Cache Error:", err);
            next(); // Fail gracefully
        }
    };
};

/**
 * Invalidate cache by pattern
 */
const clearCacheByPattern = async (pattern) => {
    try {
        const stream = redisClient.scanIterator({
            MATCH: pattern,
            COUNT: 100
        });

        for await (const key of stream) {
            await redisClient.del(key);
            console.log("Deleted key:", key);
        }

    } catch (err) {
        console.error("Error clearing cache:", err);
    }
};

// helper specialized for feed endpoints scoped to a user
const clearUserFeedCache = async (userId) => {
    if (!userId) return;
    // pattern includes optional query string after /user/feed
    const pattern = `__express__/user/feed*__${userId}`;
    await clearCacheByPattern(pattern);
};

module.exports = {
    cache,
    clearCacheByPattern,
    clearUserFeedCache,
};

