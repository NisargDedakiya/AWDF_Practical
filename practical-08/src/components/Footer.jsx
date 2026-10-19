function Footer({ contactEmail = '24cs014@charusat.edu.in', phone = '+91-9978132722', rollNo = '24CS014' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="portfolio-footer">
      <p>
        <strong>Email:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a> | <strong>Phone:</strong> {phone} | <strong>Roll No:</strong> {rollNo}
      </p>
      <p style={{ marginTop: '4px' }}>
        &copy; {currentYear} Nisarg Dedakiya. CHARUSAT CSPIT | ITUE301: Advanced Web Development Frameworks (AWDF)
      </p>
    </footer>
  );
}

export default Footer;
