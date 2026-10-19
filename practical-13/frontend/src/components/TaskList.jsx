import React, { useState } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  onToggleComplete,
  onUpdateTask,
  onRequestDelete,
  processingId
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks locally based on controls
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (statusFilter === 'active' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = task.title?.toLowerCase().includes(q);
      const descMatch = task.description?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  });

  return (
    <div className="task-list-container">
      {/* Search and Filter Controls */}
      <div className="list-controls-bar">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              type="button"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'all' ? 'pill-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'active' ? 'pill-active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'completed' ? 'pill-active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Done ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        <div className="priority-filter-select">
          <select
            className="form-select form-select-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List Rendering */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <h4 className="empty-state-title">
            {tasks.length === 0 ? 'No tasks in MongoDB yet' : 'No matching tasks found'}
          </h4>
          <p className="empty-state-subtitle">
            {tasks.length === 0
              ? 'Use the form above to create your first task. It will be stored in your local MongoDB instance.'
              : 'Try clearing your filters or search term to see more tasks.'}
          </p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggleComplete={onToggleComplete}
              onUpdateTask={onUpdateTask}
              onRequestDelete={onRequestDelete}
              isProcessing={processingId === task._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
