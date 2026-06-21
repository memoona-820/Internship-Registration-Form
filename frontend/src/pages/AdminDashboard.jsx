import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInternships, deleteInternship, updateInternshipStatus } from '../api';
import ManagePrograms from './ManagePrograms';

const TECH_COLORS = {
  'React':           '#61dafb',
  'Node.js':         '#84cc16',
  'Python':          '#facc15',
  'Java':            '#f97316',
  'Machine Learning':'#a78bfa',
  'Data Science':    '#fb7185',
  'DevOps':          '#38bdf8',
  'Flutter':         '#67e8f9',
  'UI/UX Design':    '#f472b6',
  'Cybersecurity':   '#4ade80',
};

const STATUS_COLORS = {
  pending: '#facc15',
  approved: '#4ade80',
  rejected: '#f87171',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('applicants'); // 'applicants' | 'programs'
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchInternships();
      setApplicants(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
        return;
      }
      setError('Could not load applicants. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this applicant record?')) return;
    setDeletingId(id);
    try {
      await deleteInternship(id);
      setApplicants((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert('Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateInternshipStatus(id, status);
      setApplicants((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
    } catch {
      alert('Status update failed. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-logo">🧭</span>
            <span className="header-name">InternHub Admin</span>
          </div>
          <nav className="header-nav">
            <span className="header-badge">{localStorage.getItem('adminUsername')}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="tab-switcher">
          <button
            className={`tab-btn ${tab === 'applicants' ? 'tab-btn--active' : ''}`}
            onClick={() => setTab('applicants')}
          >
            Applicants
          </button>
          <button
            className={`tab-btn ${tab === 'programs' ? 'tab-btn--active' : ''}`}
            onClick={() => setTab('programs')}
          >
            Manage Programs
          </button>
        </div>

        {tab === 'programs' ? (
          <ManagePrograms />
        ) : (
        <div className="card admin-dashboard-card">
          <div className="card-header">
            <div className="card-icon">📋</div>
            <h2 className="card-title">Registered Applicants</h2>
            <p className="card-subtitle">
              {loading ? 'Loading…' : `${applicants.length} applicant${applicants.length !== 1 ? 's' : ''} registered`}
            </p>
          </div>

          {error && (
            <div className="alert alert--error">
              <span className="alert-icon">⚠️</span>{error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
              <p>Fetching records…</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗂️</div>
              <p>No applications yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="applicants-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Father's Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>CNIC</th>
                    <th>Technology</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a, i) => (
                    <tr key={a._id} className="table-row">
                      <td className="row-index">{i + 1}</td>
                      <td className="row-name">{a.name}</td>
                      <td className="row-name">{a.fatherName}</td>
                      <td className="row-email">{a.email}</td>
                      <td className="row-email">{a.phone}</td>
                      <td className="row-email">{a.cnic}</td>
                      <td>
                        <span
                          className="tech-badge"
                          style={{ '--badge-color': TECH_COLORS[a.technology] || '#94a3b8' }}
                        >
                          {a.technology}
                        </span>
                      </td>
                      <td className="row-date">{formatDate(a.createdAt)}</td>
                      <td>
                        <select
                          className="status-select"
                          style={{ '--badge-color': STATUS_COLORS[a.status] || '#94a3b8' }}
                          value={a.status}
                          disabled={updatingId === a._id}
                          onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(a._id)}
                          disabled={deletingId === a._id}
                          title="Remove applicant"
                        >
                          {deletingId === a._id ? '…' : '✕'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
