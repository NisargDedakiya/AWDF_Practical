// Projects View Component
// Route: "/projects" -> Renders academic and featured projects
function Projects() {
  const projectList = [
    {
      id: 1,
      title: 'CarIQ – Used Car Price Prediction & Analytics Dashboard',
      techStack: 'Python, Streamlit, Scikit-learn, Pandas',
      points: [
        'Developed an end-to-end AI dashboard to analyze used automobile market trends and predict vehicle valuation.',
        'Trained regression models incorporating parameters like manufacturing year, mileage, fuel type, and transmission.',
        'Created interactive visualizations for depreciation rates and brand price comparisons.'
      ]
    },
    {
      id: 2,
      title: 'Full-Stack Maze Solver & 3D Pathfinding Visualizer',
      techStack: 'JavaScript, React, Three.js, Python, Flask',
      points: [
        'Built an interactive maze generation and solving visualizer utilizing BFS, DFS, Dijkstra, and A* algorithms.',
        'Engineered a Flask REST API backend to compute optimal paths and generate randomized maze grids.',
        'Designed an interactive real-time 2D Canvas and 3D Three.js environment for step-by-step path exploration.'
      ]
    },
    {
      id: 3,
      title: 'Campus Accommodation & Meal Management System',
      techStack: 'React, Node.js, Express, MongoDB',
      points: [
        'Designed a role-based management portal (Administrator, Student, Kitchen Staff) to streamline booking and meals.',
        'Implemented room allocation workflows, daily menu updates, attendance logging, and automated billing receipts.',
        'Integrated responsive UI cards and real-time status indicators for room availability.'
      ]
    }
  ];

  return (
    <section className="portfolio-section projects-section">
      <h2 className="section-title">Academic & Featured Projects</h2>
      <div className="projects-grid">
        {projectList.map((project) => (
          <article key={project.id} className="project-card">
            <div className="project-header">
              <h3 className="project-title">{project.title}</h3>
              <span className="project-tech-pill">{project.techStack}</span>
            </div>
            <ul className="project-points">
              {project.points.map((point, index) => (
                <li key={index} className="project-point-item">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;
