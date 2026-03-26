import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addCompany } from '../utils/companySlice';

const Payment = ({ paymentId, amount, userAccountNumber, userUpiId, onSuccess, onClose }) => {
    const company = useSelector((store) => store.company);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [payoutResult, setPayoutResult] = useState(null);
    const [showManualTransfer, setShowManualTransfer] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [manualDetails, setManualDetails] = useState(null);
    const [manualInitialized, setManualInitialized] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const supportsRazorpay = Boolean(company?.razorpayAccountId && userUpiId);

    useEffect(() => {
        const ensureCompanyProfile = async () => {
            try {
                const res = await axios.get(BASE_URL + "/companyProfile/view", { withCredentials: true });
                dispatch(addCompany(res.data));
            } catch (err) {
                console.warn("Unable to refresh company profile for payments:", err?.message || err);
            }
        };

        if (!company?.razorpayAccountId) {
            ensureCompanyProfile();
        }
    }, [company?.razorpayAccountId, dispatch]);

    const processPayout = async (method = 'auto') => {
        setLoading(true);
        setErrorMessage('');
        try {
            const res = await axios.post(
                BASE_URL + "/payment/process-payout/" + paymentId + `?method=${method}`,
                {},
                { withCredentials: true }
            );

            if (res.data.requiresAccountSetup) {
                alert(res.data.message);
                if (onClose) onClose();
                return;
            }

            if (res.data.payoutId) {
                setPayoutResult({
                    type: 'automatic',
                    message: res.data.message,
                    payoutId: res.data.payoutId,
                    status: res.data.status
                });
                setShowManualTransfer(false);
                setManualDetails(null);
                setManualInitialized(false);
                setTransactionId('');

                setTimeout(() => {
                    if (onSuccess) onSuccess();
                }, 2000);
            } else {
                setManualDetails(res.data.transferDetails || null);
                setManualInitialized(true);
                setPayoutResult({
                    type: 'manual',
                    message: res.data.message,
                    transferDetails: res.data.transferDetails
                });
                setShowManualTransfer(true);
            }
        } catch (err) {
            console.error("Payout error:", err);
            if (err.response?.data?.requiresAccountSetup) {
                alert(err.response.data.message);
                if (onClose) onClose();
            }
            setErrorMessage(err.response?.data?.message || err.message || 'Failed to process payout.');
        } finally {
            setLoading(false);
        }
    };

    const markAsCompleted = async () => {
        if (!manualInitialized) {
            alert("Please initiate a manual transfer first.");
            return;
        }

        if (!transactionId.trim()) {
            alert("Please enter transaction ID");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                BASE_URL + "/payment/complete-payment/" + paymentId,
                { transactionId },
                { withCredentials: true }
            );
            alert("Payment marked as completed!");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            alert("Failed to mark payment as completed: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const renderManualCard = () => {
        if (!showManualTransfer) return null;

        return (
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Manual Transfer Required</h3>
                    <div className="space-y-2 text-sm">
                        <div className="bg-white p-3 rounded border">
                            <p className="font-medium text-gray-700">Amount to Transfer:</p>
                            <p className="text-xl font-bold text-teal-600">₹{manualDetails?.amount || amount}</p>
                        </div>
                        
                        {(manualDetails?.toUpiId || userUpiId) && (
                            <div className="bg-white p-3 rounded border">
                                <p className="font-medium text-gray-700">Transfer to UPI ID:</p>
                                <p className="text-lg font-mono text-teal-600">{manualDetails?.toUpiId || userUpiId}</p>
                            </div>
                        )}
                        
                        {(manualDetails?.toAccountNumber || userAccountNumber) && (
                            <div className="bg-white p-3 rounded border">
                                <p className="font-medium text-gray-700">Transfer to Account:</p>
                                <p className="text-lg font-mono text-teal-600">{manualDetails?.toAccountNumber || userAccountNumber}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <strong>Instructions:</strong> Complete the bank/UPI transfer from your configured account. Once done, enter the transaction reference below to mark the payment as completed.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-teal-600 mb-1">Transaction ID / UPI Reference</label>
                    <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                        placeholder="Enter transaction ID from your bank/UPI app"
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                        disabled={loading}
                    >
                        Close
                    </button>
                    <button
                        onClick={markAsCompleted}
                        disabled={loading || !transactionId.trim()}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Mark as Completed"}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto text-teal-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-teal-800">Process Payment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {!payoutResult && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 border border-gray-200">
                            Choose how you want to settle this payment. Razorpay provides instant payouts when enabled; manual transfer lets you pay through your bank/UPI and then record the transaction.
                        </div>
                        
                        {supportsRazorpay ? (
                            <button
                                onClick={() => processPayout('razorpay')}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span>Initiating...</span>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.104 0 2-.897 2-2s-.896-2-2-2-2 .897-2 2 .896 2 2 2zm0 6c-2.21 0-4 1.567-4 3.5V19h8v-1.5c0-1.933-1.79-3.5-4-3.5z" />
                                        </svg>
                                        Pay via Razorpay (UPI)
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                                Add a Razorpay account ID and ensure the user shares a UPI ID to enable instant payouts.
                            </div>
                        )}

                        <button
                            onClick={() => processPayout('manual')}
                            disabled={loading}
                            className="w-full px-4 py-3 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-all disabled:opacity-50"
                        >
                            {loading ? "Preparing manual transfer..." : "Manual Transfer Instead"}
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-4 text-teal-700">Processing payment...</p>
                    </div>
                )}

                {payoutResult && payoutResult.type === 'automatic' && (
                    <div className="space-y-4 mt-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center mb-2">
                                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-green-800">Payout Initiated</h3>
                            </div>
                            <p className="text-sm text-green-700">{payoutResult.message}</p>
                            <p className="text-xs text-green-600 mt-2">Payout ID: {payoutResult.payoutId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Close
                        </button>
                    </div>
                )}

                {renderManualCard()}
            </div>
        </div>
    );
};

export default Payment;

