const { rateLimitRedisClient } = require('../config/redis');

// Register lua script for atomic token bucket
rateLimitRedisClient.defineCommand('tokenBucket', {
    numberOfKeys: 2,
    lua: `
        local tokens_key = KEYS[1]
        local timestamp_key = KEYS[2]
        
        local rate = tonumber(ARGV[1])
        local capacity = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local requested = 1
        
        local last_tokens = tonumber(redis.call("get", tokens_key))
        if last_tokens == nil then
            last_tokens = capacity
        end
        
        local last_refreshed = tonumber(redis.call("get", timestamp_key))
        if last_refreshed == nil then
            last_refreshed = now
        end
        
        local delta = math.max(0, now - last_refreshed)
        local filled_tokens = math.min(capacity, last_tokens + (delta * rate))
        
        local allowed = filled_tokens >= requested
        local new_tokens = filled_tokens
        if allowed then
            new_tokens = filled_tokens - requested
            redis.call("setex", timestamp_key, math.ceil(capacity / rate), now)
            redis.call("setex", tokens_key, math.ceil(capacity / rate), new_tokens)
        end
        
        return { allowed and 1 or 0, new_tokens }
    `
});

/**
 * Rate Limiter Middleware Factory
 * Supports "sliding_window" and "token_bucket" strategies
 */
const rateLimiter = ({ strategy, limit, window, keyPrefix }) => {
    return async (req, res, next) => {
        try {
            const identifier = (req.user && req.user._id) ? req.user._id.toString() : req.ip;
            const prefix = keyPrefix ? `ratelimit:${strategy}:${keyPrefix}` : `ratelimit:${strategy}:${req.baseUrl || req.path}`;
            const key = `${prefix}:${identifier}`;
            const now = Date.now();

            if (strategy === 'sliding_window') {
                const windowStart = now - (window * 1000);

                const results = await rateLimitRedisClient.multi()
                    .zremrangebyscore(key, '-inf', windowStart)
                    .zadd(key, now, `${now}-${Math.random()}`)
                    .zcard(key)
                    .expire(key, window)
                    .exec();

                const requestCount = results[2][1];
                const allowed = requestCount <= limit;
                const remaining = Math.max(0, limit - requestCount);

                const oldestPair = await rateLimitRedisClient.zrange(key, 0, 0, 'WITHSCORES');
                const oldestTs = oldestPair.length >= 2 ? Number(oldestPair[1]) : now;
                const resetAtUnix = Math.ceil((oldestTs + window * 1000) / 1000);

                res.setHeader('X-RateLimit-Limit', String(limit));
                res.setHeader('X-RateLimit-Remaining', String(allowed ? remaining : 0));
                res.setHeader('X-RateLimit-Reset', String(resetAtUnix));

                if (!allowed) {
                    const retryAfterSec = Math.max(
                        1,
                        Math.ceil((oldestTs + window * 1000 - now) / 1000)
                    );
                    res.setHeader('Retry-After', String(retryAfterSec));
                    await rateLimitRedisClient.zremrangebyrank(key, -1, -1);
                    return res.status(429).json({
                        success: false,
                        message: 'Too many requests. Try again later.',
                        retryAfter: retryAfterSec,
                    });
                }

                return next();
            }

            if (strategy === 'token_bucket') {
                const tokensKey = `${key}:tokens`;
                const timestampKey = `${key}:timestamp`;
                const rate = limit / (window * 1000);

                const result = await rateLimitRedisClient.tokenBucket(
                    tokensKey,
                    timestampKey,
                    rate,
                    limit,
                    now
                );

                const allowed = result[0] === 1;
                const remaining = Math.floor(result[1]);
                const resetAtUnix = Math.ceil((now + window * 1000) / 1000);

                res.setHeader('X-RateLimit-Limit', String(limit));
                res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)));
                res.setHeader('X-RateLimit-Reset', String(resetAtUnix));

                if (!allowed) {
                    const retryAfterSec = Math.max(1, Math.ceil(window / limit));
                    res.setHeader('Retry-After', String(retryAfterSec));
                    return res.status(429).json({
                        success: false,
                        message: 'Too many requests. Try again later.',
                        retryAfter: retryAfterSec,
                    });
                }

                return next();
            }

            throw new Error(`Unknown rate limit strategy: ${strategy}`);
        } catch (err) {
            console.error('Rate Limiter Error:', err);
            next();
        }
    };
};

module.exports = rateLimiter;
