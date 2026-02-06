# Bolt ⚡

Bolt is a full-stack grocery ordering web application inspired by Blinkit.  
It focuses on real-world backend architecture including authentication, cart flow, order management, and Razorpay payment integration.

This project was built as a **learning + portfolio project** with production-style backend practices.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User signup & login using JWT
- Protected routes
- Role-based access (User / Admin)

### 🛒 Products
- Create, update, delete products (Admin)
- Browse products (User)
- Stock & availability management

### 🧺 Cart
- Add/remove items
- Update quantities
- User-specific cart

### 📦 Orders
- Place orders from cart
- View order history (User)
- View & manage all orders (Admin)
- Order lifecycle: pending → confirmed → delivered

### 💳 Payments (Razorpay)
- Razorpay order creation
- Secure payment verification using signature validation
- Payment & order status synchronization
- Support for COD and online payments

---

## 🛠 Tech Stack

**Backend**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

**Payments**
- Razorpay (Test Mode)
- HMAC SHA256 signature verification

**Tools**
- Nodemon
- PowerShell / curl for API testing

---

## 🧠 Core Backend Concepts Implemented

- RESTful API design
- Schema modeling & validation
- Secure authentication & authorization
- Payment gateway integration
- Cryptographic signature verification
- Separation of concerns (routes, controllers, models, middleware)

---

## 📁 Project Structure

