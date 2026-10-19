// Header Component
// Demonstrates: Receiving multiple props, prop destructuring, default prop values, and dynamic inline styling
function Header({ name, title, contactInfo, themeColor = '#1e40af' }) {
  return (
    <header className="portfolio-header" style={{ borderBottomColor: themeColor }}>
      {/* Dynamic inline style using themeColor passed from parent (App.jsx) */}
      <h1 className="header-name" style={{ color: themeColor }}>
        {name}
      </h1>
      <p className="header-title">{title}</p>

      {/* Conditionally render contact information if provided */}
      {contactInfo && (
        <div className="header-contact">
          <span className="contact-item">
            <strong>Email:</strong>{' '}
            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          </span>
          <span className="contact-separator">|</span>
          <span className="contact-item">
            <strong>Phone:</strong> {contactInfo.phone}
          </span>
          <span className="contact-separator">|</span>
          <span className="contact-item">
            <strong>Roll No:</strong> {contactInfo.rollNo}
          </span>
        </div>
      )}
    </header>
  );
}

export default Header;
