import { useState } from 'react';

// Contact Component
// Route: "/contact"
// Demonstrates controlled inputs, character count, live preview, and help toggle
function Contact({ studentInfo }) {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);
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

      <div className="contact-info-card">
        <p><strong>Student Name:</strong> {studentInfo?.name || 'Nisarg Dedakiya'}</p>
        <p><strong>Direct Email:</strong> <a href={`mailto:${studentInfo?.email}`}>{studentInfo?.email}</a></p>
        <p><strong>Phone:</strong> {studentInfo?.phone}</p>
        <p><strong>Roll No:</strong> {studentInfo?.rollNo}</p>
      </div>

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

      <div className="live-preview-box">
        <h3>Real-time State Preview:</h3>
        <p><strong>Sender:</strong> {senderName || '(waiting for input...)'}</p>
        <p><strong>Live Captured Text:</strong> {message || '(waiting for input...)'}</p>
      </div>

      {submitted && (
        <div className="submission-alert">
          Thank you, <strong>{senderName}</strong>! Your message has been captured into React component state successfully.
        </div>
      )}
    </section>
  );
}

export default Contact;
