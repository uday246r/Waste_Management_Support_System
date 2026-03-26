import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { useNavigate, useLocation } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedConnection, setExpandedConnection] = useState(null);
 
  const fetchConnections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch connections:", err);
      setError("Failed to load connections. Please try again.");
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnectedClick = (connectionId) => {
    if (expandedConnection === connectionId) {
      setExpandedConnection(null); // Collapse if already expanded
    } else {
      setExpandedConnection(connectionId); // Expand this connection
    }
  };

  const handleChat = (connectionId) =>{
    const currentPath = location.pathname;
   if (currentPath.includes(`/chat/`)) {
    navigate(`/connections/chat/${connectionId}`);
  } else {
    const newPath = `${currentPath.endsWith("/") ? currentPath : currentPath + "/"}chat/${connectionId}`;
    navigate(newPath);
  }
  }
 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-700 font-medium">Loading your connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-700">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={fetchConnections} 
            className="mt-6 px-5 py-3 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg transition-all duration-300 hover:shadow-md font-medium">
            Try Again
          </button>
        </div>
      </div>
    );
  }
 
  if (!connections || connections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-teal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h1 className="text-2xl font-bold text-teal-800">No Connections Found</h1>
          <p className="text-gray-600 mt-2">Start exploring to connect with people who share your interests.</p>
          <button className="mt-6 px-5 py-3 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg transition-all duration-300 hover:shadow-md font-medium">
            Find People
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Your Connections</h1>
            <p className="mt-3 text-teal-50 text-lg">People you've connected with who share your sustainability interests.</p>
            <button 
              onClick={fetchConnections}
              disabled={isLoading}
              className={`mt-6 bg-white ${isLoading ? 'opacity-70' : 'hover:bg-teal-50'} text-teal-600 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center`}
            >
              <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh Connections'}
            </button>
          </div>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => {
            const { _id, firstName, lastName, photoUrl, age, gender, emailId, about } = connection;
            const isExpanded = expandedConnection === _id;
            
            return (
              <div key={_id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {/* Color Strip at Top */}
                <div className="h-1 bg-gradient-to-r from-teal-500 to-green-500"></div>
               
                <div className="p-6">
                  <div className="flex items-center">
                    {/* User Image */}
                    <div className="flex-shrink-0">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={`${firstName}'s profile`}
                          className="w-16 h-16 object-cover rounded-full border-2 border-teal-100"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                   
                    {/* User Info */}
                    <div className="ml-4 flex-grow">
                      <h2 className="text-lg font-bold text-gray-800">{firstName} {lastName}</h2>
                     
                      {age && gender && (
                        <div className="flex items-center text-gray-600 text-sm mb-1">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{age}, {gender}</span>
                        </div>
                      )}
                    </div>
                   
                    {/* Connection Badge */}
                    <div className="flex-shrink-0 ml-2">
                      <button 
                        onClick={() => handleConnectedClick(_id)}
                        className={`bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:bg-teal-600 flex items-center ${isExpanded ? 'bg-teal-600' : ''}`}
                      >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Email
                      </button>
                      <button 
                        onClick={() => handleChat(_id)}
                        className={`bg-teal-500 text-white mt-2 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:bg-teal-600 flex items-center ${isExpanded ? 'bg-teal-600' : ''}`}
                      >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chat
                      </button>
                    </div>
                    
                  </div>
                  
                  {/* About Section */}
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {about || "No information provided."}
                    </p>
                  </div>
                  
                  {/* Email Connection Section - Shows when Connected button is clicked */}
                  {isExpanded && (
                    <div className="mt-4 bg-teal-50 p-4 rounded-lg border border-teal-100 animate-fadeIn transition-all duration-300">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${emailId}`} className="text-teal-600 hover:underline font-medium break-all">
                          {emailId}
                        </a>
                      </div>
                      <p className="text-teal-700 text-sm mt-2">
                        Let's connect! Feel free to reach out and start a conversation about sustainable initiatives.
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <a 
                          href={`mailto:${emailId}?subject=Let's connect on sustainable initiatives!&body=Hi ${firstName},%0D%0A%0D%0AI saw your profile on our sustainability platform and would love to connect with you.%0D%0A%0D%0ALooking forward to hearing from you!`} 
                          className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 transition-colors duration-300 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Now
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(emailId);
                            alert(`${emailId} copied to clipboard!`);
                          }}
                          className="bg-teal-100 text-teal-800 px-3 py-1 rounded text-sm hover:bg-teal-200 transition-colors duration-300 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm">
          End of connections • {connections.length} connections shown
        </div>
      </div>
    </div>
  );
};

/* Add this animation to your global CSS or component styles */
/* 
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
*/

export default Connections;