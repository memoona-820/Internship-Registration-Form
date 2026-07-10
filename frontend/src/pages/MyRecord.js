import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const QUALIFICATIONS = ['Matriculation', 'Intermediate', "Bachelor's", "Master's", 'PhD'];
const DEFAULT_PROGRAMS = ['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'DevOps', 'Cybersecurity'];

export default function MyRecord() {
  const [step, setStep] = useState('lookup'); // lookup | view | edit | deleted
  const [lookupForm, setLookupForm] = useState({ email: '', cnic: '' });
  const [record, setRecord] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get('/programs').then(res => setPrograms(res.data)).catch(() => {});
  }, []);

  // Step 1: Find record
  const handleLookup = async e => {
    e.preventDefault();
    if (!lookupForm.email || !lookupForm.cnic) {
      toast.error('Email aur CNIC dono bharo');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/internships/lookup', lookupForm);
      setRecord(res.data);
      setEditForm(res.data);
      setStep('view');
      toast.success('Record mil gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Record nahi mila');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Update record
  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/internships/my/${record._id}`, {
        ...editForm,
        email: record.email,
        cnic: record.cnic,
      });
      setRecord(res.data.data);
      setEditForm(res.data.data);
      setStep('view');
      toast.success('Record update ho gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Delete record
  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/internships/my/${record._id}`, {
        data: { email: record.email, cnic: record.cnic }
      });
      setConfirmDelete(false);
      setStep('deleted');
      toast.success('Record delete ho gaya');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_STYLE = {
    pending: { background: 'var(--warning-bg)', color: 'var(--warning)' },
    approved: { background: 'var(--success-bg)', color: 'var(--success)' },
    rejected: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  };

  // ── DELETED ──
  if (step === 'deleted') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 450, textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗑️</div>
          <h2 style={{ color: 'var(--dark)', marginBottom: '0.75rem' }}>The record has been deleted.</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your internship application has been permanently deleted.
          </p>
          <button className="btn btn-primary" onClick={() => { setStep('lookup'); setLookupForm({ email: '', cnic: '' }); setRecord(null); }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── LOOKUP FORM ──
  if (step === 'lookup') {
    return (
      <>
        <div className="hero">
          <div className="hero-badge">🔍 Record Management</div>
          <h1>Manage your record</h1>
          <p>Find, edit, or delete your submitted application using your email address and CNIC.</p>
        </div>
        <div className="page-container" style={{ maxWidth: 500 }}>
          <div className="card mt-3">
            <div className="card-header">
              <h3 style={{ fontWeight: 700 }}>🔑 Search for Your Record</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleLookup}>
                <div className="form-group mb-2">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter the email address used during registration."
                    value={lookupForm.email}
                    onChange={e => setLookupForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="form-group mb-2">
                  <label className="form-label">CNIC *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1234567890123"
                    value={lookupForm.cnic}
                    onChange={e => setLookupForm(p => ({ ...p, cnic: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-2"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                  disabled={loading}>
                  {loading ? '⏳ Searching...' : '🔍Find Record'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── VIEW RECORD ──
  if (step === 'view') {
    return (
      <div className="page-container" style={{ maxWidth: 700 }}>
        <div className="page-header">
          <h1 className="page-title">📋 Your Application</h1>
          <p className="page-subtitle">View, edit, or delete your submitted application</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                👤
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{record.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{record.email}</div>
              </div>
            </div>
            <span style={{ ...STATUS_STYLE[record.status], padding: '5px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>
              {record.status === 'pending' ? '⏳' : record.status === 'approved' ? '✅' : '❌'} {record.status}
            </span>
          </div>

          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: "Father's Name", value: record.fatherName },
                { label: 'Phone', value: record.phone },
                { label: 'CNIC', value: record.cnic },
                { label: 'Program', value: record.program },
                { label: 'Qualification', value: record.qualification },
                { label: 'Institution', value: record.institution },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--surface-alt)', padding: '12px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              📅 Applied: {new Date(record.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setStep('edit')}>✏️ Edit Record</button>
            <button className="btn btn-danger" onClick={() => setConfirmDelete(true)} disabled={loading}>🗑️ Delete Record</button>
            <button className="btn btn-secondary" onClick={() => setStep('lookup')}>← Back</button>
          </div>
        </div>

        {confirmDelete && (
          <ConfirmModal
            title="Delete Your Application?"
            message="This action cannot be undone. Your internship application will be permanently removed."
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>
    );
  }

  // ── EDIT FORM ──
  if (step === 'edit') {
    const programList = programs.length > 0 ? programs.map(p => p.name) : DEFAULT_PROGRAMS;
    return (
      <div className="page-container" style={{ maxWidth: 700 }}>
        <div className="page-header">
          <h1 className="page-title">✏️ Edit Your Record</h1>
          <p className="page-subtitle">Update Your Details</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700 }}>Application Update</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your email address and CNIC cannot be modified</span>
          </div>
          <form onSubmit={handleUpdate}>
            <div className="card-body">
              <div className="form-grid">
                {[
                  { label: 'Full Name', name: 'name' },
                  { label: "Father's Name", name: 'fatherName' },
                  { label: 'Phone', name: 'phone' },
                  { label: 'Institution', name: 'institution' },
                ].map(({ label, name }) => (
                  <div className="form-group" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control"
                      value={editForm[name] || ''}
                      onChange={e => setEditForm(p => ({ ...p, [name]: e.target.value }))}
                      required
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Program</label>
                  <select className="form-control" value={editForm.program || ''} onChange={e => setEditForm(p => ({ ...p, program: e.target.value }))} required>
                    <option value="">Select Program</option>
                    {programList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <select className="form-control" value={editForm.qualification || ''} onChange={e => setEditForm(p => ({ ...p, qualification: e.target.value }))} required>
                    <option value="">Select</option>
                    {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>

                {/* Read-only fields */}
                <div className="form-group">
                  <label className="form-label">Email (read-only)</label>
                  <input className="form-control" value={record.email} disabled style={{ background: 'var(--input-disabled-bg)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">CNIC (read-only)</label>
                  <input className="form-control" value={record.cnic} disabled style={{ background: 'var(--input-disabled-bg)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setStep('view')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
