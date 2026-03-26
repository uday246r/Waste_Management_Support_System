import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../utils/userSlice";
import { addCompany } from "../utils/companySlice";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [role, setRole] = useState("user"); // "user" or "company"
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    emailId: "",
    password: "",
    wasteType: "Plastic",
    pickupTimeFrom: "",
    pickupTimeTo: "",
    about: "",
    price: "",
    photoUrl: "",
  });

  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const endpoint =
        role === "user"
          ? `/auth/user/${isLoginForm ? "login" : "signup"}`
          : `/auth/company/${isLoginForm ? "login" : "signup"}`;
  
      // ✅ Only validate pickup time if role is company AND it's a signup
      if (!isLoginForm && role === "company") {
        if (!formData.pickupTimeFrom || !formData.pickupTimeTo) {
          return setError("Please select a valid pickup time range.");
        }
      }
  
      const data =
        role === "user"
          ? isLoginForm
            ? {
                emailId: formData.emailId,
                password: formData.password,
              }
            : {
                firstName: formData.firstName,
                lastName: formData.lastName,
                emailId: formData.emailId,
                password: formData.password,
              }
          : isLoginForm
          ? {
              emailId: formData.emailId,
              password: formData.password,
            }
          : {
              companyName: formData.companyName,
              emailId: formData.emailId,
              password: formData.password,
              wasteType: formData.wasteType,
              pickupTime: `${formData.pickupTimeFrom} - ${formData.pickupTimeTo}`,
              price: formData.price,
              about: formData.about,
              photoUrl: formData.photoUrl,
            };

      const res = await axios.post(BASE_URL + endpoint, data, {
        withCredentials: true,
      });

      const responseData = res.data;

     
    // Dispatch separately based on role
    // if (role === "user") {
    //     dispatch(addUser({ ...responseData, role: "user" }))
    //   } else {
    //     dispatch(addCompany({ ...responseData, role: "company" }))
    //   }

      if (isLoginForm) {
        // If logging in → save to store and go to profile
        if (role === "user") {
          dispatch(addUser({ ...responseData, role: "user" }));
        } else {
          dispatch(addCompany({ ...responseData, role: "company" }));
        }
      
        localStorage.setItem("role", role);
        localStorage.setItem("profile", JSON.stringify(responseData));
      
        navigate("/profile");
      } else {
        // If signing up → switch to login form and redirect to login
        setIsLoginForm(true); // switch form to login mode
        navigate("/login");   // redirect to login route
      }
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            {isLoginForm ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="text-center text-gray-500 mt-2">
            {isLoginForm
              ? "Log in to your account"
              : "Create your account to get started"}
          </p>
        </div>

        {/* Toggle Role */}
        <div className="flex justify-center gap-4 mb-8 p-1 bg-gray-100 rounded-lg">
          <button
            className={`px-6 py-2 rounded-md font-medium transition duration-200 w-1/2 ${
              role === "user"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setRole("user")}
          >
            User
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium transition duration-200 w-1/2 ${
              role === "company"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setRole("company")}
          >
            Company
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleFormSubmit}>
          {/* Fields based on role + isLoginForm */}
          {!isLoginForm && role === "user" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your First Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your Last Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                />
              </div>
            </div>
          )}

          {!isLoginForm && role === "company" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter Company Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo URL</label>
                <input
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                <select
                  name="wasteType"
                  value={formData.wasteType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white text-gray-500"
                >
                  <option value="Plastic">Plastic</option>
                  <option value="Organic">Organic</option>
                  <option value="Metal">Metal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per KG</label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                />
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
      onChange={handleInputChange}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
    />
    <span className="self-center text-gray-600">to</span>
    <input
      type="time"
      name="pickupTimeTo"
      value={formData.pickupTimeTo || ""}
      onChange={handleInputChange}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
    />
  </div>
</div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  placeholder="Tell us about you"
                  type="number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
                ></textarea>
              </div>
            </>
          )}

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="emailId"
              value={formData.emailId}
              onChange={handleInputChange}
              placeholder="Enter your Email"
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your Password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-teal-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a10.056 10.056 0 012.218-3.673m3.756-2.31A9.969 9.969 0 0112 5c4.478 0 8.269 2.943 9.543 7a10.059 10.059 0 01-4.132 5.411m-3.184-1.44a3 3 0 11-4.242-4.243"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition duration-200 shadow-md transform hover:-translate-y-0.5"
          >
            {isLoginForm ? "Log In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p
            onClick={() => setIsLoginForm((prev) => !prev)}
            className="text-sm text-gray-600 hover:text-teal-600 cursor-pointer inline-block border-b border-dashed border-gray-400 pb-0.5 transition"
          >
            {isLoginForm
              ? "New Here? Create an account"
              : "Already have an account? Log in"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;