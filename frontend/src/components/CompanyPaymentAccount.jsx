import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addCompany } from '../utils/companySlice';

const CompanyPaymentAccount = ({ onClose, onSuccess }) => {
    const company = useSelector((store) => store.company);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        paymentAccountNumber: '',
        paymentUpiId: '',
        paymentBankName: '',
        paymentIfscCode: '',
        razorpayAccountId: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (company) {
            setFormData({
                paymentAccountNumber: company.paymentAccountNumber || '',
                paymentUpiId: company.paymentUpiId || '',
                paymentBankName: company.paymentBankName || '',
                paymentIfscCode: company.paymentIfscCode || '',
                razorpayAccountId: company.razorpayAccountId || ''
            });
        }
    }, [company]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(
                BASE_URL + "/payment/update-company-payment-account",
                formData,
                { withCredentials: true }
            );
            const updatedCompany = res?.data?.company;
            if (updatedCompany) {
                dispatch(addCompany(updatedCompany));
                setFormData({
                    paymentAccountNumber: updatedCompany.paymentAccountNumber || '',
                    paymentUpiId: updatedCompany.paymentUpiId || '',
                    paymentBankName: updatedCompany.paymentBankName || '',
                    paymentIfscCode: updatedCompany.paymentIfscCode || '',
                    razorpayAccountId: updatedCompany.razorpayAccountId || ''
                });
            }
            alert("Payment account updated successfully!");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            alert("Failed to update payment account: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto text-teal-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-teal-800">Configure Payment Account</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Add your payment account details to send money to users. You can use either bank account or UPI.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-teal-600">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                        <input
                            type="text"
                            value={formData.paymentAccountNumber}
                            onChange={(e) => setFormData({ ...formData, paymentAccountNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                            placeholder="Enter account number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                            type="text"
                            value={formData.paymentUpiId}
                            onChange={(e) => setFormData({ ...formData, paymentUpiId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                            placeholder="yourname@upi"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={formData.paymentBankName}
                            onChange={(e) => setFormData({ ...formData, paymentBankName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                            placeholder="Enter bank name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <input
                            type="text"
                            value={formData.paymentIfscCode}
                            onChange={(e) => setFormData({ ...formData, paymentIfscCode: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                            placeholder="BANK0001234"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Account ID (Optional)</label>
                        <input
                            type="text"
                            value={formData.razorpayAccountId}
                            onChange={(e) => setFormData({ ...formData, razorpayAccountId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-teal-600"
                            placeholder="For automatic payouts via Razorpay"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty if not using Razorpay Payouts</p>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyPaymentAccount;


