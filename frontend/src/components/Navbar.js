import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('adminUser');
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically whenever the route changes
  React.useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
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
            <span className="navbar-user">👤 {user}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <NavLink to="/admin/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Admin Login
          </NavLink>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
