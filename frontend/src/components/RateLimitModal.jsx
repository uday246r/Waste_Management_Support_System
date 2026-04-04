import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const RateLimitModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const handleRateLimit = () => {
      if (!isOpen) setIsOpen(true);
      setCountdown(5);
    };
    window.addEventListener("rate-limit-hit", handleRateLimit);
    return () => window.removeEventListener("rate-limit-hit", handleRateLimit);
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && isOpen) {
      setIsOpen(false);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 text-center transform scale-100 transition-all m-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-bounce shadow-inner">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Please slow down!</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          You are moving a bit too fast and have hit our system limits.
          Please take a breather so we can keep the WMS platform safe and stable for everyone.
        </p>

        <div className="bg-teal-50 p-4 rounded-xl mb-6 border border-teal-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600/70 mb-1">Cooldown Auto-Reset</p>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-3xl font-mono font-bold text-teal-700">{countdown}</span>
            <span className="text-lg text-teal-600/80 font-medium">s</span>
          </div>
        </div>

        <button
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium h-12 shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-0.5"
          onClick={() => setIsOpen(false)}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default RateLimitModal;
