const fs = require('fs');
const path = require('path');
const redis = require('redis');

// Manually load .env to be 100% sure
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);

if (fs.existsSync(envPath)) {
    console.log('Found .env file');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    // console.log('Raw .env content:', envConfig); // Debugging: Check if file has content

    envConfig.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Join back the rest in case value contains '='
            const value = parts.slice(1).join('=').trim();
            if (key && value) {
                process.env[key] = value;
                if (key === 'REDIS_URL') console.log('Found REDIS_URL in .env');
            }
        }
    });
} else {
    console.error('.env file not found at:', envPath);
}

const redisUrl = process.env.REDIS_URL;
console.log('Redis URL loaded:', redisUrl ? 'Yes (starts with ' + redisUrl.substring(0, 10) + '...)' : 'No');

if (!redisUrl) {
    console.error('REDIS_URL is missing!');
    process.exit(1);
}

const client = redis.createClient({
    url: redisUrl,
    socket: {
        tls: redisUrl.startsWith('rediss://'),
        rejectUnauthorized: false
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try {
        await client.connect();
        console.log('✅ Connected to Redis successfully!');

        await client.set('test_key_direct', 'Working!');
        const val = await client.get('test_key_direct');
        console.log('Got value:', val);

        await client.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
})();
