import React from "react";
import { useSelector } from "react-redux";

const CompanyProfile = () => {
  const company = useSelector((state) => state.user);

  if (!company || !company.emailId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-xl">No company data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold text-teal-700 mb-6 text-center">Company Profile</h1>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500">Company Name:</p>
            <p className="text-lg font-medium">{company.companyName}</p>
          </div>

          <div>
            <p className="text-gray-500">Email:</p>
            <p className="text-lg font-medium">{company.emailId}</p>
          </div>

          <div>
            <p className="text-gray-500">Waste Type:</p>
            <p className="text-lg font-medium">{company.wasteType}</p>
          </div>

          <div>
            <p className="text-gray-500">Pickup Time:</p>
            <p className="text-lg font-medium">
              {company.pickupTimeFrom && company.pickupTimeTo
                ? `${company.pickupTimeFrom} - ${company.pickupTimeTo}`
                : 'Not specified'}
            </p>
          </div>

          <div>
            <p className="text-gray-500">About:</p>
            <p className="text-lg font-medium">₹{company.about}</p>
          </div>

          <div>
            <p className="text-gray-500">Price per KG:</p>
            <p className="text-lg font-medium">₹{company.price}</p>
          </div>

          {company.photoUrl && (
            <div>
              <p className="text-gray-500">Company Logo:</p>
              <img
                src={company.photoUrl}
                alt="Company"
                className="w-32 h-32 object-cover rounded-md mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
