import React from 'react';

export default function Spinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClass = size === 'small' ? 'spinner-small' : size === 'large' ? 'spinner-large' : 'spinner-medium';

  return (
    <div className="spinner-container" role="status" aria-label="Loading">
      <div className={`spinner ${sizeClass}`} />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
}
