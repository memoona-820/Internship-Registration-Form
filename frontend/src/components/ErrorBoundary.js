import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged for debugging; in a real deployment this could be sent to a monitoring service.
    console.error('Unexpected UI error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--body-bg, #0f1117)' }}>
          <div className="card" style={{ maxWidth: 460, textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '0.75rem' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted, #9599ad)', marginBottom: '2rem' }}>
              An unexpected error occurred. You can go back to the homepage and try again.
            </p>
            <button className="btn btn-primary" onClick={this.handleReload}>
              ← Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
