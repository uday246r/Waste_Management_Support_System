import axios from 'axios';
import React from 'react';
import { BASE_URL } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { removeFromFeed } from '../utils/feedSlice';

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`, 
        {}, 
        {withCredentials: true}
      );
      dispatch(removeFromFeed(userId));
    } catch(err) {
      console.log("Failed to send request:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl ">
      {/* Color Strip at Top */}
      <div className="h-2 bg-gradient-to-r from-teal-500 to-green-500"></div>
      
      {/* User Image */}
      <div className="relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName}'s profile`}
            className="w-full h-74 object-cover object-top"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center">
            <svg className="w-24 h-24 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {/* Eco Badge */}
        <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
          Eco Member
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{firstName} {lastName}</h2>
        
        {age && gender && (
          <div className="flex items-center text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{age}, {gender}</span>
          </div>
        )}
        
        {/* About Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-2">About</h3>
          <p className="text-gray-600 leading-relaxed">
            {about || "No information provided."}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <button 
            onClick={() => handleSendRequest("ignored", _id)}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ignore
          </button>
          <button 
            onClick={() => handleSendRequest("interested", _id)}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;