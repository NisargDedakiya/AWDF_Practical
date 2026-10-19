import React, { useState } from 'react';

export default function TaskItem({
  task,
  onToggleComplete,
  onUpdateTask,
  onRequestDelete,
  isProcessing
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setIsSaving(true);
    const success = await onUpdateTask(task._id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority
    });
    setIsSaving(false);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority || 'medium');
    setIsEditing(false);
  };

  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className={`task-item-card ${task.completed ? 'task-completed' : ''} ${task.isOptimistic ? 'task-optimistic' : ''}`}>
      {isEditing ? (
        <div className="task-edit-mode">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isSaving}
              maxLength={100}
              placeholder="Task Title"
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-textarea"
              rows="2"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              disabled={isSaving}
              placeholder="Task Description"
            />
          </div>
          <div className="task-edit-actions">
            <select
              className="form-select form-select-sm"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              disabled={isSaving}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="edit-btn-group">
              <button
                type="button"
                className="btn-cancel-sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-save-sm"
                onClick={handleSaveEdit}
                disabled={isSaving || !editTitle.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="task-item-content">
          <div className="task-main-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task._id, !task.completed)}
                disabled={isProcessing}
                aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
              />
              <span className="checkmark" />
            </label>

            <div className="task-details">
              <div className="task-title-row">
                <span className={`task-title ${task.completed ? 'strike-through' : ''}`}>
                  {task.title}
                </span>
                <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                  {task.priority || 'medium'}
                </span>
                {task.isOptimistic && <span className="optimistic-badge">Syncing...</span>}
              </div>

              {task.description && (
                <p className={`task-description ${task.completed ? 'desc-completed' : ''}`}>
                  {task.description}
                </p>
              )}

              <div className="task-meta">
                {formattedDate && <span className="task-date">Added {formattedDate}</span>}
                <span className="task-id-badge" title={`MongoDB _id: ${task._id}`}>
                  ID: {task._id?.slice(-6) || 'temp'}
                </span>
              </div>
            </div>

            <div className="task-actions">
              <button
                type="button"
                className="btn-action-edit"
                onClick={() => setIsEditing(true)}
                disabled={isProcessing}
                title="Edit task"
                aria-label="Edit task"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>

              <button
                type="button"
                className="btn-action-delete"
                onClick={() => onRequestDelete(task)}
                disabled={isProcessing}
                title="Delete task"
                aria-label="Delete task"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
