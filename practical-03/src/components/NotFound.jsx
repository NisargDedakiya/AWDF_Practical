import { Link } from 'react-router-dom';

// NotFound Component
// Route: "*" -> 404 handler
function NotFound() {
  return (
    <section className="not-found-view">
      <h2 className="not-found-title">404 - Page Not Found</h2>
      <p className="not-found-desc">
        The route you are trying to access does not exist in this Single Page Application.
      </p>
      <Link to="/" className="btn-home-link">
        ← Back to Portfolio Home
      </Link>
    </section>
  );
}

export default NotFound;
