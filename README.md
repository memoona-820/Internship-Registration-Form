# InternHub — Internship Registration Portal

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing internship applications. Applicants can register through a public form, and admins can log in to a protected dashboard to review applications, update statuses, and manage available internship programs.

## Features

- **Public registration form** — applicants submit name, father's name, email, phone, CNIC, and choose a technology track
- **Admin authentication** — secure login using JWT tokens and hashed passwords (bcrypt)
- **Admin dashboard** — view all applicants, update status (pending / approved / rejected), and delete records
- **Dynamic program management** — admins can add, edit, or deactivate internship tracks, which automatically update on the public registration form
- **Data persistence** — all data stored in MongoDB

## Tech Stack

| Layer    | Technology              |
|----------|--------------------------|
| Frontend | React, React Router      |
| Backend  | Node.js, Express          |
| Database | MongoDB, Mongoose         |
| Auth     | JWT, bcrypt.js             |

## Project Structure

internship-app/
├── backend/
│   ├── models/        # Mongoose schemas (Internship, Admin, Program)
│   ├── routes/        # Express API routes
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # App entry point
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/       # Page-level components (Home, AdminLogin, AdminDashboard, ManagePrograms)
    │   ├── api.js        # Axios API client
    │   └── App.js
    └── package.json

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Community Server

### 1. Clone the repository

git clone <your-repo-url>
cd internship-app

### 2. Backend setup

cd backend
npm install

Create a `.env` file inside the `backend` folder with the following:

MONGO_URI=mongodb://localhost:27017/internship_db
PORT=5000
JWT_SECRET=your_secret_key_here

Start the backend server:

npm start

You should see:
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000

### 3. Frontend setup

In a new terminal:

cd frontend
npm install
npm start

The app will open automatically at http://localhost:3000.

### 4. Create the first admin account

With the backend running, send a one-time request to create an admin account:

curl -X POST http://localhost:5000/api/admin/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"yourpassword\"}"

Then log in at http://localhost:3000/admin/login.

## API Endpoints

| Method | Endpoint                       | Access | Description                       |
|--------|---------------------------------|--------|-------------------------------------|
| POST   | /api/internships              | Public | Submit a new application           |
| GET    | /api/internships              | Admin  | Get all applicants                  |
| PATCH  | /api/internships/:id/status   | Admin  | Update applicant status             |
| DELETE | /api/internships/:id          | Admin  | Delete an applicant record          |
| POST   | /api/admin/login              | Public | Admin login                         |
| GET    | /api/programs                 | Public | List active programs                |
| GET    | /api/programs/all             | Admin  | List all programs                   |
| POST   | /api/programs                 | Admin  | Add a new program                   |
| PATCH  | /api/programs/:id              | Admin  | Edit a program                       |
| DELETE | /api/programs/:id              | Admin  | Delete a program                     |

## License

This project was built for educational/internship purposes.