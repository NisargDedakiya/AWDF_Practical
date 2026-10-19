import React from 'react';

export default function StatsBar({ tasks, isConnected, onRefresh, isRefreshing }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <span className="stat-label">Total Tasks</span>
        <span className="stat-value">{total}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Completed</span>
        <span className="stat-value text-emerald">{completed}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Pending</span>
        <span className="stat-value text-amber">{pending}</span>
      </div>

      <div className="stat-card progress-stat-card">
        <div className="progress-header">
          <span className="stat-label">Completion Rate</span>
          <span className="stat-percent">{percent}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="stat-card status-card">
        <div className="server-status-indicator">
          <span className={`status-dot ${isConnected ? 'dot-online' : 'dot-offline'}`} />
          <span className="status-text">
            {isConnected ? 'MongoDB Connected' : 'Server Disconnected'}
          </span>
        </div>
        <button
          className="btn-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Re-fetch tasks from MongoDB"
          type="button"
        >
          <svg
            className={isRefreshing ? 'spin-icon' : ''}
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {isRefreshing ? 'Syncing...' : 'Sync'}
        </button>
      </div>
    </div>
  );
}
