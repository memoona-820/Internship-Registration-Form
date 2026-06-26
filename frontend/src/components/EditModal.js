import React, { useState } from 'react';

const QUALIFICATIONS = ['Matriculation', 'Intermediate', "Bachelor's", "Master's", 'PhD'];
const DEFAULT_PROGRAMS = ['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'DevOps', 'Cybersecurity'];

export default function EditModal({ item, programs, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item.name || '',
    fatherName: item.fatherName || '',
    email: item.email || '',
    phone: item.phone || '',
    cnic: item.cnic || '',
    program: item.program || '',
    qualification: item.qualification || '',
    institution: item.institution || '',
    status: item.status || 'pending',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    await onSave(item._id, form);
    setSaving(false);
  };

  const programList = programs.length > 0 ? programs.map(p => p.name) : DEFAULT_PROGRAMS;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">✏️ Edit Application</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {[
                { label: 'Full Name', name: 'name' },
                { label: "Father's Name", name: 'fatherName' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Phone', name: 'phone' },
                { label: 'CNIC', name: 'cnic' },
                { label: 'Institution', name: 'institution' },
              ].map(({ label, name, type = 'text' }) => (
                <div className="form-group" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Program</label>
                <select name="program" value={form.program} onChange={handleChange} className="form-control" required>
                  <option value="">Select Program</option>
                  {programList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Qualification</label>
                <select name="qualification" value={form.qualification} onChange={handleChange} className="form-control" required>
                  <option value="">Select Qualification</option>
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-control">
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
