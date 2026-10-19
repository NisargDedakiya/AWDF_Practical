import React, { useState } from 'react';
import { generateAiDescription } from '../api';

/**
 * TaskForm Component with AI Description Suggestion
 * Practical 13: AI API Integration into a Web Application
 * Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
 */
export default function TaskForm({ onAddTask, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [formError, setFormError] = useState('');

  // Practical 13: AI Generation States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

function getClientFallback(t) {
  const lower = t.toLowerCase();
  if (lower.includes('auth') || lower.includes('login') || lower.includes('register') || lower.includes('jwt')) {
    return 'Implement user authentication with input validation, password encryption, and session/token management.';
  }
  if (lower.includes('test') || lower.includes('ci') || lower.includes('pipeline') || lower.includes('workflow')) {
    return 'Write automated unit and integration tests to verify functionality and ensure continuous quality delivery.';
  }
  if (lower.includes('docker') || lower.includes('container') || lower.includes('deploy') || lower.includes('nginx')) {
    return 'Containerize application components and configure orchestration for scalable and reproducible deployment.';
  }
  if (lower.includes('database') || lower.includes('mongo') || lower.includes('schema') || lower.includes('crud')) {
    return 'Design data schemas, establish indexes, and implement robust query optimization and persistence logic.';
  }
  return `Plan, implement, and verify all requirements for "${t}" with proper error handling and clean documentation.`;
}

  const handleGenerateAi = async () => {
    if (!title.trim()) {
      setFormError('Please enter a task title first to generate an AI description.');
      return;
    }

    setFormError('');
    setIsGeneratingAi(true);
    setAiNotice(null);

    try {
      const res = await generateAiDescription(title.trim());
      if (res && res.description) {
        setDescription(res.description);
        setAiNotice({
          source: res.source,
          fallback: res.fallback,
          disclaimer: res.disclaimer || 'AI-generated suggestion. Please review and edit before saving.'
        });
      } else {
        const fallbackText = getClientFallback(title.trim());
        setDescription(fallbackText);
        setAiNotice({
          source: 'Contextual Fallback Engine',
          fallback: true,
          disclaimer: 'Generated via fallback engine. Please review and edit before saving.'
        });
      }
    } catch (err) {
      console.warn('AI generation notice:', err.message);
      const fallbackText = getClientFallback(title.trim());
      setDescription(fallbackText);
      setAiNotice({
        source: 'Contextual Fallback Engine',
        fallback: true,
        disclaimer: err.status === 429
          ? 'Rate limit reached (1 request every 3s). Please wait a moment.'
          : 'Generated via fallback engine. Please review and edit before saving.'
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
      setAiNotice(null);
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
            placeholder="e.g., Configure Docker Compose and Nginx Reverse Proxy"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label htmlFor="task-desc" className="form-label" style={{ marginBottom: 0 }}>
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={handleGenerateAi}
              disabled={isGeneratingAi || !title.trim() || isSubmitting}
              className="btn-ai-generate"
              title="Auto-generate an editable task description using AI"
            >
              {isGeneratingAi ? '✨ Generating...' : '✨ Suggest with AI'}
            </button>
          </div>

          <textarea
            id="task-desc"
            className="form-textarea"
            rows="3"
            placeholder="Click '✨ Suggest with AI' to generate a description, or type manually..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />

          {aiNotice && (
            <div className="ai-disclaimer-box">
              <small>
                🤖 <strong>{aiNotice.source}:</strong> {aiNotice.disclaimer}
              </small>
            </div>
          )}
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
