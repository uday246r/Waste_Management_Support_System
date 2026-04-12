const express = require('express');
const videoRouter = express.Router();
const Video = require('../models/Video');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');
const { cache, clearCacheByPattern } = require("../middlewares/cacheMiddleware");
const rateLimiter = require('../middlewares/rateLimiter');
const multer = require('multer');
const imagekit = require('../config/imagekit');
const env = require('../config/env');

// Set up Multer for memory storage
const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit to match ImageKit limits
});


// POST /videos/youtube
videoRouter.post('/youtube', userAuth, rateLimiter({ strategy: 'token_bucket', limit: 3, window: 60 }), async (req, res) => {
  const { title, description, youtubeUrl } = req.body;

  // Validate inputs
  if (!title || !youtubeUrl) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  try {
    const embedUrl = youtubeUrl.replace("watch?v=", "embed/"); // Convert URL to embed format
    // YouTube thumbnail logic using maxresdefault or hqdefault
    let videoId = "";
    const regex = /(?:youtube\.com\/(?:[^/]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(regex);
    if (match && match[1]) {
      videoId = match[1];
    }
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";

    // Create new video document
    const newVideo = new Video({
      title,
      description,
      type: 'youtube',
      youtubeUrl: embedUrl,
      thumbnailUrl,
      userId: req.user._id,  // User ID
      userName: req.user.firstName + " " + req.user.lastName,  // Add user's full name
      likes: [],
    });

    // Save video
    await newVideo.save();

    // Clear all video feed caches
    await clearCacheByPattern(`__express__/videos*`);

    res.status(201).json({ message: 'Video added successfully', video: newVideo });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add video', error: err.message });
  }
});


// POST /videos/upload
videoRouter.post('/upload', userAuth, rateLimiter({ strategy: 'token_bucket', limit: 3, window: 60 }), (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g. file too large).
      return res.status(400).json({ message: `File upload error: ${err.message}. Please try a smaller file or wait a moment.` });
    } else if (err) {
      // An unknown error occurred.
      return res.status(500).json({ message: 'Unknown upload error', error: err.message });
    }

    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ message: 'Title and Video file are required' });
    }

  try {
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.buffer, // upload from buffer natively as binary for files > 100MB
      fileName: `video-${Date.now()}-${file.originalname}`,
      folder: '/wms_videos',
    });

    const videoUrl = uploadResponse.url;
    // Generate streaming URL with required resolutions (if no resolutions provided, ImageKit throws 400 bad request)
    const streamingUrl = videoUrl + "/ik-master.m3u8?tr=sr-360_480_720";
    const thumbnailUrl = videoUrl + "?tr=so-2"; // capture thumbnail at 2 seconds

    const newVideo = new Video({
      title,
      description,
      type: 'upload',
      videoUrl,
      streamingUrl,
      thumbnailUrl,
      userId: req.user._id,
      userName: req.user.firstName + " " + req.user.lastName,
      likes: [],
    });

    await newVideo.save();
    await clearCacheByPattern(`__express__/videos*`);

      res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
    } catch (err) {
      console.error('ImageKit upload error:', err);
      res.status(500).json({ message: 'Failed to upload video to server', error: err.message });
    }
  });
});


// GET /videos
videoRouter.get('/', userAuth, cache(300), async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();

    // Fetch all videos and include userName with populated userId
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName');

    const participantIds = [
      ...new Set(
        videos
          .map((video) => video?.userId?._id)
          .filter(Boolean)
          .map((id) => id.toString())
          .filter((id) => id !== loggedInUserId)
      ),
    ];

    let connectionStatuses = {};
    if (participantIds.length > 0) {
      const connections = await ConnectionRequest.find({
        $or: [
          { fromUserId: loggedInUserId, toUserId: { $in: participantIds } },
          { fromUserId: { $in: participantIds }, toUserId: loggedInUserId },
        ],
      }).lean();

      connectionStatuses = connections.reduce((acc, connection) => {
        const fromId = connection.fromUserId.toString();
        const toId = connection.toUserId.toString();
        const otherUserId = fromId === loggedInUserId ? toId : fromId;
        acc[otherUserId] = connection.status;
        return acc;
      }, {});
    }

    const formattedVideos = videos.map((video) => {
      const obj = video.toObject();
      const authorId = obj?.userId?._id ? obj.userId._id.toString() : null;
      const requestStatus =
        authorId === loggedInUserId
          ? 'self'
          : connectionStatuses[authorId] || obj.requestStatus || null;

      return {
        ...obj,
        likesCount: obj.likes ? obj.likes.length : 0,
        requestStatus,
        isFriend: requestStatus === 'accepted' || requestStatus === 'friends',
      };
    });

    res.json({ videos: formattedVideos });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
});

// POST /videos/:videoId/like - toggle like
videoRouter.post('/:videoId/like', userAuth, async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (!Array.isArray(video.likes)) {
      video.likes = [];
    }

    const userId = req.user._id.toString();
    const alreadyLiked = video.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    } else {
      video.likes.push(req.user._id);
    }

    await video.save();

    await clearCacheByPattern(`__express__/videos*`);

    return res.json({
      message: alreadyLiked ? 'Like removed' : 'Video liked',
      liked: !alreadyLiked,
      likesCount: video.likes.length,
      videoId: video._id,
      likes: video.likes,
    });
  } catch (err) {
    console.error('Failed to toggle like', err);
    res.status(500).json({ message: 'Failed to toggle like', error: err.message });
  }
});

module.exports = videoRouter;
