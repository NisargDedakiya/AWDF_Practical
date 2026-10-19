import React from 'react';

export default function ConfirmModal({ isOpen, title, message, taskTitle, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-danger-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <h3 className="modal-title">{title || 'Delete Task Confirmation'}</h3>
        </div>

        <p className="modal-body">
          {message || 'Are you sure you want to permanently delete this task? This action cannot be undone.'}
        </p>

        {taskTitle && (
          <div className="modal-target-box">
            <strong>Target Task:</strong> &ldquo;{taskTitle}&rdquo;
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-modal-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting from MongoDB...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
