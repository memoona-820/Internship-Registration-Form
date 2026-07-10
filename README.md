# InternHub — Internship Management System (Final Project)

> MERN Stack Development — Weeks 1–3 Final Project
> Built with React, Node.js, Express.js & MongoDB

A full-stack internship management system covering the complete lifecycle of an
internship application — public registration, applicant self-service (view/edit/
delete their own record), and an admin dashboard with analytics, search, filtering,
bulk actions, and CSV export.

---

## ✅ Final Requirements Checklist

| Requirement | Status | Notes |
|---|---|---|
| User Authentication | ✅ | JWT-based admin login, bcrypt password hashing, protected setup-key registration |
| Complete CRUD Operations | ✅ | Internships, Programs, and applicant self-service all support Create/Read/Update/Delete |
| Search & Filter | ✅ | Admin dashboard: search by name/email/CNIC/phone/institution + status/program filters + pagination |
| Responsive UI | ✅ | Mobile hamburger nav, responsive grids, horizontally-scrollable tables, tested down to 360px |
| Form Validation | ✅ | Client-side (inline errors) + server-side (Mongoose schema validation, regex checks) on every form |
| Error Handling | ✅ | Global Express error handler + 404 handler, React ErrorBoundary, toast notifications on every failure path |
| Clean Code Structure | ✅ | Feature-based folders, reusable components, consistent naming, no dead code |

---

## ✨ Features

- 🌐 **Public Registration Form** — 3-step wizard (Personal Info → Program & Education → Review & Submit) with a progress stepper
- 🔎 **Applicant Self-Service** ("My Record") — look up your application by email + CNIC, edit your details, or delete your own record
- 🔐 **Admin Authentication** — JWT + bcrypt, setup-key-protected one-time registration
- 📊 **Admin Dashboard** — live stat cards + charts (status breakdown, applications by program, 14-day trend)
- ✏️ **Edit / Delete Records** — modal-based editing and confirmation dialogs (no native browser prompts)
- ☑️ **Bulk Actions** — select multiple applicants and approve / reject / mark pending / delete them together
- ⬇️ **CSV Export** — export the current filtered result set to a downloadable CSV
- 🔍 **Live Search & Filters** — search by name/email/CNIC/phone/institution, filter by status and program, paginated results
- 🗂️ **Manage Programs** — full CRUD for internship tracks shown on the registration form
- 🌗 **Light / Dark Theme** — toggle with persisted preference
- 📱 **Responsive Design** — collapsible mobile navigation, adaptive layouts down to small phone widths

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt.js |
| Notifications | react-hot-toast |

---

## 📁 Project Structure

```
Internship-Registration-Form/
├── backend/
│   ├── models/
│   │   ├── Internship.js   # Application schema with regex/required validation
│   │   ├── Admin.js        # Admin with bcrypt password hashing
│   │   └── Program.js      # Internship tracks
│   ├── routes/
│   │   ├── internships.js  # Full CRUD + search/filter/pagination + bulk actions + CSV export data + stats
│   │   ├── admin.js        # Login & setup-key-protected register
│   │   └── programs.js     # Program CRUD
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Express app, 404 handler, centralized error handler
└── frontend/
    ├── public/
    │   └── index.html       # Theme bootstrap script (no flash of wrong theme)
    └── src/
        ├── components/
        │   ├── Navbar.js         # Sticky nav with mobile hamburger menu
        │   ├── ThemeToggle.js    # Light/dark mode toggle
        │   ├── Stepper.js        # Reusable progress stepper (registration wizard)
        │   ├── DashboardCharts.js# Recharts-based dashboard visualizations
        │   ├── EditModal.js      # Edit applicant modal
        │   ├── ConfirmModal.js   # Delete confirmation modal (used everywhere instead of window.confirm)
        │   └── ErrorBoundary.js  # Catches unexpected render errors gracefully
        ├── pages/
        │   ├── Home.js             # Public 3-step registration wizard
        │   ├── MyRecord.js         # Applicant self-service (lookup/edit/delete own record)
        │   ├── AdminLogin.js       # Admin login page
        │   ├── AdminDashboard.js   # Stats, charts, search/filter, pagination, bulk actions, CSV export
        │   └── ManagePrograms.js   # Program CRUD
        ├── styles/
        │   └── main.css          # CSS-variable-based theming (light + dark)
        ├── api.js                # Axios client with auth interceptor
        ├── App.js                # Routes + ErrorBoundary
        └── index.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Community Server running locally (or a MongoDB Atlas connection string)

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
# Edit .env and set MONGO_URI, JWT_SECRET, and ADMIN_SETUP_KEY
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

### 4. Create admin account (one-time, requires your ADMIN_SETUP_KEY)
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword","setupKey":"your_admin_setup_key"}'
```

Then login at **http://localhost:3000/admin/login**

---

## 🔌 API Endpoints

### Internships
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/internships | Public | Submit application |
| GET | /api/internships | Admin | Paginated list — supports `?search=&status=&program=&page=&limit=&exportAll=` |
| GET | /api/internships/stats/summary | Admin | Dashboard stat counts + by-program + trend data |
| POST | /api/internships/lookup | Public | Applicant looks up their own record by email + CNIC |
| PUT | /api/internships/my/:id | Public | Applicant updates their own record |
| DELETE | /api/internships/my/:id | Public | Applicant deletes their own record |
| PUT | /api/internships/:id | Admin | Full update/edit |
| PATCH | /api/internships/:id/status | Admin | Update status only |
| PATCH | /api/internships/bulk/status | Admin | Bulk status update for selected IDs |
| POST | /api/internships/bulk/delete | Admin | Bulk delete selected IDs |
| DELETE | /api/internships/:id | Admin | Delete a single record |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/admin/register | Setup key | One-time admin creation |
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
| `/` | 3-step public registration wizard with validation |
| `/my-record` | Applicant self-service — view, edit, or delete own application |
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Stats, charts, searchable/filterable/paginated applicant table, bulk actions, CSV export |
| `/admin/programs` | Program management |

---

## 👩‍💻 Developer

**Memoona** — MERN Stack Development Internship, Final Project
Built with ❤️ using the MERN Stack
