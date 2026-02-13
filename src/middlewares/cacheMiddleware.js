const redisClient = require('../config/redis');

const cache = (duration) => {
    return async (req, res, next) => {
        // Construct a unique key for the cache
        // If user is logged in, include their ID to scope the cache (e.g., for personalized feeds)
        // Otherwise, just use the URL
        let key = '__express__' + req.originalUrl || req.url;

        if (req.user && req.user._id) {
            key += `__${req.user._id.toString()}`;
        }

        try {
            const cachedBody = await redisClient.get(key);
            if (cachedBody) {
                // console.log(`Cache hit for ${key}`);
                return res.json(JSON.parse(cachedBody));
            } else {
                // console.log(`Cache miss for ${key}`);
                res.sendResponse = res.json;
                res.json = (body) => {
                    redisClient.setEx(key, duration, JSON.stringify(body));
                    res.sendResponse(body);
                };
                next();
            }
        } catch (err) {
            console.error("Redis Cache Error:", err);
            next(); // Determine if we should fail or just bypass cache. Bypassing is safer.
        }
    }
}

module.exports = cache;
