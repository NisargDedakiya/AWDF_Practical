import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-view page-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h2 style={{ color: '#dc2626' }}>404 - Page Not Found</h2>
      <p style={{ margin: '14px 0', color: '#666' }}>The requested route was not matched by any dynamic or static chunk.</p>
      <Link to="/" className="btn-home-link" style={{ display: 'inline-block', padding: '8px 18px', background: '#0066cc', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Return to Home Page
      </Link>
    </div>
  );
}

export default NotFound;
