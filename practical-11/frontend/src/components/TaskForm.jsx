import React, { useState } from 'react';

export default function TaskForm({ onAddTask, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError('Task title is required.');
      return;
    }

    if (trimmedTitle.length > 100) {
      setFormError('Task title cannot exceed 100 characters.');
      return;
    }

    setFormError('');

    const newTaskData = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      completed: false
    };

    const success = await onAddTask(newTaskData);
    if (success) {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  };

  return (
    <div className="task-form-card">
      <div className="form-header">
        <div className="form-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <h3 className="form-title">Create New Task</h3>
      </div>

      {formError && <div className="form-validation-error">{formError}</div>}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="e.g., Integrate React frontend with MongoDB"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (formError) setFormError('');
            }}
            disabled={isSubmitting}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">
            Description <span className="optional-tag">(Optional)</span>
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            rows="2"
            placeholder="Brief details or acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group-half">
            <label htmlFor="task-priority" className="form-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>

          <div className="form-group form-group-half form-btn-container">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-inline" /> Saving to DB...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Task
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
