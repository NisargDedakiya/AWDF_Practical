function Header({ name, title, contactInfo, themeColor = '#1d4ed8' }) {
  return (
    <header className="portfolio-header" style={{ borderBottomColor: themeColor }}>
      <div className="header-badge">AWDF Practical 08 — Performance Optimization & Lazy Loading</div>
      <h1 style={{ color: themeColor }}>{name}</h1>
      <p className="header-subtitle">{title}</p>
      {contactInfo && (
        <div className="header-contact">
          <span><strong>Email:</strong> <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></span>
          <span> | <strong>Phone:</strong> {contactInfo.phone}</span>
          <span> | <strong>Roll No:</strong> {contactInfo.rollNo}</span>
          <span> | <strong>Institute:</strong> {contactInfo.institution}</span>
        </div>
      )}
    </header>
  );
}

export default Header;
