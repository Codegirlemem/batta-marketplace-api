# Batta Marketplace API

Batta Marketplace API is the backend service that handles users, products, carts, and orders for the Batta Marketplace e-commerce platform. It is built to provide secure, role-based and reliable API endpoints for client applications and is designed for production-ready deployment.

## 🚀 Project Overview

This project was developed as part of an academic graded assessment to demonstrate backend development, RESTful API design, and database integration for an e-commerce application using Node.js, Express, TypeScript, MongoDB, and Mongoose.

The API handles:

- User registration and authentication
- Role-based access control (Admin and User)
- Secure password hashing
- Input validation and data sanitization
- Full CRUD operations
- Product and category management
- Cart functionality
- Order lifecycle management
- Secure route protection
- Centralized error handling

## 🛠 Tech Stack

### Backend & Core

- Node.js
- Express.js
- TypeScript
- Mongoose

### Database

- MongoDB Atlas (Cloud-hosted NoSQL database)

### Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt (password hashing)

### Validation & Data Protection

- Zod (schema validation)
- dotenv (environment configuration)

### File Upload & Media Storage

- Multer (file handling middleware)
- Cloudinary (cloud image storage)

### API Testing & Development

- Postman
- nodemon

### Hosting & Deployment

- Cloud application hosting (can be deployed on any platform such as Render, Heroku, or Vercel)

## 📂 Project Structure

```
batta-marketplace-api/
│
├── src/
│ ├── types/ ── Custom TypeScript type definitions
│ ├── controllers/ ── API business logic
│ ├── models/ ── Mongoose schemas and models
│ ├── routes/ ── Express route definitions
│ ├── middleware/ ── Authentication, validation, error handling
│ ├── utils/ ── Helper and utility functions
│ ├── config/ ── DB, Cloudinary, and other config files
│ ├── zodSchemas ── Zod validation schema declarations
│ └── server.ts ── Server entry point
│
├── .env ── Environment variables
├── nodemon.json ── Nodemon configuration for development
├── package.json ── Project dependencies and scripts
├── tsconfig.json ── TypeScript configuration
├── .gitignore ── Ignored files and folders
└── README.md ── Project documentation
```

## 🔐 Security & Access

The API implements secure authentication and role-based access control to protect user data and restrict actions based on user roles.

### Authentication

- Users sign up with **hashed passwords** using bcrypt
- Login returns a **JSON Web Token (JWT)** stored as an **HttpOnly cookie** for secure session management
- Protected routes require a valid JWT for access
- Token verification middleware ensures only authenticated users can access certain endpoints

### Role-Based Access (Authorization)

- **Admin**: Can create, view, update, and delete products and categories as well as update order status.
- **User**: Can view all products and products by categories, manage their cart, and place orders
- Middleware checks the user’s role before allowing access to restricted routes

### Input Validation & Sanitization

- Uses **Zod** to validate incoming data
- Ensures that invalid or malicious data is rejected before reaching the database

### Database

- Data is stored in **MongoDB Atlas** (cloud-hosted NoSQL database)
- **Mongoose** is used for schema definition and data modeling
- Relationships handled via references (e.g., user → orders, product → category)
- Database connection is secured via environment variables and proper credentials

## 📦 Core Features

### 👤 Users

- Register new users (User)
- Login users (User)
- Logout users (User)
- Reset password (User)
- Get, update and delete profile (User)
- Get all users profile and get single profile (Admin)
- Role-based access control (Admin / User)

### 👤 Invitation

- Send admin invite, view all invites and delete invites (Admin)
- Accept admin invite (User)

### 🛍 Products

- Create products (**Admin only**)
- Update products (**Admin only**)
- Delete products (**Admin only**)
- Fetch all products (User & Admin)
- Fetch single product by ID (User & Admin)

### 📂 Categories

- Create categories (**Admin only**)
- Update categories (**Admin only**)
- Delete categories (**Admin only**)
- Fetch all categories (User & Admin)

### 🛒 Cart

- Add items to cart (User)
- Remove items from cart (User)
- Update item quantity in cart (User)
- View cart (User and Admin)
- View all carts (Admin)

### 📑 Orders

- Create, update, cancel and pay for orders (User)
- View orders for the authenticated user (User)
- Admin: manage all orders (view all, update status) (Admin)

## ⚙️ Installation & Setup

### Clone the repository

```bash
git clone https://github.com/your-username/batta-marketplace-api.git
cd batta-marketplace-api
```

### Install dependencies:

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the root directory and add the following:

```env
MONGODB_URI=<your-atlas-connection-string>
JWT_SECRET=<your-secret-key>
COOKIE_NAME=token
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

> 🔒 **Note:** Replace the placeholder values with your own secrets.

### Set up `nodemon.json` file

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "node --loader ts-node/esm src/server.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Add script to package.json file

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Start the development server:

```bash
npm run dev
```

### Start the production server:

```bash
npm run build && npm start
```

### 📌 API Base URL

[`https://batta-marketplace-api.onrender.com`](https://batta-marketplace-api.onrender.com)

## 🎯 Learning Objectives

This project demonstrates:

- RESTful API architecture
- MVC pattern implementation
- User authentication and **role-based authorization**
- Middleware usage for **route protection, input validation, and error handling**
- **Secure password storage** with bcrypt
- **JWT-based session management** using HttpOnly cookies
- Input validation and sanitization (Zod)
- Database schema design using MongoDB and Mongoose
- CRUD operations for Users, Products, Categories, Cart, and Orders
- Cloud-based file storage integration (Cloudinary)

## 📖 Future Improvements

Potential enhancements for this project include:

- Payment gateway integration for real transactions
- Product reviews and ratings system
- Advanced filtering, search, and sorting functionality
- **Email and SMS notifications** for order updates and user alerts
- Enhanced API documentation using Swagger
- Additional security features like rate limiting and data encryption

## 👨‍💻 Author

Developed by **Emem Eduoku**  
Node.js Backend Developer

📧 Contact: [eduokuemem@gmail.com](mailto:eduokuemem@gmail.com)
