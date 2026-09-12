# 🏠 Rentify

### Full-Stack Rental Property Platform

Rentify is a modern **MERN-based rental platform** designed to help users discover rental properties across India through intelligent search, advanced filtering, AI-powered recommendations, and real-time communication.

🔗 **Live Demo:** https://rentify-web-delta.vercel.app/

---

## ✨ Overview

Rentify provides a complete rental-property discovery experience for **tenants and property owners**.

The platform combines a responsive React frontend with a Node.js/Express backend, MongoDB database, real-time communication, cloud-based image storage, and AI-powered rental assistance.

### 👥 User Roles

* **Tenant** — Discover, filter, save and review properties
* **Property Owner** — Add, manage and showcase rental properties

---

## 🚀 Key Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* User registration and login
* Protected routes
* Role-based access control
* Tenant & Property Owner roles

### 🏡 Property Management

* Add, edit and delete properties
* Property image gallery
* Property details and amenities
* Availability status
* Featured listings
* Wishlist / saved properties

### 🔍 Intelligent Property Discovery

* Search by city and locality
* Advanced property filtering
* Budget-based filtering
* Property type filtering
* Furnishing filters
* Gender preference filters
* Sort by price and ratings

### 💬 Real-Time Communication

* Tenant ↔ Owner messaging
* Real-time chat using Socket.IO
* Instant notifications

### ⭐ Reviews & Ratings

* Property reviews
* Rating system
* Anonymous reviews
* Review analytics

### 🤖 AI-Powered Rental Assistance

* AI Locality Advisor
* AI Monthly Expense Predictor
* AI Property Recommendation System
* Personalized rental suggestions

### ❤️ User Experience

* Recently viewed properties
* Saved properties
* Responsive design
* Premium glassmorphism UI
* Smooth animations with Framer Motion

---

## 📊 Project Highlights

| Capability              | Implementation                      |
| ----------------------- | ----------------------------------- |
| Full-Stack Architecture | MERN                                |
| Authentication          | JWT                                 |
| Authorization           | Role-Based Access Control           |
| API Layer               | RESTful APIs                        |
| Real-Time Communication | Socket.IO                           |
| Database                | MongoDB + Mongoose                  |
| Image Storage           | Cloudinary                          |
| Property Discovery      | Search + Advanced Filters           |
| AI Features             | Recommendations + Rental Assistance |
| Frontend                | React + Vite                        |
| UI                      | Tailwind CSS + Framer Motion        |

---

## 🧠 Application Architecture

```text
                    ┌──────────────────────┐
                    │      React.js        │
                    │   Vite + Tailwind    │
                    └──────────┬───────────┘
                               │
                         REST APIs
                               │
                    ┌──────────▼───────────┐
                    │   Node.js + Express  │
                    │     API Server       │
                    └───────┬───────┬──────┘
                            │       │
                     ┌──────▼──┐  ┌─▼─────────┐
                     │ MongoDB │  │ Socket.IO │
                     │Mongoose │  │ Real-Time │
                     └─────────┘  └───────────┘
                            │
                     ┌──────▼──────┐
                     │  Cloudinary │
                     │Image Storage│
                     └─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Zustand
* Axios
* React Router DOM
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT Authentication
* Multer
* Cloudinary

---

## 📂 Project Structure

```text
Rentify/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── sockets/
│   └── utils/
│
└── README.md
```

---

## 🔑 Core Engineering Concepts

Rentify demonstrates practical implementation of:

* REST API architecture
* JWT authentication
* Role-based authorization
* MongoDB data modeling
* API integration
* Real-time WebSocket communication
* State management
* Image upload and cloud storage
* Search and filtering
* Responsive UI development
* AI-powered application features
* Modular backend architecture

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PrayagSingh9A7/Rentify.git
cd Rentify
```

### 2. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Configure environment variables

Create the required `.env` files for the client and server and add your MongoDB, JWT, Cloudinary and other required credentials.

### 4. Start the application

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend:

```bash
cd client
npm run dev
```

---

## 🌐 Deployment

The application is deployed and accessible through the live demo:

**https://rentify-web-delta.vercel.app/**

---

## 🎯 Why Rentify?

Rentify was built to go beyond a basic rental listing interface by combining:

**Property Discovery + Full-Stack Architecture + Real-Time Communication + AI Assistance**

into a single web application.

---

## 📌 Future Improvements

* Mobile application
* AI roommate matching
* Virtual property tours
* Visit scheduling
* Maintenance complaint portal
* Push notifications
* CI/CD improvements

---

## 📄 License

This project is developed for **educational and portfolio demonstration purposes**.

---

### ⭐ Built with React, Node.js, Express, MongoDB & Socket.IO

**Prayag Singh**
Full Stack Developer
