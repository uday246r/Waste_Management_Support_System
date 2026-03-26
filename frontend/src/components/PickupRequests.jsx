import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../utils/constants';
import { addPickupRequest, updatePickupRequestStatus } from '../utils/pickupSlice';
import Payment from './Payment';
import CompanyPaymentAccount from './CompanyPaymentAccount';

const PickupRequests = () => {
    const pickupRequests = useSelector((store) => store.pickup.pickupRequests);
    const user = useSelector((store) => store.user || store.company);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'picked-up'
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [paymentData, setPaymentData] = useState({ accountNumber: '', upiId: '', amount: '' });
    const [pendingPayments, setPendingPayments] = useState([]);
    const [userPayments, setUserPayments] = useState([]);
    const [showPaymentComponent, setShowPaymentComponent] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPaymentAccountSetup, setShowPaymentAccountSetup] = useState(false);

    const isCompany = user?.role === 'company';

    const reviewRequest = async (status, _id) => {
        try {
            await axios.post(
                BASE_URL + "/pickup/review/" + status + "/" + _id,
                {},
                { withCredentials: true }
            );
            dispatch(updatePickupRequestStatus({ requestId: _id, status }));
        } catch (err) {
            console.error("Failed to review request:", err);
        }
    };

    const markAsPickedUp = async (_id, wasteAmount, wasteWeight) => {
        try {
            await axios.post(
                BASE_URL + "/pickup/mark-picked-up/" + _id,
                { wasteAmount, wasteWeight },
                { withCredentials: true }
            );
            dispatch(updatePickupRequestStatus({ requestId: _id, status: "picked-up" }));
        } catch (err) {
            console.error("Failed to mark request as picked up:", err);
        }
    };

    const fetchUserPayments = async () => {
        if (isCompany) return;
        try {
            const res = await axios.get(BASE_URL + "/payment/user/transactions", {
                withCredentials: true
            });
            setUserPayments(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch user payments:", err);
        }
    };

    const requestPayment = async () => {
        try {
            await axios.post(
                BASE_URL + "/payment/request-payment/" + selectedRequestId,
                paymentData,
                { withCredentials: true }
            );
            setShowPaymentModal(false);
            setPaymentData({ accountNumber: '', upiId: '', amount: '' });
            fetchPickupRequests();
            fetchUserPayments();
            alert("Payment request submitted successfully!");
        } catch (err) {
            console.error("Failed to request payment:", err);
            alert("Failed to request payment: " + (err.response?.data?.message || err.message));
        }
    };

    const openPaymentModal = (requestId) => {
        setSelectedRequestId(requestId);
        setShowPaymentModal(true);
    };

    const fetchPendingPayments = async () => {
        if (!isCompany) return;
        try {
            const res = await axios.get(BASE_URL + "/payment/company/pending-payments", {
                withCredentials: true
            });
            setPendingPayments(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch pending payments:", err);
        }
    };

    const openPaymentDialog = (payment) => {
        setSelectedPayment(payment);
        setShowPaymentComponent(true);
    };

    const handlePaymentSuccess = () => {
        setShowPaymentComponent(false);
        setSelectedPayment(null);
        fetchPendingPayments();
        fetchPickupRequests();
    };

    const fetchPickupRequests = async () => {
        setLoading(true);
        try {
            const endpoint = isCompany
                ? "/pickup/company/requests/pickup"
                : "/pickup/user/requests/pickup";

            const res = await axios.get(BASE_URL + endpoint, {
                withCredentials: true,
            });

            if (Array.isArray(res.data.data)) {
                dispatch(addPickupRequest(res.data.data));
            } else {
                console.warn("Unexpected data format:", res.data);
            }
        } catch (err) {
            console.error("Failed to fetch pickup requests:", err);
        } finally {
            setTimeout(() => setLoading(false), 800); // Slight delay for better UX
            if (isCompany) {
                fetchPendingPayments();
            } else {
                fetchUserPayments();
            }
        }
    };

    useEffect(() => {
        fetchPickupRequests();
        if (isCompany) {
            fetchPendingPayments();
        } else {
            fetchUserPayments();
        }
    }, [isCompany]);

    // Helper function to render status badge with appropriate styles
    const renderStatusBadge = (status) => {
        let bgColor, textColor, statusText;
        
        switch(status) {
            case "pending":
                bgColor = "bg-yellow-100";
                textColor = "text-yellow-800";
                statusText = "PENDING";
                break;
            case "accepted":
                bgColor = "bg-green-100";
                textColor = "text-green-800";
                statusText = "ACCEPTED";
                break;
            case "rejected":
                bgColor = "bg-red-100";
                textColor = "text-red-800";
                statusText = "REJECTED";
                break;
            case "picked-up":
                bgColor = "bg-blue-100";
                textColor = "text-blue-800";
                statusText = "PICKED UP";
                break;
            default:
                bgColor = "bg-gray-100";
                textColor = "text-gray-800";
                statusText = status.toUpperCase();
        }
        
        return (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                {statusText}
            </span>
        );
    };

    const findPaymentForRequest = (requestId) => {
        if (!requestId) return null;
        return userPayments.find(payment => {
            const pickupId = payment.pickupRequestId?._id || payment.pickupRequestId;
            return pickupId?.toString() === requestId?.toString();
        }) || null;
    };

    // Apply filter and sorting (pending first)
    const filteredAndSortedRequests = (() => {
        const order = { 'pending': 0, 'accepted': 1, 'picked-up': 2, 'rejected': 3 };
        const list = Array.isArray(pickupRequests) ? pickupRequests.slice() : [];
        const filtered = statusFilter === 'all' ? list : list.filter(r => r.status === statusFilter);
        return filtered.sort((a, b) => {
            const ao = order[a.status] ?? 99;
            const bo = order[b.status] ?? 99;
            if (ao !== bo) return ao - bo; // pending first, etc.
            const ad = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const bd = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return bd - ad; // most recent first within same status
        });
    })();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-teal-700 font-medium">Loading pickup requests...</p>
                </div>
            </div>
        );
    }

    // don't early-return for empty; show message below filter instead

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="px-8 py-12 md:flex items-center justify-between">
                        <div className="md:w-2/3 mb-6 md:mb-0">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Pickup Requests</h1>
                            <p className="mt-3 text-teal-50 text-lg">
                                {isCompany ? 
                                    "Review and manage waste collection requests from users." : 
                                    "Track the status of your waste collection requests."}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-end gap-3">
                            {isCompany && (
                                <button 
                                    onClick={() => setShowPaymentAccountSetup(true)}
                                    className="bg-white text-teal-600 hover:bg-teal-50 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Payment Account
                                </button>
                            )}
                            <button 
                                onClick={fetchPickupRequests}
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

                {/* Filter Row */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {filteredAndSortedRequests.length} of {pickupRequests?.length || 0} requests
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Filter:</label>
                        <select
                            className="px-3 py-2 text-sm rounded-md bg-white border border-gray-200 text-gray-700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="picked-up">Picked Up</option>
                        </select>
                    </div>
                </div>

                {/* Empty state shown below filter */}
                {(!filteredAndSortedRequests || filteredAndSortedRequests.length === 0) && (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto">
                        <svg className="w-16 h-16 text-teal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <h1 className="text-2xl font-bold text-teal-800">No Pickup Requests Found</h1>
                        <p className="text-gray-600 mt-2">
                            {statusFilter !== 'all' ? `No ${statusFilter.replace('-', ' ')} requests.` : (
                                isCompany ? "No users have requested waste pickups yet." : "You haven't requested any waste pickups yet."
                            )}
                        </p>
                        {!isCompany && (
                            <button className="mt-6 px-5 py-3 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg transition-all duration-300 hover:shadow-md font-medium">
                                Request Pickup
                            </button>
                        )}
                    </div>
                )}

                <div className="space-y-6">
                    {filteredAndSortedRequests.map((request) => {
                        const { _id: requestId, status } = request;

                        if (isCompany) {
                            // COMPANY VIEW
                            const user = request.fromUserId || {};
                            const { firstName = '', lastName = '', photoUrl = '', age = '', gender = '', about = '', emailId = '' } = user;

                            if (!user._id) {
                                console.warn("Skipping malformed request:", request);
                                return null;
                            }

                            return (
                                <div key={requestId} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    {/* Color Strip at Top */}
                                    <div className="h-1 bg-gradient-to-r from-teal-500 to-green-500"></div>
                                    
                                    <div className="p-6">
                                        <div className="md:flex items-center">
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
                                            <div className="md:ml-6 flex-grow mt-4 md:mt-0">
                                                <h2 className="text-xl font-bold text-teal-800">{firstName} {lastName}</h2>
                                                
                                                {age && (
                                                    <div className="flex items-center text-gray-600 text-sm mb-1">
                                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>{age} {gender && `- ${gender}`}</span>
                                                    </div>
                                                )}
                                                
                                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                                    {about || "No information provided."}
                                                </p>
                                                
                                                {/* Status Badge */}
                                                <div className="mt-4 flex items-center">
                                                    {renderStatusBadge(status)}
                                                    
                                                    {/* Show user email when request is accepted */}
                                                    {status === "accepted" && (
                                                        <div className="ml-3 flex items-center">
                                                            <svg className="w-4 h-4 text-teal-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <a href={`mailto:${emailId}`} className="text-sm text-teal-600 hover:underline">
                                                                {emailId}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Request Date */}
                                                <div className="flex items-center mt-2">
                                                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">
                                                        Request date: {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="md:flex-shrink-0 md:ml-4 mt-4 md:mt-0 flex md:flex-col space-x-3 md:space-x-0 md:space-y-3">
                                                {status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => reviewRequest("accepted", requestId)}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => reviewRequest("rejected", requestId)}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all duration-300"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Show contact button when request is accepted */}
                                                {status === "accepted" && (
                                                    <a 
                                                        href={`mailto:${emailId}?subject=Regarding your waste pickup request&body=Hello ${firstName},%0D%0A%0D%0AWe've accepted your waste pickup request and would like to coordinate the details.%0D%0A%0D%0ARegards,%0D%0AThe Team`}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center justify-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        Contact User
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Pickup Info Section - Only visible for picked-up requests */}
                                        {status === "picked-up" && (
                                            <div className="mt-4 space-y-3">
                                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="flex items-start">
                                                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <h3 className="text-sm font-semibold text-blue-800">Waste Pickup Completed</h3>
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                The user has confirmed that the waste has been successfully picked up.
                                                            </p>
                                                            {request.wasteAmount && (
                                                                <p className="text-xs text-blue-700 mt-2 font-medium">
                                                                    Amount: ₹{request.wasteAmount}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Show pending payment if exists */}
                                                {pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId) && (
                                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-green-800">Payment Request Pending</h3>
                                                                <p className="text-xs text-green-600 mt-1">
                                                                    Amount: ₹{pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId)?.amount}
                                                                </p>
                                                                {pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId)?.upiId && (
                                                                    <p className="text-xs text-green-600">UPI: {pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId)?.upiId}</p>
                                                                )}
                                                                {pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId)?.accountNumber && (
                                                                    <p className="text-xs text-green-600">Account: {pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId)?.accountNumber}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => openPaymentDialog(pendingPayments.find(p => p.pickupRequestId?._id === requestId || p.pickupRequestId === requestId))}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                                                            >
                                                                Pay Now
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        } else {
                            // USER VIEW
                            const company = request.toCompanyId || {};
                            const { companyName = '', photoUrl = '', about = '', emailId = '' } = company;

                        if (!company._id) {
                                console.warn("Skipping malformed request:", request);
                                return null;
                            }

                            const paymentForRequest = findPaymentForRequest(requestId);

                            return (
                                <div key={requestId} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    {/* Color Strip at Top */}
                                    <div className="h-1 bg-gradient-to-r from-teal-500 to-green-500"></div>
                                    
                                    <div className="p-6">
                                        <div className="md:flex items-center">
                                            {/* Company Image */}
                                            <div className="flex-shrink-0">
                                                {photoUrl ? (
                                                    <img
                                                        src={photoUrl}
                                                        alt={`${companyName}`}
                                                        className="w-16 h-16 object-cover rounded-full border-2 border-teal-100"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Company Info */}
                                            <div className="md:ml-6 flex-grow mt-4 md:mt-0">
                                                <h2 className="text-xl font-bold text-teal-800">{companyName}</h2>
                                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                                    {about || "No information provided."}
                                                </p>
                                                
                                                {/* Request Details */}
                                                <div className="flex items-center mt-4">
                                                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">
                                                        Request date: {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <div className="mt-2">
                                                    {renderStatusBadge(status)}
                                                </div>
                                                
                                                {/* Company Email - Only shown when accepted */}
                                                {status === "accepted" && (
                                                    <div className="mt-2 flex items-center">
                                                        <svg className="w-4 h-4 text-teal-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <a href={`mailto:${emailId}`} className="text-sm text-teal-600 hover:underline">
                                                            {emailId}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Action Buttons for User */}
                                            <div className="md:flex-shrink-0 md:ml-4 mt-4 md:mt-0">
                                                {status === "accepted" && (
                                                    <div className="flex flex-col space-y-3">
                                                        {/* Contact Company Button */}
                                                        <a 
                                                            href={`mailto:${emailId}?subject=Regarding my waste pickup request&body=Hello ${companyName},%0D%0A%0D%0AI would like to discuss details about my waste pickup request.%0D%0A%0D%0ARegards`}
                                                            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center justify-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            Contact Company
                                                        </a>
                                                        
                                                        {/* Mark as Picked Up Button */}
                                                        <button 
                                                            onClick={() => {
                                                                const amount = prompt("Enter waste amount (in ₹):");
                                                                const weight = prompt("Enter waste weight (in kg):");
                                                                if (amount) {
                                                                    markAsPickedUp(requestId, parseFloat(amount), weight ? parseFloat(weight) : null);
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Mark as Picked Up
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {status === "picked-up" && (
                                                    <div className="flex flex-col space-y-3">
                                                        <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                                                            <svg className="w-6 h-6 text-blue-500 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <p className="text-sm font-medium text-blue-800">Pickup Complete</p>
                                                        </div>
                                                        {paymentForRequest ? (
                                                            <div className={`px-4 py-3 rounded-lg border text-sm ${
                                                                paymentForRequest.status === "completed"
                                                                    ? "bg-green-50 border-green-100 text-green-700"
                                                                    : paymentForRequest.status === "failed"
                                                                    ? "bg-red-50 border-red-100 text-red-700"
                                                                    : "bg-yellow-50 border-yellow-100 text-yellow-700"
                                                            }`}>
                                                                {paymentForRequest.status === "completed" && (
                                                                    <div className="flex items-center">
                                                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span>Payment received successfully.</span>
                                                                    </div>
                                                                )}
                                                                {paymentForRequest.status === "failed" && (
                                                                    <div className="flex items-center">
                                                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        <span>Payment failed. Please contact the company.</span>
                                                                    </div>
                                                                )}
                                                                {["pending", "processing"].includes(paymentForRequest.status) && (
                                                                    <div className="flex items-center">
                                                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span>Payment requested. Awaiting company transfer.</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => openPaymentModal(requestId)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                                Request Payment
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Thank You Message - Only visible for picked-up requests */}
                                        {status === "picked-up" && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <div className="flex items-start">
                                                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-blue-800">Thank You for Using Our Service!</h3>
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            Your waste has been successfully picked up. Thank you for contributing to a cleaner environment.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
                
                <div className="mt-12 text-center text-gray-500 text-sm">
                    End of requests • {pickupRequests.length} {pickupRequests.length === 1 ? 'request' : 'requests'} shown
                </div>
            </div>

            {/* Payment Request Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-teal-600">
                        <h2 className="text-xl font-bold text-teal-800 mb-4">Request Payment</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-teal-600 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-teal-600 mb-1">Account Number (Optional)</label>
                                <input
                                    type="text"
                                    value={paymentData.accountNumber}
                                    onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                                    placeholder="Enter account number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-teal-600 mb-1">UPI ID (Optional)</label>
                                <input
                                    type="text"
                                    value={paymentData.upiId}
                                    onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                                    placeholder="Enter UPI ID"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPaymentData({ accountNumber: '', upiId: '', amount: '' });
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={requestPayment}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Component */}
            {showPaymentComponent && selectedPayment && (
                <Payment
                    paymentId={selectedPayment._id}
                    amount={selectedPayment.amount}
                    userAccountNumber={selectedPayment.accountNumber}
                    userUpiId={selectedPayment.upiId}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => {
                        setShowPaymentComponent(false);
                        setSelectedPayment(null);
                    }}
                />
            )}

            {/* Company Payment Account Setup */}
            {showPaymentAccountSetup && (
                <CompanyPaymentAccount
                    onClose={() => setShowPaymentAccountSetup(false)}
                    onSuccess={() => {
                        setShowPaymentAccountSetup(false);
                        fetchPickupRequests();
                    }}
                />
            )}
        </div>
    );
};

export default PickupRequests;