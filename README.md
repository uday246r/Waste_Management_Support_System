# Waste Management System – Frontend ♻️

A modern **Waste Management System Frontend** built using **React + Vite**, designed to connect users with waste management companies. Users can send pickup requests, track statuses, and companies can manage and respond to those requests efficiently.

🔗 **Live Demo:** https://wmss-eta.vercel.app/

---

## 🚀 Features

### 👤 User Features
- User authentication (Login / Signup)
- View waste management companies
- Send pickup requests to companies
- Track request status (Pending / Accepted / Rejected)
- View connections and interactions
- Video / feed-based engagement system

### 🏢 Company Features
- Company authentication
- View incoming pickup requests
- Accept or reject pickup requests
- Manage company profile
- View connected users

### 🌐 General
- Responsive UI
- Redux state management
- Protected routes
- API integration with backend
- Deployed on **Vercel**

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite
- **State Management:** Redux Toolkit
- **Styling:** CSS
- **Routing:** React Router DOM
- **API Handling:** Axios / Fetch
- **Linting:** ESLint
- **Deployment:** Vercel

---

## 📁 Project Structure

```

waste_management/
├── public/
├── src/
│   ├── components/      # Reusable UI components
│   ├── charts/          # Chart-related components
│   ├── utils/           # Redux slices & utilities
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/uday246r/Waste_Management_System_Frontend.git
cd Waste_Management_System_Frontend/waste_management
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start development server

```bash
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BASE_URL=https://your-backend-api-url
```

> ⚠️ Make sure the backend supports CORS for production deployment.

---

## 📦 Deployment

The project is deployed using **Vercel**.

To deploy:

```bash
npm run build
```

Vercel automatically detects Vite configuration.

---

## 🧪 Future Improvements

* UI/UX enhancements
* Role-based route protection
* Real-time notifications
* Better error handling
* Admin dashboard

---

## 👨‍💻 Author

**Uday**
B.E. CSE Student
Frontend & MERN Developer

🔗 GitHub: [https://github.com/uday246r](https://github.com/uday246r)

---

## 📜 License

This project is licensed under the **MIT License**.

