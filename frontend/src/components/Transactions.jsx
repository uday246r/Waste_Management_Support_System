import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../utils/constants';

const Transactions = () => {
    const user = useSelector((store) => store.user || store.company);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const isCompany = user?.role === 'company';

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const endpoint = isCompany
                ? "/payment/company/transactions"
                : "/payment/user/transactions";

            const res = await axios.get(BASE_URL + endpoint, {
                withCredentials: true
            });

            setTransactions(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-teal-700 font-medium">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="px-8 py-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Payment Transactions</h1>
                        <p className="mt-3 text-teal-50 text-lg">
                            {isCompany ? "View all payment transactions" : "View your payment history"}
                        </p>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto">
                        <svg className="w-16 h-16 text-teal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-teal-800">No Transactions Found</h1>
                        <p className="text-gray-600 mt-2">You don't have any payment transactions yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="h-1 bg-gradient-to-r from-teal-500 to-green-500"></div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-teal-800">
                                                {isCompany 
                                                    ? `${transaction.userId?.firstName || ''} ${transaction.userId?.lastName || ''}`
                                                    : transaction.companyId?.companyName || 'Company'
                                                }
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-teal-600">₹{transaction.amount}</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(transaction.status)}`}>
                                                {transaction.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {transaction.pickupRequestId && (
                                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Waste Amount:</span> ₹{transaction.pickupRequestId.wasteAmount || 'N/A'}
                                            </p>
                                            {transaction.pickupRequestId.wasteWeight && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Weight:</span> {transaction.pickupRequestId.wasteWeight} kg
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {transaction.razorpayPaymentId && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span>Payment ID: {transaction.razorpayPaymentId}</span>
                                        </div>
                                    )}

                                    {isCompany && transaction.userId && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">UPI ID:</span> {transaction.upiId || 'N/A'}
                                            </p>
                                            {transaction.accountNumber && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Account:</span> {transaction.accountNumber}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;



