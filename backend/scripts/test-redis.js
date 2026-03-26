require('dotenv').config();
const redisClient = require('../src/config/redis');

(async () => {
    try {
        await redisClient.connect();

        await redisClient.set('test_key', 'Redis is working!');
        const value = await redisClient.get('test_key');

        console.log('✅ Retrieved:', value);

        await redisClient.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Redis Test Failed:', err);
        process.exit(1);
    }
})();
