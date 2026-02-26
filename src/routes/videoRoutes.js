const express = require('express');
const videoRouter = express.Router();
const Video = require('../models/Video');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');
const { cache, clearCacheByPattern } = require("../middlewares/cacheMiddleware");


// POST /videos/upload
videoRouter.post('/upload', userAuth, async (req, res) => {
  const { title, description, youtubeUrl } = req.body;

  // Validate inputs
  if (!title || !youtubeUrl) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  try {
    const embedUrl = youtubeUrl.replace("watch?v=", "embed/"); // Convert URL to embed format

    // Create new video document
    const newVideo = new Video({
      title,
      description,
      youtubeUrl: embedUrl,
      userId: req.user._id,  // User ID
      userName: req.user.firstName + " " + req.user.lastName,  // Add user's full name
      likes: [],
    });

    // Save video
    await newVideo.save();

    // Clear all video feed caches
  await clearCacheByPattern(`__express__/videos*`);

    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload video', error: err.message });
  }
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
