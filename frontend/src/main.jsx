import React,{ StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import axios from 'axios';

// Global Axios Interceptor for Rate Limiting (429) & Auth (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 429) {
        // Extract dynamically provided retry-after from headers (convert seconds to ms, or default to 5000)
        let retryAfterMs = 5000;
        const retryHeader = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset'];
        if (retryHeader && !isNaN(Number(retryHeader))) {
            retryAfterMs = Number(retryHeader) * 1000;
        }

        const message = error.response.data?.message || "Too many requests. Please try again.";

        window.dispatchEvent(
          new CustomEvent('rate-limit-hit', { 
            detail: { message, retryAfter: Math.ceil(retryAfterMs / 1000) } 
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
