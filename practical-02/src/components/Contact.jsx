import { useState } from 'react';

// Contact Component
// Route: "/contact"
// Demonstrates:
// 1. Reactive state management with useState for controlled inputs (senderName, message)
// 2. Real-time dynamic character counter (message.length)
// 3. Dynamic live preview updating on every keystroke
// 4. UI visibility toggle using boolean state (showHelp)
// 5. Form submission handler and state reset
function Contact({ studentInfo }) {
  // useState 1: Controlled input state for user name and message
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');

  // useState 2: UI visibility toggle for instructions
  const [showHelp, setShowHelp] = useState(false);

  // useState 3: Form submission confirmation alert state
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim().length > 0 && senderName.trim().length > 0) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSenderName('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <section className="portfolio-section contact-section">
      <h2 className="section-title">Contact & Query Form</h2>

      {/* Direct contact badge */}
      <div className="contact-info-card">
        <p><strong>Student Name:</strong> {studentInfo?.name || 'Nisarg Dedakiya'}</p>
        <p><strong>Direct Email:</strong> <a href={`mailto:${studentInfo?.email}`}>{studentInfo?.email}</a></p>
        <p><strong>Phone:</strong> {studentInfo?.phone}</p>
        <p><strong>Roll No:</strong> {studentInfo?.rollNo}</p>
      </div>

      {/* 1. UI Visibility Toggle using useState */}
      <div className="toggle-container">
        <button
          type="button"
          className="btn-toggle"
          onClick={() => setShowHelp((prev) => !prev)}
        >
          {showHelp ? '▲ Hide Form Instructions' : '▼ Show Form Instructions'}
        </button>

        {showHelp && (
          <div className="help-box">
            <p>
              <strong>Instructions:</strong> Type your name and message in the form below.
              Because both fields are <em>controlled components</em> backed by React <code>useState</code>,
              the live preview and character count update immediately on every keystroke.
            </p>
          </div>
        )}
      </div>

      {/* 2. Controlled Input Form */}
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="senderName">Your Name:</label>
          <input
            id="senderName"
            type="text"
            className="form-input"
            placeholder="e.g. John Doe"
            value={senderName}
            onChange={(e) => {
              setSenderName(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="userMessage">Your Message (Controlled Component):</label>
          <textarea
            id="userMessage"
            className="form-textarea"
            rows="4"
            placeholder="Type your message or inquiry here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            required
          />
          {/* Dynamic character counter */}
          <div className="char-counter">
            Character count: <strong>{message.length}</strong>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            Submit Message
          </button>
          <button type="button" className="btn-reset" onClick={handleReset}>
            Clear Form
          </button>
        </div>
      </form>

      {/* 3. Real-time Live State Preview */}
      <div className="live-preview-box">
        <h3>Real-time State Preview:</h3>
        <p><strong>Sender:</strong> {senderName || '(waiting for input...)'}</p>
        <p><strong>Live Captured Text:</strong> {message || '(waiting for input...)'}</p>
      </div>

      {/* Submission Success Alert */}
      {submitted && (
        <div className="submission-alert">
          Thank you, <strong>{senderName}</strong>! Your message has been captured into React component state successfully.
        </div>
      )}
    </section>
  );
}

export default Contact;
