import React,{ StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import axios from 'axios';
import { apiErrorToString } from './utils/apiErrorMessage.js';
import { RATE_LIMIT_MODAL_DEFAULT_SECONDS } from './utils/constants.js';

const MAX_RETRY_DISPLAY_SEC = 86400;

function retryAfterSecondsFrom429(error) {
  const headers = error.response?.headers || {};
  const h = (name) => {
    const v = headers[name];
    return v === undefined || v === null ? '' : String(v);
  };

  const fromRetryAfter = h('retry-after');
  if (fromRetryAfter !== '' && !Number.isNaN(Number(fromRetryAfter))) {
    return Math.max(1, Math.min(MAX_RETRY_DISPLAY_SEC, parseInt(fromRetryAfter, 10)));
  }

  const bodyRa = error.response?.data?.retryAfter;
  if (bodyRa != null && !Number.isNaN(Number(bodyRa))) {
    return Math.max(1, Math.min(MAX_RETRY_DISPLAY_SEC, parseInt(String(bodyRa), 10)));
  }

  const reset = h('x-ratelimit-reset');
  if (reset !== '' && !Number.isNaN(Number(reset))) {
    const wait = Number(reset) - Math.floor(Date.now() / 1000);
    return Math.max(1, Math.min(MAX_RETRY_DISPLAY_SEC, wait));
  }

  return RATE_LIMIT_MODAL_DEFAULT_SECONDS;
}

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
        const retryAfter = retryAfterSecondsFrom429(error);

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
