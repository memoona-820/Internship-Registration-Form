import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import EditModal from '../components/EditModal';
import ConfirmModal from '../components/ConfirmModal';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [programs, setPrograms] = useState([]);

  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (programFilter !== 'all') params.program = programFilter;
      const res = await api.get('/internships', { params });
      setApplicants(res.data);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, programFilter]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  useEffect(() => {
    api.get('/programs').then(res => setPrograms(res.data)).catch(() => {});
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/internships/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchApplicants();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/internships/${deleteId}`);
      toast.success('Record deleted');
      setDeleteId(null);
      fetchApplicants();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEditSave = async (id, data) => {
    try {
      await api.put(`/internships/${id}`, data);
      toast.success('Record updated successfully!');
      setEditItem(null);
      fetchApplicants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    approved: applicants.filter(a => a.status === 'approved').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📋 Internship Dashboard</h1>
        <p className="page-subtitle">Manage and review all internship applications</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Applications', value: stats.total, icon: '📄', cls: 'blue' },
          { label: 'Pending Review', value: stats.pending, icon: '⏳', cls: 'yellow' },
          { label: 'Approved', value: stats.approved, icon: '✅', cls: 'green' },
          { label: 'Rejected', value: stats.rejected, icon: '❌', cls: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="filter-bar" style={{ flex: 1 }}>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, CNIC, institution..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="filter-select" value={programFilter} onChange={e => setProgramFilter(e.target.value)}>
              <option value="all">All Programs</option>
              {programs.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatusFilter('all'); setProgramFilter('all'); }}>
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <p>Loading applicants...</p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No records found</div>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Program</th>
                    <th>Institution</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a, i) => (
                    <tr key={a._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.qualification}</div>
                      </td>
                      <td>{a.email}</td>
                      <td>{a.phone}</td>
                      <td>
                        <span style={{
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          padding: '3px 9px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600
                        }}>{a.program}</span>
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.institution}
                      </td>
                      <td>
                        <select
                          className={`badge ${STATUS_COLORS[a.status]}`}
                          value={a.status}
                          onChange={e => handleStatusChange(a._id, e.target.value)}
                          style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="approved">✅ Approved</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn-icon btn-icon-edit"
                            title="Edit Record"
                            onClick={() => setEditItem(a)}
                          >✏️</button>
                          <button
                            className="btn-icon btn-icon-delete"
                            title="Delete Record"
                            onClick={() => setDeleteId(a._id)}
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Showing {applicants.length} result{applicants.length !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          programs={programs}
          onClose={() => setEditItem(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <ConfirmModal
          title="Delete Record?"
          message="This action cannot be undone. The applicant's record will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
