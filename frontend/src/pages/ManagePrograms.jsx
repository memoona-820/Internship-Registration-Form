import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllPrograms, createProgram, updateProgram, deleteProgram } from '../api';

const emptyForm = { name: '', description: '' };

export default function ManagePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAllPrograms();
      setPrograms(res.data.data);
    } catch {
      setError('Could not load programs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const startEdit = (program) => {
    setEditingId(program._id);
    setForm({ name: program.name, description: program.description || '' });
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('Program name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const res = await updateProgram(editingId, form);
        setPrograms((prev) => prev.map((p) => (p._id === editingId ? res.data.data : p)));
        setEditingId(null);
      } else {
        const res = await createProgram(form);
        setPrograms((prev) => [res.data.data, ...prev]);
      }
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save program.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (program) => {
    setBusyId(program._id);
    try {
      const res = await updateProgram(program._id, { isActive: !program.isActive });
      setPrograms((prev) => prev.map((p) => (p._id === program._id ? res.data.data : p)));
    } catch {
      alert('Could not update program status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program permanently? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await deleteProgram(id);
      setPrograms((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Delete failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card admin-dashboard-card">
      <div className="card-header">
        <div className="card-icon">🧩</div>
        <h2 className="card-title">Manage Programs</h2>
        <p className="card-subtitle">Add, edit, or retire internship tracks shown on the application form.</p>
      </div>

      {/* ── Add / Edit Form ── */}
      <form onSubmit={handleSubmit} noValidate className="program-form">
        <div className="field-group">
          <label className="field-label" htmlFor="programName">Program Name</label>
          <input
            id="programName"
            name="name"
            type="text"
            className="field-input"
            placeholder="e.g. Cloud Computing"
            value={form.name}
            onChange={handleChange}
            disabled={saving}
          />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="programDesc">Description (optional)</label>
          <input
            id="programDesc"
            name="description"
            type="text"
            className="field-input"
            placeholder="Short description of this track"
            value={form.description}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        {formError && (
          <div className="alert alert--error">
            <span className="alert-icon">⚠️</span>{formError}
          </div>
        )}

        <div className="program-form-actions">
          <button type="submit" className="btn-submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Program' : '+ Add Program'}
          </button>
          {editingId && (
            <button type="button" className="btn-cancel" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ── Programs List ── */}
      {error && (
        <div className="alert alert--error">
          <span className="alert-icon">⚠️</span>{error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-dots"><span /><span /><span /></div>
          <p>Loading programs…</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧩</div>
          <p>No programs yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="applicants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p._id} className="table-row">
                  <td className="row-name">{p.name}</td>
                  <td className="row-email">{p.description || '—'}</td>
                  <td>
                    <button
                      className="status-select"
                      style={{ '--badge-color': p.isActive ? '#22c55e' : '#5e8a86' }}
                      onClick={() => handleToggleActive(p)}
                      disabled={busyId === p._id}
                    >
                      {p.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-delete"
                      onClick={() => startEdit(p)}
                      title="Edit program"
                      disabled={busyId === p._id}
                    >
                      ✎
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(p._id)}
                      title="Delete program"
                      disabled={busyId === p._id}
                    >
                      {busyId === p._id ? '…' : '✕'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
