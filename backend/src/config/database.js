const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
	if (!MONGO_URI) {
		console.error('MONGO_URI is not defined. Please set it in your .env or env/.env file.');
		return;
	}

	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGO_URI, {}).then((mongooseInstance) => {
			console.log('MongoDB connected');
			return mongooseInstance;
		});
	}

	try {
		cached.conn = await cached.promise;
		return cached.conn;
	} catch (err) {
		cached.promise = null;
		console.error('Failed to connect to MongoDB:', err.message || err);
		throw err;
	}
};

module.exports = connectDB;
