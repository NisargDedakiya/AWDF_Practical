function About() {
  return (
    <section className="portfolio-section">
      <h2>About Me</h2>
      <p>
        Computer Science and Engineering student at CSPIT, Charotar University of Science and Technology (CHARUSAT).
        Enthusiastic full-stack developer focusing on modern web performance optimization, asynchronous data pipelines,
        React component architecture, and cloud microservices.
      </p>
      <div className="objective-box" style={{ marginTop: '14px', padding: '12px', background: 'rgba(0,102,204,0.06)', borderRadius: '6px' }}>
        <strong>Practical 08 Demonstration:</strong>
        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
          This Home page is bundled <em>eagerly</em> in the main application payload (<code>index-[hash].js</code>).
          The other navigation routes (<em>Projects</em>, <em>Contact</em>, and <em>Analytics</em>) are split into separate JavaScript chunks
          via <code>React.lazy()</code> and dynamically downloaded over the network inside a <code>&lt;Suspense&gt;</code> container on demand.
        </p>
      </div>
    </section>
  );
}

export default About;
