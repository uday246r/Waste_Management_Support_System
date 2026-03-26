import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFromFeed } from "../utils/feedSlice";
import { addPickupRequest } from "../utils/pickupSlice";

const CompanyCard = ({ company }) => {
  console.log("CompanyCard company:", company);

  const {
    _id,
    companyName,
    photoUrl,
    price,
    wasteType,
    pickupTimeFrom,
    pickupTimeTo,
    location,
    about,
    email,
  } = company;

  const [isHovered, setIsHovered] = useState(false);
  const [buttonState, setButtonState] = useState("idle"); // idle | sending | sent | error
  const dispatch = useDispatch();

  const handleSendRequest = async () => {
    try {
      setButtonState("sending");
      await axios.post(
        `${BASE_URL}/pickup/send/pending/${_id}`,
        {},
        { withCredentials: true }
      );
      setButtonState("sent");
      dispatch(removeFromFeed(_id));

      // Dispatch the new request with 'pending' status to the Redux store
      dispatch(addPickupRequest({ companyId: _id, status: "pending" }));
    } catch (err) {
      console.error("Failed to send request:", err);
      setButtonState("error");
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 ease-in-out max-w-md mx-auto border border-gray-100 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between p-4 items-center">
        <div className="flex items-center space-x-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={companyName}
              className="w-16 h-16 object-cover rounded-full border-2 border-teal-100"
            />
          ) : (
            <div className="w-16 h-16 bg-teal-100 rounded-full flex justify-center items-center">
              <svg
                className="w-8 h-8 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 7a5 5 0 11-10 0 5 5 0 0110 0zM12 17a7 7 0 00-7-7h14a7 7 0 00-7 7z"
                />
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {companyName}
            </h2>
            <p className="text-sm text-gray-600">{wasteType}</p>
          </div>
        </div>
      </div>

      {/* Improved info section with icons and better styling */}
      <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">{location}</span>
        </div>
        
        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">
            {pickupTimeFrom && pickupTimeTo
              ? `${pickupTimeFrom} - ${pickupTimeTo}`
              : "No pickup time available"}
          </span>
        </div>
      </div>

      <div className="p-4 text-gray-600">
        <p className="text-sm">{about}</p>
      </div>

      <div className="flex justify-between items-center px-4 pb-4">
        <div className="bg-teal-50 px-4 py-2 rounded-lg">
          <span className="font-bold text-lg text-teal-600">Rs {price}</span>
          <span className="text-sm text-teal-500">/kg</span>
        </div>
        
        <button
          className={`px-4 py-2 text-white rounded-lg transition-all duration-300 flex items-center ${
            buttonState === "sending"
              ? "bg-gray-400"
              : buttonState === "sent"
              ? "bg-teal-600"
              : "bg-teal-500 hover:bg-teal-600"
          } ${buttonState === "error" ? "bg-red-600" : ""}`}
          disabled={buttonState === "sending"}
          onClick={handleSendRequest}
        >
          {buttonState === "sent" && (
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {buttonState === "sending"
            ? "Sending..."
            : buttonState === "sent"
            ? "Request Sent"
            : "Send Request"}
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;