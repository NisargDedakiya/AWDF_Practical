import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-card" role="alert">
      <div className="error-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="error-content">
        <h4 className="error-title">Request Failed</h4>
        <p className="error-description">{message}</p>
      </div>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
