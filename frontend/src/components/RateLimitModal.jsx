import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { apiErrorToString } from "../utils/apiErrorMessage";
import { RATE_LIMIT_MODAL_DEFAULT_SECONDS } from "../utils/constants";

const RateLimitModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const handleRateLimit = (e) => {
      const retryAfter = Number(e.detail?.retryAfter) || RATE_LIMIT_MODAL_DEFAULT_SECONDS;
      const raw = e.detail?.message;
      const message =
        typeof raw === "string"
          ? raw
          : apiErrorToString(
              raw,
              "You are moving a bit too fast and have hit our system limits."
            );

      setIsOpen(true);
      setAlertMessage(message);
      setCountdown((current) => Math.max(current, retryAfter));
    };

    window.addEventListener("rate-limit-hit", handleRateLimit);
    return () => window.removeEventListener("rate-limit-hit", handleRateLimit);
  }, []);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return undefined;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen && countdown <= 0) {
      setIsOpen(false);
    }
  }, [isOpen, countdown]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all duration-300 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-limit-title"
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 text-center transform scale-100 transition-all">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-bounce shadow-inner">
            <TriangleAlert className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h2 id="rate-limit-title" className="text-2xl font-bold mb-3 text-gray-800">
          Please slow down!
        </h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">{alertMessage}</p>

        <div className="bg-teal-50 p-4 rounded-xl mb-6 border border-teal-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600/70 mb-1">
            Cooldown Auto-Reset
          </p>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-3xl font-mono font-bold text-teal-700">{countdown}</span>
            <span className="text-lg text-teal-600/80 font-medium">s</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium h-12 shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-0.5"
          onClick={() => {
            setIsOpen(false);
            setCountdown(0);
          }}
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
};

export default RateLimitModal;
