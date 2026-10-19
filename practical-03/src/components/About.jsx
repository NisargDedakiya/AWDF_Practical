// About Component
// Displays academic bio for Nisarg Dedakiya (24CS014)
function About() {
  return (
    <section className="portfolio-section about-section">
      <h2 className="section-title">About Me</h2>
      <p className="about-bio">
        I am Nisarg Dedakiya, a B.Tech Computer Science and Engineering student at Chandubhai S. Patel Institute of Technology (CSPIT),
        Charotar University of Science and Technology (CHARUSAT). Focused on Full-Stack Frameworks, RESTful API integrations,
        asynchronous state management in React, and building performant modern web applications.
      </p>

      <div className="about-highlights">
        <div className="highlight-card">
          <span className="highlight-label">Degree</span>
          <span className="highlight-value">B.Tech in CSE</span>
        </div>
        <div className="highlight-card">
          <span className="highlight-label">Institute</span>
          <span className="highlight-value">CSPIT, CHARUSAT</span>
        </div>
        <div className="highlight-card">
          <span className="highlight-label">Enrollment No</span>
          <span className="highlight-value">24CS014</span>
        </div>
        <div className="highlight-card">
          <span className="highlight-label">Batch</span>
          <span className="highlight-value">2024 – 2028</span>
        </div>
      </div>
    </section>
  );
}

export default About;
