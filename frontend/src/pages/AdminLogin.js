import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/admin/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminUser', res.data.username);
      toast.success(`Welcome back, ${res.data.username}! 👋`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🔐</div>
          <h2 className="login-title">Admin Portal</h2>
          <p className="login-sub">Sign in to access the management dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-2">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            />
          </div>
          <div className="form-group mb-2">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-2"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in...' : '🔑 Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          First time? Create admin via API:<br />
          <code style={{ background: '#f4f6fb', padding: '2px 6px', borderRadius: 4, fontSize: '0.78rem' }}>
            POST /api/admin/register
          </code>
        </p>
      </div>
    </div>
  );
}
