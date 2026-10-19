import { useState } from 'react';

function Contact({ studentInfo }) {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim().length > 0) {
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
      <div className="section-header-row">
        <h2>Contact & Query Form</h2>
        <span className="lazy-badge">⚡ Lazy Loaded Chunk: Contact-[hash].js</span>
      </div>
      <p className="chunk-desc">
        This contact module was fetched dynamically via <code>React.lazy()</code>.
        If a visitor never clicks the Contact tab, this code is never transferred over the wire!
      </p>

      <div className="contact-info-card">
        <p><strong>Student Name:</strong> {studentInfo?.name || 'Nisarg Dedakiya'}</p>
        <p><strong>Enrollment Number:</strong> {studentInfo?.rollNo || '24CS014'}</p>
        <p><strong>Direct Email:</strong> <a href={`mailto:${studentInfo?.email}`}>{studentInfo?.email}</a></p>
        <p><strong>Phone:</strong> {studentInfo?.phone}</p>
        <p><strong>Institution:</strong> {studentInfo?.institution || 'CSPIT, CHARUSAT'}</p>
      </div>

      <div className="toggle-container">
        <button
          type="button"
          className="btn-toggle"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? 'Hide Form Instructions ▲' : 'Show Form Instructions ▼'}
        </button>

        {showHelp && (
          <div className="help-box">
            <p><strong>Instructions:</strong> Type your message into the controlled input below. As you type, the character count and live preview will update in real time using React <code>useState</code>.</p>
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
            placeholder="Enter your full name"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="userMessage">Your Message (Controlled Input):</label>
          <textarea
            id="userMessage"
            className="form-textarea"
            rows="4"
            placeholder="Write your message here..."
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
          <button type="submit" className="btn-submit">Submit Message</button>
          <button type="button" className="btn-reset" onClick={handleReset}>Clear</button>
        </div>
      </form>

      <div className="live-preview-box">
        <h3>Real-time State Preview:</h3>
        <p><strong>Sender:</strong> {senderName || '(typing...)'}</p>
        <p><strong>Live Captured Text:</strong> {message || '(no input typed yet)'}</p>
      </div>

      {submitted && (
        <div className="submission-alert">
          Thank you, <strong>{senderName}</strong>! Your message has been received successfully.
        </div>
      )}
    </section>
  );
}

export default Contact;
