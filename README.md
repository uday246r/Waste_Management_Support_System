# Backend Waste Management System

A Node.js + Express backend for a **Waste Management System** that connects **users** and **waste management companies**. The system supports authentication, pickup requests, scheduling, payments, messaging, and real-time features via sockets.

🔗 **Live Demo:** https://wmss-eta.vercel.app/

---

## 🚀 Features

### 👤 User Features

* User authentication (JWT based)
* Create and manage pickup requests
* Schedule waste pickups
* View request status (pending / accepted / rejected)
* Messaging with companies
* Profile management

### 🏢 Company Features

* Company authentication
* Accept / reject pickup requests
* Manage recyclable waste types
* Schedule pickups
* Payment handling
* Company profile management

### ⚙️ System Features

* Role-based authentication (User / Company)
* Secure JWT middleware
* MongoDB integration
* Modular MVC-like structure
* Socket-based real-time communication

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT, bcrypt
* **Realtime:** Socket.io
* **Environment Config:** dotenv

---

## 📁 Project Structure

```
src/
│
├── config/
│   ├── database.js        # MongoDB connection
│   └── env.js             # Environment variable loader
│
├── middlewares/
│   ├── auth.js            # User authentication middleware
│   └── companyAuth.js     # Company authentication middleware
│
├── models/
│   ├── user.js
│   ├── company.js
│   ├── Video.js
│   ├── connectionRequest.js
│   ├── message.js
│   ├── payment.js
│   └── schedulePickup.js
│
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── profile.js
│   ├── requests.js
│   ├── scheduleRequests.js
│   ├── payments.js
│   ├── message.js
│   ├── company.js
│   ├── companyProfile.js
│   ├── companyRoutes.js
│   └── videoRoutes.js
│
├── utils/
│   ├── socket.js          # Socket.io setup
│   ├── validation.js     # Common validations
│   └── validateCompany.js
│
├── app.js                 # Express app entry point
└── server.js (if present) # Server bootstrap
```

---

## 🔐 Authentication Flow

* JWT token generated on login/signup
* Token must be passed in headers:

```
Authorization: Bearer <token>
```

* Separate middleware for **users** and **companies**

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/Backend_Waste_Management_System.git
cd Backend_Waste_Management_System
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4️⃣ Run the Server

```bash
npm start
```

Server will start at:

```
http://localhost:5000
```

---

## 📌 API Overview

### Auth Routes

* `POST /auth/login`
* `POST /auth/signup`

### User Routes

* `GET /users/profile`
* `POST /requests/send`
* `GET /requests/status`

### Company Routes

* `GET /company/profile`
* `POST /company/accept-request`
* `POST /company/reject-request`

### Pickup & Schedule

* `POST /schedule`
* `GET /schedule/:id`

*(Detailed API documentation can be added later)*

---

## 🔄 Real-time Features

* Socket.io used for:

  * Messaging
  * Live request updates

---

## ✅ Future Improvements

* Admin panel
* Notification system
* Advanced analytics dashboard
* Rate limiting & security hardening

---

## 👨‍💻 Author

**Uday**
Backend Developer | MERN Stack

---

## ⭐ Support

If you find this project useful, please ⭐ star the repository!
