const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
	if (!MONGO_URI) {
		console.error('MONGO_URI is not defined. Please set it in your .env or env/.env file.');
		return;
	}

	try {
		await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB connected');
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err.message || err);
		// Re-throw so process can decide (or exit) if desired
		throw err;
	}
};

module.exports = connectDB;
