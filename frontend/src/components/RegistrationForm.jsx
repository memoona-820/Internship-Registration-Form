import React, { useState, useEffect } from 'react';
import { registerInternship, fetchActivePrograms } from '../api';

const initialForm = {
  name: '',
  fatherName: '',
  email: '',
  phone: '',
  cnic: '',
  technology: '',
};

export default function RegistrationForm({ onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [serverMessage, setServerMessage] = useState('');
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    fetchActivePrograms()
      .then((res) => setPrograms(res.data.data))
      .catch(() => setPrograms([]))
      .finally(() => setProgramsLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Please enter your full name (at least 2 characters).';
    if (!form.fatherName.trim() || form.fatherName.trim().length < 2)
      errs.fatherName = "Please enter your father's name (at least 2 characters).";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Please enter a valid email address.';
    if (!form.phone.trim() || !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      errs.phone = 'Please enter a valid phone number.';
    if (!form.cnic.trim() || !/^\d{5}-\d{7}-\d{1}$/.test(form.cnic.trim()))
      errs.cnic = 'CNIC must be in format 12345-1234567-1.';
    if (!form.technology)
      errs.technology = 'Please select a technology.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('loading');
    setServerMessage('');
    try {
      const res = await registerInternship(form);
      setStatus('success');
      setServerMessage(res.data.message);
      setForm(initialForm);
      onSuccess && onSuccess(res.data.data);
    } catch (err) {
      setStatus('error');
      setServerMessage(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">🎓</div>
        <h2 className="card-title">Apply for Internship</h2>
        <p className="card-subtitle">Fill in your details to register for an internship program.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <div className="field-group">
          <label className="field-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className={`field-input ${errors.name ? 'field-input--error' : ''}`}
            placeholder="e.g. Ayesha Khan"
            value={form.name}
            onChange={handleChange}
            disabled={status === 'loading'}
            autoComplete="name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        {/* Father Name */}
        <div className="field-group">
          <label className="field-label" htmlFor="fatherName">Father's Name</label>
          <input
            id="fatherName"
            name="fatherName"
            type="text"
            className={`field-input ${errors.fatherName ? 'field-input--error' : ''}`}
            placeholder="e.g. Muhammad Khan"
            value={form.fatherName}
            onChange={handleChange}
            disabled={status === 'loading'}
            autoComplete="off"
          />
          {errors.fatherName && <span className="field-error">{errors.fatherName}</span>}
        </div>

        {/* Email */}
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`field-input ${errors.email ? 'field-input--error' : ''}`}
            placeholder="e.g. ayesha@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={status === 'loading'}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="field-group">
          <label className="field-label" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={`field-input ${errors.phone ? 'field-input--error' : ''}`}
            placeholder="e.g. 03001234567"
            value={form.phone}
            onChange={handleChange}
            disabled={status === 'loading'}
            autoComplete="tel"
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        {/* CNIC */}
        <div className="field-group">
          <label className="field-label" htmlFor="cnic">CNIC</label>
          <input
            id="cnic"
            name="cnic"
            type="text"
            className={`field-input ${errors.cnic ? 'field-input--error' : ''}`}
            placeholder="e.g. 12345-1234567-1"
            value={form.cnic}
            onChange={handleChange}
            disabled={status === 'loading'}
            autoComplete="off"
          />
          {errors.cnic && <span className="field-error">{errors.cnic}</span>}
        </div>

        {/* Technology */}
        <div className="field-group">
          <label className="field-label" htmlFor="technology">Technology Track</label>
          <select
            id="technology"
            name="technology"
            className={`field-select ${errors.technology ? 'field-input--error' : ''}`}
            value={form.technology}
            onChange={handleChange}
            disabled={status === 'loading' || programsLoading}
          >
            <option value="">
              {programsLoading ? 'Loading tracks…' : '— Select a track —'}
            </option>
            {programs.map((p) => (
              <option key={p._id} value={p.name}>{p.name}</option>
            ))}
          </select>
          {!programsLoading && programs.length === 0 && (
            <span className="field-error">No tracks available right now. Please check back later.</span>
          )}
          {errors.technology && <span className="field-error">{errors.technology}</span>}
        </div>

        {/* Server message */}
        {serverMessage && (
          <div className={`alert alert--${status === 'success' ? 'success' : 'error'}`}>
            <span className="alert-icon">{status === 'success' ? '✅' : '⚠️'}</span>
            {serverMessage}
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <><span className="spinner" /> Submitting…</>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
}
