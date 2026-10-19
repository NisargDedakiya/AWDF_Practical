// Footer Component
// Demonstrates: Receiving contact props, dynamic current year calculation, and semantic footer
function Footer({
  contactEmail = '24cs014@charusat.edu.in',
  phone = '+91-9978132722',
  rollNo = '24CS014'
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="portfolio-footer">
      <div className="footer-content">
        <p className="footer-contact">
          <span>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </span>
          <span className="footer-separator">•</span>
          <span>
            <strong>Phone:</strong> {phone}
          </span>
          <span className="footer-separator">•</span>
          <span>
            <strong>Roll No:</strong> {rollNo}
          </span>
        </p>

        <p className="footer-note">
          &copy; {currentYear} Nisarg Dedakiya (24CS014) | AWDF Practical 02 Submission
        </p>
      </div>
    </footer>
  );
}

export default Footer;
