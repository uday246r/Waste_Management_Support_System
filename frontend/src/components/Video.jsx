import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromFeed } from '../utils/feedSlice';

const Video = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoList, setVideoList] = useState([]);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // success, error, info
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});
  const videosPerPage = 6;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);
  const currentUserId = currentUser?._id ? currentUser._id.toString() : null;

  // Function to fetch videos from the backend
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/videos`, { withCredentials: true });
      const fetchedVideos = (res?.data?.videos || []).map((video) => {
        const likesArray = video.likes || [];
        const likesCount =
          typeof video.likesCount === 'number' ? video.likesCount : likesArray.length;

        return {
          ...video,
          likes: likesArray,
          likesCount,
          isFriend: isFriendStatus(video.requestStatus),
        };
      });
      setVideoList(fetchedVideos);
    } catch (err) {
      console.error('Error fetching videos', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Function to handle video upload
  const handleUpload = async () => {
    setError('');
    if (!title || !description || !youtubeUrl) {
      setError('All fields are required');
      return;
    }

    try {
      setIsUploading(true);
      const res = await axios.post(
        `${BASE_URL}/videos/upload`,
        {
          title,
          description,
          youtubeUrl,
        },
        { withCredentials: true }
      );

      showNotification('Video uploaded successfully!', 'success');
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setShowUploadForm(false);
      fetchVideos(); // refresh list
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to extract the YouTube video ID
  const getYouTubeVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match && match[1]; // Returns the video ID if match is found
  };

  const getVideoKey = (video, fallbackIndex = 0) =>
    video?._id || video?.id || video?.youtubeUrl || `video-${fallbackIndex}`;

  useEffect(() => {
    if (!videoList.length) {
      setLikedVideos({});
      return;
    }

    setLikedVideos(() => {
      const nextLikesState = {};

      videoList.forEach((video, index) => {
        const key = getVideoKey(video, index);
        const likesArray = video.likes || [];
        const normalizedUserId = currentUserId;
        nextLikesState[key] = normalizedUserId
          ? likesArray.some((id) =>
              (id && id.toString ? id.toString() : id) === normalizedUserId
            )
          : false;
      });

      return nextLikesState;
    });
  }, [videoList, currentUserId]);

  // determine if current request status indicates a friendship
  const isFriendStatus = (status) =>
    ['friends', 'accepted', 'connected', 'approved'].includes(status);

  // Custom toast notification function
  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLikeToggle = async (video) => {
    const videoId = video?._id;
    if (!videoId) {
      showNotification('Unable to like this video', 'error');
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/videos/${videoId}/like`,
        {},
        { withCredentials: true }
      );

      const { liked, likesCount, likes } = res.data;
      const videoKey = getVideoKey(video);

      setLikedVideos((prev) => ({
        ...prev,
        [videoKey]: liked,
      }));

      setVideoList((prevList) =>
        prevList.map((item) =>
          item._id === videoId
            ? {
                ...item,
                likesCount: typeof likesCount === 'number' ? likesCount : item.likesCount,
                likes: Array.isArray(likes) ? likes : item.likes,
              }
            : item
        )
      );
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to update like';
      showNotification(errorMsg, 'error');
    }
  };

  const handleChat = (userId) => {
    if (!userId) {
      showNotification('Unable to open chat for this user', 'error');
      return;
    }

    navigate(`/connections/chat/${userId}`);
  };

  // Handle "Interested" or "Ignore" actions
  const handleInterest = async (status, userId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );

      // Handle the response based on the request's status
      if (res.data.status === 'accepted') {
        showNotification('You are already friends!', 'info');
        updateVideoListWithStatus(userId, 'friends', { isFriend: true });
        return;
      } else if (res.data.status === 'ignored') {
        showNotification('You have ignored this request.', 'info');
        updateVideoListWithStatus(userId, 'ignored');
      } else if (res.data.status === 'interested') {
        showNotification('Request already sent!', 'info');
        updateVideoListWithStatus(userId, 'interested');
      } else {
        showNotification(`Connection request sent as ${status}`, 'success');
        updateVideoListWithStatus(userId, status);
      }

      // Only dispatch to remove user from feed if the request wasn't "accepted"
      if (res.data.status !== 'accepted') {
        dispatch(removeFromFeed(userId));
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Something went wrong';
      const statusCode = err?.response?.status;

      if (statusCode === 409 || errorMsg.toLowerCase().includes('already exists')) {
        showNotification('Request already exists.', 'error');
      } else {
        console.error('Failed to send request:', err);
        showNotification('Failed to send request. Please try again later.', 'error');
      }
    }
  };

  // Update the video list based on the request status
  const updateVideoListWithStatus = (userId, status, extraUpdates = {}) => {
    setVideoList((prevList) =>
      prevList.map((video) => {
        const videoUserId = video?.userId?._id;
        if (!videoUserId) return video;

        const normalizedVideoUserId =
          typeof videoUserId === 'object' && videoUserId.toString
            ? videoUserId.toString()
            : videoUserId;
        const normalizedUserId =
          typeof userId === 'object' && userId.toString ? userId.toString() : userId;

        if (normalizedVideoUserId !== normalizedUserId) return video;

        return {
          ...video,
          requestStatus: status,
          ...extraUpdates,
        };
      })
    );
  };

  // Pagination calculations
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videoList.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(videoList.length / videosPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-700 font-medium">Loading your eco-friendly videos...</p>
        </div>
      </div>
    );
  }

  // Toast UI based on type
  const getToastStyles = () => {
    switch (toastType) {
      case 'error':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-700',
          icon: (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-500',
          text: 'text-blue-700',
          icon: (
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          )
        };
      default: // success
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-700',
          icon: (
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z"
                clipRule="evenodd"
              />
            </svg>
          )
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-8 py-12 md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white">DIY Waste Management Videos</h1>
              <p className="mt-3 text-teal-50 text-lg">Learn and share eco-friendly waste management techniques with our community</p>
            </div>
            <div className="md:w-1/3 flex justify-end">
              <button 
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-white text-teal-600 hover:bg-teal-50 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showUploadForm ? 'Hide Upload Form' : 'Share a Video'}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-10">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300">
              <div className="bg-gradient-to-r from-teal-500 to-green-500 py-3 px-6">
                <h2 className="text-xl font-bold text-white">Share a YouTube Video</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="3"
                    className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what the video is about"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                    YouTube URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-center mt-6">
                  <button
                    className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-medium rounded-lg shadow transition-all duration-300 flex items-center ${
                      isUploading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Video
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Count and Filter Options (future enhancement) */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-teal-800 font-medium">
            <span className="font-bold">{videoList.length}</span> videos available
          </div>
          <button 
            onClick={fetchVideos}
            className="text-teal-600 hover:text-teal-800 font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Video Grid */}
        {videoList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentVideos.map((video, idx) => {
              const videoKey = getVideoKey(video, idx);
              const isLiked = !!likedVideos[videoKey];
              const alreadyFriends = !!video.isFriend;
              const likesCount =
                typeof video.likesCount === 'number'
                  ? video.likesCount
                  : (video.likes || []).length;
              const authorId =
                video?.userId?._id && typeof video.userId._id === 'object'
                  ? video.userId._id.toString()
                  : video?.userId?._id || '';
              const isOwnVideo = currentUserId && authorId === currentUserId;

              return (
                <div key={videoKey} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-102 hover:shadow-lg transition-all duration-300">
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.youtubeUrl)}`}
                    title={video.title}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{video.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
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
                          className={`w-4 h-4 mr-1 ${
                            isLiked ? 'text-pink-500 fill-current' : ''
                          }`}
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
                  
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 w-full">
                      {isOwnVideo ? (
                        <div className="flex-1 flex items-center justify-center text-white bg-gradient-to-r from-teal-500 to-green-500 py-2 px-3 rounded-lg shadow-md">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4 0-7 2-7 4v1c0 .552.448 1 1 1h12c.552 0 1-.448 1-1v-1c0-2-3-4-7-4z"
                            />
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
            })}
          </div>
        ) : (
          <div className="bg-white bg-opacity-90 rounded-xl p-10 text-center shadow-md">
            <svg className="w-16 h-16 text-teal-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-teal-800 mb-3">No Videos Available</h3>
            <p className="text-gray-600 mb-6">Be the first to share an educational waste management video!</p>
            <button 
              onClick={() => setShowUploadForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-medium rounded-lg shadow transition-all duration-300 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Your First Video
            </button>
          </div>
        )}

        {/* Pagination */}
        {videoList.length > videosPerPage && (
          <div className="flex justify-center mt-10 mb-4">
            <nav className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-3 text-teal-600 hover:bg-teal-50 flex items-center transition-colors ${
                  currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              
              <div className="hidden md:flex">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show limited page numbers to avoid overcrowding
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-5 py-3 ${
                          currentPage === pageNumber
                            ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white font-medium'
                            : 'text-teal-600 hover:bg-teal-50'
                        } transition-colors`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  // Show ellipsis for skipped pages
                  if (
                    (pageNumber === currentPage - 2 && pageNumber > 1) ||
                    (pageNumber === currentPage + 2 && pageNumber < totalPages)
                  ) {
                    return <span key={pageNumber} className="px-4 py-3 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              
              {/* Page X of Y for mobile view */}
              <div className="md:hidden px-4 py-3 font-medium text-teal-600">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-3 text-teal-600 hover:bg-teal-50 flex items-center transition-colors ${
                  currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                Next
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
        
        {/* Footer Indicator */}
        {videoList.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            Showing {Math.min(indexOfFirstVideo + 1, videoList.length)} to {Math.min(indexOfLastVideo, videoList.length)} of {videoList.length} videos
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 inset-x-0 flex justify-center items-start z-50">
          <div className={`${getToastStyles().bg} border-l-4 ${getToastStyles().border} ${getToastStyles().text} p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md transition-all duration-300 ease-in-out transform animate-fade-in-down`}>
            {getToastStyles().icon}
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Video;