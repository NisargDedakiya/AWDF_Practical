import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-badge">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="brand-text">
          <h1 className="app-title">TaskFlow Pro</h1>
          <p className="app-subtitle">Practical 06 — Full Stack Integration (React + Node + MongoDB)</p>
        </div>
      </div>

      <div className="header-meta">
        <div className="student-badge">
          <span className="student-name">Nisarg Dedakiya</span>
          <span className="student-id">24CS014</span>
        </div>
        <div className="tech-stack-pills">
          <span className="tech-pill tech-react">React</span>
          <span className="tech-pill tech-node">Express</span>
          <span className="tech-pill tech-mongo">MongoDB</span>
        </div>
      </div>
    </header>
  );
}
