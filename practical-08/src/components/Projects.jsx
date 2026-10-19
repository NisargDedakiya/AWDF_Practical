function Projects() {
  const projectList = [
    {
      id: 1,
      title: 'Full-Stack Task Management Portal (Practical 06/07)',
      techStack: 'React, Express.js, MongoDB, JWT Authentication, bcryptjs',
      points: [
        'Architected stateless authentication pipeline securing user-scoped tasks using JSON Web Tokens and bcrypt password hashing.',
        'Implemented bidirectional optimistic UI state synchronization with instant client-side feedback and automated rollback on server failure.',
        'Structured RESTful API endpoints with schema validation, priority indexing, and centralized error middleware.'
      ]
    },
    {
      id: 2,
      title: 'Real-Time GitHub Developer Analytics Dashboard (Practical 03)',
      techStack: 'React 18, GitHub REST API, Asynchronous Fetch, CSS Grid',
      points: [
        'Engineered an interactive GitHub profile explorer fetching public user repositories, followers, and activity metrics.',
        'Built explicit three-state asynchronous UI handling (Loading spinner, Error banner with retry, and Success render).',
        'Implemented live search filtering and dynamic repository card sorting.'
      ]
    },
    {
      id: 3,
      title: 'Distributed Cloud Microservices & Container Orchestration',
      techStack: 'Docker, Node.js, Redis, Nginx Reverse Proxy',
      points: [
        'Designed high-availability backend cluster containerized with Docker and fronted by Nginx load balancer.',
        'Integrated Redis caching layer reducing database round-trips by 65% for high-frequency queries.',
        'Conducted load testing demonstrating sub-50ms latency under sustained concurrent requests.'
      ]
    }
  ];

  return (
    <section className="portfolio-section">
      <div className="section-header-row">
        <h2>Featured Projects</h2>
        <span className="lazy-badge">⚡ Lazy Loaded Chunk: Projects-[hash].js</span>
      </div>
      <p className="chunk-desc">
        This component was loaded on demand when you navigated to <code>/projects</code>.
        It was not included in the initial page payload, saving initial bundle transfer size and parsing overhead!
      </p>

      <div className="projects-container">
        {projectList.map((project) => (
          <div key={project.id} className="project-card">
            <h3>{project.title}</h3>
            <p className="project-tech"><strong>Tech Stack:</strong> {project.techStack}</p>
            <ul className="project-points">
              {project.points.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
