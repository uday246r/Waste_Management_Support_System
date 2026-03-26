import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { canAccessLogin } from "../utils/gateGuard";
import { GATE_KEYS } from "../utils/gateKeys";

const SUPPORT_EMAIL = "udaychauhan246r@gmail.com";

const Gate = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(BASE_URL + "/api/gate/password")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(GATE_KEYS.PWD, data.password);
        localStorage.setItem(GATE_KEYS.EXPIRY, String(data.expiresAt));
        setExpiresAt(data.expiresAt);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (canAccessLogin()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(BASE_URL + "/api/gate/verify", {
        password: password,
      });

      if (res.data.valid) {
        localStorage.setItem(GATE_KEYS.ACCESS, "true");
        navigate("/login");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Verification failed");
    }
  };

  const formatExpiry = (ts) => {
    if (!ts) return null;
    const d = new Date(Number(ts));
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isExpired = expiresAt && Date.now() > Number(expiresAt);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Gate Access
          </h2>
          <p className="text-center text-gray-500 mt-2">
            Enter the gate password to access login
          </p>
        </div>

        {expiresAt && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              isExpired
                ? "bg-amber-50 border border-amber-200 text-amber-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            <span className="font-medium">
              {isExpired ? "Password expired at: " : "Valid until: "}
            </span>
            {formatExpiry(expiresAt)}
            {isExpired && (
              <p className="mt-1 text-amber-700">
                Refresh this page to get the new password.
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 text-center">
          To obtain the current password, contact:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-teal-600 hover:underline font-medium"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gate Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter gate password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-800"
              autoComplete="off"
            />
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
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Gate;
