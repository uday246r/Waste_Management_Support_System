import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiErrorToString } from "../utils/apiErrorMessage.js";
import {
  RATE_LIMIT_MODAL_DEFAULT_SECONDS,
  sanitizeRateLimitCountdownSeconds,
} from "../utils/constants.js";

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-10 h-10 text-orange-500"
      aria-hidden
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const RateLimitModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const handleRateLimit = (e) => {
      console.log('Rate limit hit - showing modal', e.detail);
      const retryAfter = sanitizeRateLimitCountdownSeconds(
        e.detail?.retryAfter ?? RATE_LIMIT_MODAL_DEFAULT_SECONDS
      );
      const raw = e.detail?.message;
      let message;

if (typeof raw === "string") {
  message = raw;
} else {
  const parsed = apiErrorToString(
    raw,
    "You are moving a bit too fast and have hit our system limits."
  );

  message =
    typeof parsed === "string"
      ? parsed
      : parsed?.message ||
        "You are moving a bit too fast and have hit our system limits.";
}

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
      console.log('Rate limit modal closing');
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('rate-limit-end'));
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  // Ensure we have a valid document
  if (typeof document === "undefined") return null;

  let portalTarget = document.getElementById("rate-limit-modal-root");
  if (!portalTarget) {
    if (!document.body) return null;
    portalTarget = document.createElement("div");
    portalTarget.id = "rate-limit-modal-root";
    document.body.appendChild(portalTarget);
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all duration-300 p-4"
      style={{
        zIndex: 2147483647, // Maximum z-index value
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-limit-title"
    >
      <div
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 text-center transform scale-100 transition-all"
        style={{
          zIndex: 2147483647, // Maximum z-index value
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '28rem',
          width: '100%',
          border: '1px solid #f3f4f6',
          textAlign: 'center',
          transform: 'scale(1)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-bounce shadow-inner">
            <WarningIcon />
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
            console.log('Rate limit modal manually closed');
            setIsOpen(false);
            setCountdown(0);
            window.dispatchEvent(new CustomEvent('rate-limit-end'));
          }}
        >
          Got it
        </button>
      </div>
    </div>,
    portalTarget
  );
};

export default RateLimitModal;
