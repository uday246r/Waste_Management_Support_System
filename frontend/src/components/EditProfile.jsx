import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { addCompany } from "../utils/companySlice"; // Ensure you import addCompany here
import UserCard from "./UserCard";
import CompanyCard from "./CompanyCard";

const Profile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const companyData = useSelector((state) => state.company);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Determine if the profile belongs to a company or a user
  const isCompany = companyData?.companyName !== undefined;

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        BASE_URL + (isCompany ? "/companyProfile/view" : "/profile/view"),
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      setProfileData(res.data);
      setFormData(res.data);
    } catch (err) {
      setError("Failed to fetch profile.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  
  useEffect(() => {
    if (isCompany && companyData) {
      setProfileData(companyData);
      setFormData(companyData);
    } else if (!isCompany && userData) {
      setProfileData(userData);
      setFormData(userData);
    }
  }, [isCompany, userData, companyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    const allowedFields = [
      "firstName",
      "lastName",
      "companyName",
      "emailId",
      "price",
      "photoUrl",
      "gender",
      "wasteType",
      "pickupTime",
      "location",
      "age",
      "about",
      "skills",
    ];
    const filteredFormData = Object.fromEntries(
      Object.entries(formData).filter(([key]) => allowedFields.includes(key))
    );
    try {
      const res = await axios.patch(
        BASE_URL + (isCompany ? "/companyProfile/edit" : "/profile/edit"),
        filteredFormData,
        { withCredentials: true }
      );

      if (isCompany) {
        dispatch(addCompany(res.data.data)); // Save company data
      } else {
        dispatch(addUser(res.data.data)); // Save user data
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err?.response?.data || "Error updating profile");
    }
  };

  if (!formData) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700">Loading profile data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {isCompany ? "Company" : "User"} Profile
            </h1>
            <p className="text-gray-500 max-w-md italic">
              Manage your {isCompany ? "company" : "personal"} information and preferences
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          {/* Form Section */}
          <div className="w-full lg:w-1/2 bg-white shadow-lg rounded-xl p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Edit Profile</h2>
            <form className="space-y-5">
              {isCompany ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      name="companyName"
                      value={formData.companyName || ""}
                      onChange={handleChange}
                      placeholder="EcoRecycle Inc."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input
                      name="photoUrl"
                      value={formData.photoUrl || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per KG</label>
                    <input
                      name="price"
                      value={formData.price || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                    <select
                      name="wasteType"
                      value={formData.wasteType || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white text-gray-500"
                    >
                      <option value="Plastic">Plastic</option>
                      <option value="Organic">Organic</option>
                      <option value="Metal">Metal</option>
                    </select>
                  </div>
                  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Pickup Time Range
  </label>
  <div className="flex space-x-4">
    <input
      type="time"
      name="pickupTimeFrom"
      value={formData.pickupTimeFrom || ""}
      onChange={handleChange}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
    />
    <span className="self-center text-gray-600">to</span>
    <input
      type="time"
      name="pickupTimeTo"
      value={formData.pickupTimeTo || ""}
      onChange={handleChange}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
    />
  </div>
</div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      name="about"
                      value={formData.about || ""}
                      onChange={handleChange}
                      placeholder="Tell us about you"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                    <input
                      name="photoUrl"
                      value={formData.photoUrl || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        name="age"
                        type="number"
                        value={formData.age || ""}
                        onChange={handleChange}
                        placeholder="25"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <input
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        placeholder="Male/Female/Other"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      name="about"
                      value={formData.about || ""}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500 resize-none"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={saveProfile}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition duration-200 shadow-md transform hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Preview Card */}
          <div className="w-full lg:w-1/2 flex items-start justify-center">
            <div className="w-full max-w-md">
              {isCompany ? (
                <CompanyCard company={formData} />
              ) : (
                <UserCard user={formData} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 inset-x-0 flex justify-center items-start z-50">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md transition-all duration-300 ease-in-out transform animate-fade-in-down">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd"></path>
            </svg>
            <p className="text-sm font-medium">Profile updated successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
