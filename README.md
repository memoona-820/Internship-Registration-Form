# InternHub v2.0 — Internship Management System

> **Upgraded from Week 1 Registration Portal → Full Management System**

A MERN stack application for managing internship applications end-to-end — from public registration to admin review, editing, deletion, and search.

---

## 🆕 What's New in v2.0

| Feature | v1 (Registration) | v2 (Management) |
|---|---|---|
| Submit applications | ✅ | ✅ |
| View all applicants | ✅ Admin only | ✅ Improved table |
| **Edit records** | ❌ | ✅ Full edit modal |
| **Delete records** | ✅ Basic | ✅ With confirm dialog |
| **Search applicants** | ❌ | ✅ Live search |
| **Filter by status/program** | ❌ | ✅ Multi-filter |
| **Stats dashboard** | ❌ | ✅ 4 stat cards |
| **Improved UI** | Basic | ✅ Professional design |
| Form validation | Basic | ✅ Enhanced |

---

## ✨ Features

- 🌐 **Public Registration Form** — applicants submit name, father's name, email, phone, CNIC, program, qualification, institution
- 🔐 **Admin Authentication** — JWT + bcrypt login
- 📊 **Admin Dashboard** — stats overview (total, pending, approved, rejected)
- ✏️ **Edit Records** — update any applicant's details via a modal
- 🗑️ **Delete Records** — with confirmation dialog to prevent accidents
- 🔍 **Live Search** — search by name, email, CNIC, phone, institution
- 🎛️ **Filters** — filter by status (pending/approved/rejected) and program
- 🔄 **Status Management** — change status inline from the table
- 🗂️ **Manage Programs** — add, edit, activate/deactivate internship tracks
- 📱 **Responsive Design** — works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt.js |
| Notifications | react-hot-toast |

---

## 📁 Project Structure

```
internship-management/
├── backend/
│   ├── models/
│   │   ├── Internship.js   # Application schema (+ qualification, institution fields)
│   │   ├── Admin.js        # Admin with bcrypt
│   │   └── Program.js      # Internship tracks
│   ├── routes/
│   │   ├── internships.js  # Full CRUD + search/filter
│   │   ├── admin.js        # Login & register
│   │   └── programs.js     # Program management
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js       # Sticky nav with auth state
        │   ├── EditModal.js    # ✨ NEW: Edit applicant modal
        │   └── ConfirmModal.js # ✨ NEW: Delete confirmation
        ├── pages/
        │   ├── Home.js             # Public registration form
        │   ├── AdminLogin.js       # Login page
        │   ├── AdminDashboard.js   # ✨ UPGRADED: Main management
        │   └── ManagePrograms.js   # Program CRUD
        ├── styles/
        │   └── main.css        # ✨ Fully redesigned
        ├── api.js              # Axios client
        ├── App.js
        └── index.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Community Server running locally

### 1. Clone & navigate
```bash
git clone https://github.com/memoona-820/Internship-Registration-Form.git
cd Internship-Registration-Form
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```
App opens at **http://localhost:3000**

### 4. Create admin account (one-time)
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

Then login at **http://localhost:3000/admin/login**

---

## 🔌 API Endpoints

### Internships
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/internships | Public | Submit application |
| GET | /api/internships | Admin | Get all (supports `?search=&status=&program=`) |
| GET | /api/internships/:id | Admin | Get single applicant |
| PUT | /api/internships/:id | Admin | **NEW** Full update/edit |
| PATCH | /api/internships/:id/status | Admin | Update status only |
| DELETE | /api/internships/:id | Admin | Delete record |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/admin/register | Public | One-time admin creation |
| POST | /api/admin/login | Public | Get JWT token |

### Programs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/programs | Public | Active programs |
| GET | /api/programs/all | Admin | All programs |
| POST | /api/programs | Admin | Add program |
| PATCH | /api/programs/:id | Admin | Edit/toggle program |
| DELETE | /api/programs/:id | Admin | Delete program |

---

## 📸 Screenshots

| Page | Description |
|---|---|
| `/` | Public registration form with validation |
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Stats + searchable applicant table with edit/delete |
| `/admin/programs` | Program management |

---

## 👩‍💻 Developer

**Memoona** — Internship Task Week 2 Submission  
Built with ❤️ using MERN Stack
