import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import axios from 'axios';
import { apiErrorToString } from './utils/apiErrorMessage.js';
import {
  RATE_LIMIT_MODAL_DEFAULT_SECONDS,
  sanitizeRateLimitCountdownSeconds,
} from './utils/constants.js';

// Import test utilities for production debugging
import './utils/testRateLimitModal.js';

function retryAfterSecondsFrom429(error) {
  const headers = error.response?.headers || {};
  const h = (name) => {
    const v = headers[name];
    return v === undefined || v === null ? '' : String(v);
  };

  const fromRetryAfter = h('retry-after');
  if (fromRetryAfter !== '') {
    const parsed = parseInt(fromRetryAfter, 10);
    if (Number.isFinite(parsed)) {
      return sanitizeRateLimitCountdownSeconds(parsed);
    }
  }

  const bodyRa = error.response?.data?.retryAfter;
  if (bodyRa != null && bodyRa !== '') {
    const parsed = parseInt(String(bodyRa), 10);
    if (Number.isFinite(parsed)) {
      return sanitizeRateLimitCountdownSeconds(parsed);
    }
  }

  const reset = h('x-ratelimit-reset');
  if (reset !== '') {
    const resetUnix = Number(reset);
    if (Number.isFinite(resetUnix)) {
      const wait = resetUnix - Math.floor(Date.now() / 1000);
      return sanitizeRateLimitCountdownSeconds(wait);
    }
  }

  return RATE_LIMIT_MODAL_DEFAULT_SECONDS;
}

// Global Axios Default
axios.defaults.withCredentials = true;

// Global Axios Interceptor for Rate Limiting (429) & Auth (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 429) {
        const message = apiErrorToString(
          error.response.data,
          'Too many requests. Please try again.'
        );
        const retryAfter = sanitizeRateLimitCountdownSeconds(
          retryAfterSecondsFrom429(error)
        );

        window.dispatchEvent(
          new CustomEvent('rate-limit-hit', {
            detail: { message, retryAfter }
          })
        );
      } else if (error.response.status === 401) {
        // Handle unauthorized requests globally
        if (window.location.pathname !== '/login' && window.location.pathname !== '/gate') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('WMS: #root element not found — check index.html');
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
