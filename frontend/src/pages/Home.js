import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '', fatherName: '', email: '', phone: '',
  cnic: '', program: '', qualification: '', institution: ''
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [programs, setPrograms] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/programs').then(res => setPrograms(res.data)).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.fatherName.trim()) e.fatherName = "Father's name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^(\+92[0-9]{10}|0[0-9]{10})$/)) e.phone = 'Valid phone number required (e.g. 03001234567 or +923001234567)';
    if (!form.cnic.match(/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]$/)) e.cnic = 'Valid CNIC required (13 digits)';
    if (!form.program) e.program = 'Select a program';
    if (!form.qualification) e.qualification = 'Select qualification';
    if (!form.institution.trim()) e.institution = 'Institution name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/internships', form);
      toast.success('🎉 Registration submitted successfully!');
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: 'var(--dark)', marginBottom: '0.75rem' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your internship application has been received. We'll contact you via email soon.
          </p>
          <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <div className="hero-badge">✨ Now Accepting Applications</div>
        <h1>Apply for an Internship</h1>
        <p>Join our internship program and kickstart your tech career with hands-on experience.</p>
      </div>

      <div className="page-container" style={{ maxWidth: 860 }}>
        <div className="card mt-3">
          <div className="card-header">
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Registration Form</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
                All fields marked with * are required
              </p>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {[
                  { label: 'Full Name *', name: 'name', placeholder: 'Muhammad Ali' },
                  { label: "Father's Name *", name: 'fatherName', placeholder: "Father's full name" },
                  { label: 'Email Address *', name: 'email', type: 'email', placeholder: 'email@example.com' },
                  { label: 'Phone Number *', name: 'phone', placeholder: '03001234567' },
                  { label: 'CNIC *', name: 'cnic', placeholder: '1234567890123' },
                  { label: 'Institution *', name: 'institution', placeholder: 'University / College name' },
                ].map(({ label, name, type = 'text', placeholder }) => (
                  <div className="form-group" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`form-control ${errors[name] ? 'error' : ''}`}
                    />
                    {errors[name] && <span className="form-error">{errors[name]}</span>}
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Program *</label>
                  <select name="program" value={form.program} onChange={handleChange}
                    className={`form-control ${errors.program ? 'error' : ''}`}>
                    <option value="">— Select a Program —</option>
                    {programs.length > 0
                      ? programs.map(p => <option key={p._id} value={p.name}>{p.name}</option>)
                      : ['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'DevOps', 'Cybersecurity']
                          .map(p => <option key={p} value={p}>{p}</option>)
                    }
                  </select>
                  {errors.program && <span className="form-error">{errors.program}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <select name="qualification" value={form.qualification} onChange={handleChange}
                    className={`form-control ${errors.qualification ? 'error' : ''}`}>
                    <option value="">— Select Qualification —</option>
                    {['Matriculation', 'Intermediate', 'Bachelor\'s', 'Master\'s', 'PhD'].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  {errors.qualification && <span className="form-error">{errors.qualification}</span>}
                </div>
              </div>

              <div className="mt-3">
                <button type="submit" className="btn btn-primary" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                  {loading ? '⏳ Submitting...' : '🚀 Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
