# Waste Management Frontend (Vite + React)

Deployed Link: https:wmss-eta.vercel.app

## Environment Setup

1. Duplicate `example.env` and rename it to `.env`.
2. Update `VITE_API_BASE_URL` with the URL of your backend (e.g. the deployed API).
3. Never commit `.env`; it's ignored via `.gitignore`.

With this in place, the frontend reads `import.meta.env.VITE_API_BASE_URL` for all API and socket calls (see `src/utils/constants.js`).
