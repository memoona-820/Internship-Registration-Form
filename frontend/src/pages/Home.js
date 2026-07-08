import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import Stepper from '../components/Stepper';

const initialForm = {
  name: '', fatherName: '', email: '', phone: '',
  cnic: '', program: '', qualification: '', institution: ''
};

const STEPS = ['Personal Info', 'Program & Education', 'Review & Submit'];

const STEP_FIELDS = {
  1: ['name', 'fatherName', 'email', 'phone', 'cnic'],
  2: ['program', 'qualification', 'institution'],
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [programs, setPrograms] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/programs').then(res => setPrograms(res.data)).catch(() => {});
  }, []);

  const validateFields = (fields) => {
    const e = {};
    if (fields.includes('name') && !form.name.trim()) e.name = 'Full name is required';
    if (fields.includes('fatherName') && !form.fatherName.trim()) e.fatherName = "Father's name is required";
    if (fields.includes('email') && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (fields.includes('phone') && !form.phone.match(/^(\+92[0-9]{10}|0[0-9]{10})$/)) e.phone = 'Valid phone number required (e.g. 03001234567 or +923001234567)';
    if (fields.includes('cnic') && !form.cnic.match(/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]$/)) e.cnic = 'Valid CNIC required (13 digits)';
    if (fields.includes('program') && !form.program) e.program = 'Select a program';
    if (fields.includes('qualification') && !form.qualification) e.qualification = 'Select qualification';
    if (fields.includes('institution') && !form.institution.trim()) e.institution = 'Institution name is required';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const goNext = () => {
    const fields = STEP_FIELDS[step] || [];
    const e = validateFields(fields);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(s => Math.min(s + 1, STEPS.length));
    else toast.error('Please fix the highlighted fields');
  };

  const goBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const allErrors = validateFields([...STEP_FIELDS[1], ...STEP_FIELDS[2]]);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please review your details before submitting');
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      await api.post('/internships', form);
      toast.success('🎉 Registration submitted successfully!');
      setSubmitted(true);
      setForm(initialForm);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card success-card" style={{ maxWidth: 480, textAlign: 'center', padding: '3rem 2rem' }}>
          <div className="success-icon">✅</div>
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
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem' }}>
            <Stepper steps={STEPS} current={step} />
          </div>
          <div className="card-body">
            {step === 1 && (
              <div className="form-grid step-fade">
                {[
                  { label: 'Full Name *', name: 'name', placeholder: 'Muhammad Ali' },
                  { label: "Father's Name *", name: 'fatherName', placeholder: "Father's full name" },
                  { label: 'Email Address *', name: 'email', type: 'email', placeholder: 'email@example.com' },
                  { label: 'Phone Number *', name: 'phone', placeholder: '03001234567' },
                  { label: 'CNIC *', name: 'cnic', placeholder: '1234567890123' },
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
              </div>
            )}

            {step === 2 && (
              <div className="form-grid step-fade">
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

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Institution *</label>
                  <input
                    type="text"
                    name="institution"
                    value={form.institution}
                    onChange={handleChange}
                    placeholder="University / College name"
                    className={`form-control ${errors.institution ? 'error' : ''}`}
                  />
                  {errors.institution && <span className="form-error">{errors.institution}</span>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-fade">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Please review your details before submitting. Click "Back" on any section to make changes.
                </p>
                <div className="review-grid">
                  {[
                    ['Full Name', form.name],
                    ["Father's Name", form.fatherName],
                    ['Email', form.email],
                    ['Phone', form.phone],
                    ['CNIC', form.cnic],
                    ['Program', form.program],
                    ['Qualification', form.qualification],
                    ['Institution', form.institution],
                  ].map(([label, value]) => (
                    <div className="review-item" key={label}>
                      <span className="review-label">{label}</span>
                      <span className="review-value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3" style={{ display: 'flex', gap: '0.75rem' }}>
              {step > 1 && (
                <button type="button" className="btn btn-secondary" onClick={goBack} disabled={loading}>
                  ← Back
                </button>
              )}
              {step < STEPS.length ? (
                <button type="button" className="btn btn-primary" onClick={goNext} style={{ flex: 1, justifyContent: 'center' }}>
                  Continue →
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? '⏳ Submitting...' : '🚀 Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
