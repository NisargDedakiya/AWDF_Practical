// RepoList Component
// Renders dynamic list of GitHub repositories with metadata (stars, forks, language)
function RepoList({ data = [] }) {
  if (data.length === 0) {
    return <p className="no-repos">No repositories found matching your search.</p>;
  }

  return (
    <div className="repos-grid">
      {data.map((repo) => (
        <div key={repo.id} className="repo-card">
          <div className="repo-header">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-title-link"
            >
              {repo.name}
            </a>
            <span className="repo-stars">★ {repo.stargazers_count ?? 0}</span>
          </div>

          <p className="repo-desc">
            {repo.description || 'No description provided for this repository.'}
          </p>

          <div className="repo-meta">
            {repo.language && (
              <span className="repo-badge language-badge">
                {repo.language}
              </span>
            )}
            <span className="repo-badge">
              Forks: {repo.forks_count ?? 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RepoList;
