import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Projects from './components/Projects';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import './App.css';

// Main App Component for Practical 03
// Demonstrates:
// 1. Reactive State Management (useState) for Dark/Light mode theme
// 2. Client-Side Routing with React Router v6
// 3. Asynchronous Data Handling via GitHub REST API (inside Projects.jsx)
function App() {
  // useState Hook: Manages dark/light mode toggle
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Student Profile Data Model (Nisarg Dedakiya - 24CS014)
  const studentData = {
    name: 'Nisarg Dedakiya',
    title: 'B.Tech CSE Student | CSPIT, CHARUSAT (2024 – 2028)',
    rollNo: '24CS014',
    email: '24cs014@charusat.edu.in',
    phone: '+91-9978132722'
  };

  // Dynamic theme accent color
  const themeColor = isDarkMode ? '#60a5fa' : '#1e40af';

  // Categorized Technical Skills data
  const skillCategories = {
    'Programming Languages': ['C', 'C++', 'Java', 'Python', 'JavaScript (ES6+)'],
    'Web Technologies': ['HTML5', 'CSS3', 'React.js', 'React Router v6', 'REST APIs', 'Vite'],
    'Machine Learning & Data': ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Streamlit'],
    'Databases': ['MySQL', 'MongoDB', 'SQLite'],
    'Tools & Version Control': ['Git', 'GitHub', 'VS Code', 'Postman']
  };

  return (
    <div className={`portfolio-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 1. Header component */}
      <Header
        name={studentData.name}
        title={studentData.title}
        contactInfo={studentData}
        themeColor={themeColor}
      />

      {/* 2. Client-Side Navigation Bar with theme toggle */}
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* 3. React Router Views */}
      <main className="portfolio-content">
        <Routes>
          {/* Route 1: Home View (About + Skills) */}
          <Route path="/" element={<Home skillCategories={skillCategories} />} />

          {/* Route 2: Projects View (Featuring GitHub REST API Integration) */}
          <Route path="/projects" element={<Projects />} />

          {/* Route 3: Contact View */}
          <Route path="/contact" element={<Contact studentInfo={studentData} />} />

          {/* Route 4: Catch-All 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* 4. Footer component */}
      <Footer
        contactEmail={studentData.email}
        phone={studentData.phone}
        rollNo={studentData.rollNo}
      />
    </div>
  );
}

export default App;
