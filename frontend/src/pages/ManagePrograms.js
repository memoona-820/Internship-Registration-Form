import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const emptyForm = { name: '', description: '', duration: '3 months', isActive: true };

export default function ManagePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/programs/all');
      setPrograms(res.data);
    } catch { toast.error('Failed to load programs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Program name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/programs/${editId}`, form);
        toast.success('Program updated!');
      } else {
        await api.post('/programs', form);
        toast.success('Program added!');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleEdit = p => {
    setEditId(p._id);
    setForm({ name: p.name, description: p.description || '', duration: p.duration || '3 months', isActive: p.isActive });
    setShowForm(true);
  };

  const handleToggle = async (p) => {
    try {
      await api.patch(`/programs/${p._id}`, { isActive: !p.isActive });
      toast.success(`Program ${p.isActive ? 'deactivated' : 'activated'}`);
      fetchPrograms();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/programs/${deleteTarget}`);
      toast.success('Program deleted');
      setDeleteTarget(null);
      fetchPrograms();
    } catch { toast.error('Failed to delete'); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">🗂️ Manage Programs</h1>
          <p className="page-subtitle">Add and manage internship tracks visible on the registration form</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setEditId(null); setForm(emptyForm); }}>
          {showForm ? '✕ Cancel' : '+ Add Program'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-2" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 style={{ fontWeight: 700 }}>{editId ? 'Edit Program' : 'New Program'}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Program Name *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-control" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}>
                    {['1 month', '2 months', '3 months', '6 months'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <input
                    className="form-control"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Short description of the program"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : (editId ? '💾 Update Program' : '+ Add Program')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Programs List */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><p>Loading...</p></div>
        ) : programs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No programs yet</div>
            <p>Click "Add Program" to create the first internship track.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Program Name</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p, i) => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{p.description || '—'}</td>
                    <td>
                      <span style={{ background: 'var(--surface-alt)', padding: '3px 10px', borderRadius: 12, fontSize: '0.82rem' }}>
                        🕐 {p.duration}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon btn-icon-edit" onClick={() => handleEdit(p)} title="Edit">✏️</button>
                        <button
                          className="btn-icon"
                          style={{ background: p.isActive ? 'var(--warning-bg)' : 'var(--success-bg)', color: p.isActive ? 'var(--warning)' : 'var(--success)' }}
                          onClick={() => handleToggle(p)}
                          title={p.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {p.isActive ? '🔕' : '🔔'}
                        </button>
                        <button className="btn-icon btn-icon-delete" onClick={() => setDeleteTarget(p._id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Program?"
          message="This will remove the program from the registration form. Existing applications referencing it are not affected."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
