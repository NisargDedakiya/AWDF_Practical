import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoList from './RepoList';

// Projects View Component
// Route: "/projects"
// Demonstrates:
// 1. Asynchronous REST API integration with GitHub using fetch API
// 2. Lifecycle management using useEffect hook on component mount
// 3. Three-state asynchronous UI handling (Loading, Error, and Success)
// 4. Client-side dynamic search filtering
// 5. Practical error state simulation / testing control
function Projects() {
  // Step 1: Manage state for repositories, loading indicator, and error messaging
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter query state
  const [searchQuery, setSearchQuery] = useState('');

  // Target GitHub profile for student Nisarg Dedakiya
  const githubUsername = 'NisargDedakiya';

  // Function to fetch GitHub repositories via REST API
  const fetchRepos = (triggerError = false) => {
    setLoading(true);
    setError(null);

    // If triggerError is true, hit an invalid endpoint to demonstrate error handling
    const url = triggerError
      ? 'https://api.github.com/users/non_existent_user_999999_xyz/repos'
      : `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=30`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          setRepos([]);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch repositories.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Step 2: Use useEffect hook to trigger API fetch on initial component mount
  useEffect(() => {
    fetchRepos();
  }, []);

  // Filter repositories dynamically based on search query
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredProjects = [
    {
      id: 1,
      title: 'CarIQ – Used Car Price Prediction Dashboard',
      tech: 'Python, Streamlit, Machine Learning',
      desc: 'AI-powered dashboard analyzing automobile market trends with interactive regression price prediction.'
    },
    {
      id: 2,
      title: 'Full-Stack Maze Solver & 3D Visualizer',
      tech: 'JavaScript, React, Three.js, Python, Flask',
      desc: 'Full-stack application visualizing BFS, DFS, Dijkstra, and A* pathfinding algorithms in 2D and 3D.'
    },
    {
      id: 3,
      title: 'Campus Accommodation & Meal Management System',
      tech: 'React, Node.js, Express, MongoDB',
      desc: 'Role-based operational workflow system managing room allocation, meal tokens, and billing.'
    }
  ];

  return (
    <div className="projects-view">
      {/* 1. Featured Academic / Resume Projects */}
      <section className="portfolio-section">
        <h2 className="section-title">Featured Academic Projects</h2>
        <div className="projects-container">
          {featuredProjects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="project-header">
                <h3 className="project-title">{p.title}</h3>
                <span className="project-tech-pill">{p.tech}</span>
              </div>
              <p className="project-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Live GitHub API Integration (Core Practical 03 Requirement) */}
      <section className="portfolio-section api-projects-section">
        <div className="api-section-header">
          <h2 className="section-title">Live GitHub Repositories (REST API Integration)</h2>
          <span className="api-user-tag">User: @{githubUsername}</span>
        </div>

        <p className="api-description">
          Fetched dynamically from GitHub REST API via <code>useEffect</code> with loading, error, and search filtering states.
        </p>

        {/* Search Filter & Testing Controls */}
        <div className="api-controls">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search repositories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="api-action-buttons">
            <button
              type="button"
              className="btn-refresh"
              onClick={() => fetchRepos(false)}
              disabled={loading}
              title="Refresh repository list"
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              className="btn-test-error"
              onClick={() => fetchRepos(true)}
              title="Simulate error state to test error UI"
            >
              ⚠️ Test Error State
            </button>
          </div>
        </div>

        {/* Step 3: Conditional Rendering based on Asynchronous State */}
        {loading && <Spinner />}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchRepos(false)}
          />
        )}

        {!loading && !error && (
          <RepoList data={filteredRepos} />
        )}
      </section>
    </div>
  );
}

export default Projects;
