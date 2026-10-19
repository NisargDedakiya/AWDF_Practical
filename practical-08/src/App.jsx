import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './components/Home';
import NotFound from './components/NotFound';
import './App.css';

// Lazy loading route-based components (Code Splitting - Practical 08)
const Projects = lazy(() => import('./components/Projects'));
const Contact = lazy(() => import('./components/Contact'));
const Analytics = lazy(() => import('./components/Analytics'));

// Meaningful fallback UI displayed while dynamic chunk is loading over network
function LoadingFallback() {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="simple-loader"></div>
      <p className="loading-title">Loading Route Chunk...</p>
      <span className="loading-subtitle">React.lazy() is fetching the dynamic JavaScript bundle via HTTP</span>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : '';
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Student academic details strictly matching Nisarg Dedakiya (24CS014)
  const studentData = {
    name: 'Nisarg Dedakiya',
    title: 'Computer Science & Engineering Student | B.Tech CSE',
    rollNo: '24CS014',
    email: '24cs014@charusat.edu.in',
    phone: '+91-9978132722',
    institution: 'CSPIT, CHARUSAT'
  };

  const themeColor = isDarkMode ? '#60a5fa' : '#0066cc';

  const skillCategories = {
    'Languages': ['JavaScript (ES6+)', 'Python', 'C++', 'Java', 'SQL'],
    'Frontend': ['React 18', 'React Router v6', 'HTML5', 'CSS3', 'Vite', 'Code Splitting'],
    'Backend & Frameworks': ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'bcryptjs'],
    'Databases': ['MongoDB', 'Mongoose ODM', 'MySQL'],
    'Core Computer Science': ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks'],
    'DevOps & Tools': ['Git', 'GitHub', 'Docker', 'Postman', 'VS Code']
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <Header
        name={studentData.name}
        title={studentData.title}
        contactInfo={studentData}
        themeColor={themeColor}
      />
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="main-content">
        {/* Route-level code splitting using Suspense with custom LoadingFallback */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home skillCategories={skillCategories} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact studentInfo={studentData} />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer
        contactEmail={studentData.email}
        phone={studentData.phone}
        rollNo={studentData.rollNo}
      />
    </div>
  );
}
