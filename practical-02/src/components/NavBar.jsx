import { NavLink } from 'react-router-dom';

// NavBar Component
// Demonstrates: Client-side routing with NavLink (automatic active class) and state action triggering via props
function NavBar({ isDarkMode, toggleTheme }) {
  return (
    <nav className="portfolio-nav">
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Projects
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Contact
        </NavLink>
      </div>

      {/* State toggle button for Dark/Light mode */}
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Toggle dark/light theme"
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </nav>
  );
}

export default NavBar;
