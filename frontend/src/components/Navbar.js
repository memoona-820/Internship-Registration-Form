import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('adminUser');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">🎓</div>
        InternHub
      </Link>

      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          Register
        </NavLink>
        <NavLink to="/my-record" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          My Record
        </NavLink>

        {token ? (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/programs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Programs
            </NavLink>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '0 4px' }}>
              👤 {user}
            </span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <NavLink to="/admin/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Admin Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}
