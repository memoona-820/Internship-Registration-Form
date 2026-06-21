import React from 'react';
import RegistrationForm from '../components/RegistrationForm';

export default function Home() {
  return (
    <div className="page">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-logo">🧭</span>
            <span className="header-name">InternHub</span>
          </div>
          <nav className="header-nav">
            <span className="header-badge">Apply Now</span>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">2025 Cohort · Now Open</p>
          <h1 className="hero-title">
            Launch your career with a<br />
            <span className="hero-accent">hands-on internship.</span>
          </h1>
          <p className="hero-body">
            Register below, pick your technology track, and join a cohort of developers building real products.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="main main--single">
        <RegistrationForm />
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>Built with React · Node.js · Express · MongoDB</p>
      </footer>
    </div>
  );
}
