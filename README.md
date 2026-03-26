# Waste Management Support System (WMSS)

A full-stack Waste Management Support System featuring a dynamic React frontend and a robust Node.js/Express backend. This platform facilitates effective waste management tracking, user and company profiles, and real-time support.

## Project Structure

This repository is a **Monorepo** containing both the frontend and backend applications, orchestrated seamlessly via Docker Compose.

- `/frontend` - The React application (built with Vite).
- `/backend` - The Node.js application (Express, MongoDB, Redis, JWT).
- `docker-compose.yml` - The orchestrator linking both services.

## Getting Started (Docker setup)

The absolute easiest way to run this application is using Docker. You do not need Node.js or MongoDB installed locally. 

**Prerequisites:** Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. Clone the repository completely:
   ```bash
   git clone https://github.com/your-username/Waste_Management_System_Monorepo.git
   cd Waste_Management_System_Monorepo
   ```

2. Make sure you have your `.env` files set up in both directories:
   - `/backend/.env`
   - `/frontend/.env`

3. Spin up the application using Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. The application is now live!
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:4000](http://localhost:4000)

## Tech Stack
- Frontend: React 19, Vite, TailwindCSS, DaisyUI, Redux Toolkit
- Backend: Node 20, Express, MongoDB (Atlas), Redis, Socket.io
- Infrastructure: Docker & Docker Compose
