import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../utils/constants';
import { addRequest, removeRequest } from '../utils/requestSlice';

const Requests = () => {
    const requests = useSelector((store) => store.requests);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reviewRequest = async (status, _id) => {
        try {
            const res = await axios.post(
                BASE_URL + "/request/review/" + status + "/" + _id,
                {},
                { withCredentials: true }
            );
            dispatch(removeRequest(_id));
        }
        catch (err) {
            console.error("Failed to review request:", err);
            setError("Failed to review request. Please try again.");
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(BASE_URL + "/user/requests/received", {
                withCredentials: true,
            });
            dispatch(addRequest(res.data.data));
        }
        catch (err) {
            console.error("Failed to fetch requests:", err);
            setError("Failed to fetch connection requests.");
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (!loading && (!requests || requests.length === 0)) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [requests]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-teal-700 font-medium">Loading your connection requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500 max-w-md">
                    <h2 className="text-xl font-semibold text-red-600">Error</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            fetchRequests();
                        }}
                        className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-300"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="px-8 py-12 md:flex items-center justify-between">
                            <div className="md:w-2/3 mb-6 md:mb-0">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">Connection Requests</h1>
                                <p className="mt-3 text-teal-50 text-lg">Review and respond to people who want to connect with you.</p>
                            </div>
                            <div className="md:w-1/3 flex justify-end">
                                <button 
                                    onClick={fetchRequests}
                                    className="bg-white text-teal-600 hover:bg-teal-50 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh Requests
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <svg className="w-16 h-16 text-teal-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 className="text-2xl font-bold text-gray-700">No Requests Found</h1>
                            <p className="text-gray-600 mt-2">You don't have any connection requests at the moment.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="px-8 py-12 md:flex items-center justify-between">
                        <div className="md:w-2/3 mb-6 md:mb-0">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Connection Requests</h1>
                            <p className="mt-3 text-teal-50 text-lg">Review and respond to people who want to connect with you.</p>
                        </div>
                        <div className="md:w-1/3 flex justify-end">
                            <button 
                                onClick={fetchRequests}
                                className="bg-white text-teal-600 hover:bg-teal-50 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Requests
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {requests.map((request) => {
                        const { _id, firstName, lastName, photoUrl, age, gender, about } = request.fromUserId;
                        return (
                            <div key={_id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                {/* Color Strip at Top */}
                                <div className="h-1 bg-gradient-to-r from-teal-500 to-green-500"></div>
                               
                                <div className="p-6 flex flex-col md:flex-row items-center">
                                    {/* User Image */}
                                    <div className="flex-shrink-0 mb-4 md:mb-0">
                                        {photoUrl ? (
                                            <img
                                                src={photoUrl}
                                                alt={`${firstName}'s profile`}
                                                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-2 border-teal-100"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                   
                                    {/* User Info */}
                                    <div className="flex-grow md:ml-6 text-center md:text-left">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">{firstName} {lastName}</h2>
                                       
                                        {age && gender && (
                                            <div className="flex items-center justify-center md:justify-start text-gray-600 mb-2">
                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>{age}, {gender}</span>
                                            </div>
                                        )}
                                       
                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {about || "No information provided."}
                                        </p>
                                    </div>
                                   
                                    {/* Action Buttons */}
                                    <div className="flex-shrink-0 flex space-x-3 mt-4 md:mt-0">
                                        <button
                                            onClick={() => reviewRequest("rejected", request._id)}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => reviewRequest("accepted", request._id)}
                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-12 text-center text-gray-500 text-sm">
                    End of requests • {requests.length} {requests.length === 1 ? 'item' : 'items'} shown
                </div>
            </div>
        </div>
    );
};

export default Requests;