import { NavLink } from 'react-router-dom';

function NavBar({ isDarkMode, toggleTheme }) {
  return (
    <nav className="portfolio-nav">
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          end
        >
          Home (Eager)
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Projects (Lazy)
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Contact (Lazy)
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Analytics & Metrics (Lazy)
        </NavLink>
      </div>

      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </nav>
  );
}

export default NavBar;
