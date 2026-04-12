const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['upload', 'youtube'], 
    default: 'youtube',
    required: true
  },
  videoUrl: { type: String }, // For direct file uploads
  streamingUrl: { type: String }, // For HLS streaming
  youtubeUrl: { type: String }, // Now optional since it might be an upload
  thumbnailUrl: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
