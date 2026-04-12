import React from 'react';
import YouTubePlayer from './YouTubePlayer';
import VideoPlayer from './VideoPlayer';

const VideoCard = ({ 
  video, 
  isLiked, 
  alreadyFriends, 
  likesCount, 
  isOwnVideo, 
  handleLikeToggle, 
  handleChat, 
  handleInterest 
}) => {
  // Determine if it's an uploaded HLS video or a YouTube URL
  const isUpload = video.type === 'upload';
  
  // Safely inject resolutions for old DB records that didn't have the transformation
  let safeStreamingUrl = video.streamingUrl;
  if (safeStreamingUrl && safeStreamingUrl.endsWith('.m3u8')) {
    safeStreamingUrl += '?tr=sr-360_480_720';
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-102 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      
      {/* Video Player Section */}
      {isUpload ? (
        <VideoPlayer streamingUrl={safeStreamingUrl} poster={video.thumbnailUrl} />
      ) : (
        <YouTubePlayer youtubeUrl={video.youtubeUrl} title={video.title} />
      )}

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{video.title}</h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{video.description}</p>
        
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <div className="flex items-center mr-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center text-white font-bold mr-3">
              {video.userId.firstName.charAt(0)}{video.userId.lastName.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {video.userId.firstName} {video.userId.lastName}
            </span>
          </div>
          <div className="ml-auto">
            <button
              className={`px-3 py-2 rounded-lg border transition-all duration-300 flex items-center shadow-sm ${
                isLiked
                  ? 'bg-pink-50 text-pink-600 border-pink-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleLikeToggle(video)}
            >
              <svg
                className={`w-4 h-4 mr-1 ${isLiked ? 'text-pink-500 fill-current' : ''}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </button>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="mt-2 text-sm">
          <div className="flex flex-wrap gap-2 w-full">
            {isOwnVideo ? (
              <div className="flex-1 flex items-center justify-center text-white bg-gradient-to-r from-teal-500 to-green-500 py-2 px-3 rounded-lg shadow-md">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4 0-7 2-7 4v1c0 .552.448 1 1 1h12c.552 0 1-.448 1-1v-1c0-2-3-4-7-4z" />
                </svg>
                <span className="font-medium tracking-wide">Your video</span>
              </div>
            ) : alreadyFriends ? (
              <button
                className="px-4 py-2 bg-white text-teal-600 border border-teal-200 hover:bg-teal-50 rounded-lg transition-all duration-300 flex-1 flex items-center justify-center shadow-sm font-medium"
                onClick={() => handleChat(video.userId._id)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 1.657-1.79 3-4 3-.447 0-.875-.074-1.268-.21L12 17l-1.732-1.21A4.862 4.862 0 019 15c-2.21 0-4-1.343-4-3s1.79-3 4-3h8c2.21 0 4 1.343 4 3z" />
                </svg>
                Chat
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-lg transition-all duration-300 flex-1 flex items-center justify-center shadow-sm"
                onClick={() => handleInterest('interested', video.userId._id)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
