import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Footer from './components/Footer';
import './App.css';

// Main App Component
// Demonstrates: Component composition, unidirectional data flow, and passing props down to child components
function App() {
  // Student Profile Data Model
  const studentData = {
    name: 'Nisarg Dedakiya',
    title: 'B.Tech CSE Student | CSPIT, CHARUSAT (2024 – 2028)',
    rollNo: '24CS014',
    email: '24cs014@charusat.edu.in',
    phone: '+91-9978132722'
  };

  // Theme primary color passed as prop for dynamic styling
  const themeColor = '#1e40af';

  // Categorized Technical Skills data passed to Skills component
  const skillCategories = {
    'Programming Languages': ['C', 'C++', 'Java', 'Python', 'JavaScript (ES6+)'],
    'Web Technologies': ['HTML5', 'CSS3', 'React.js', 'Vite', 'REST APIs'],
    'Machine Learning & Data': ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Streamlit'],
    'Databases': ['MySQL', 'MongoDB', 'SQLite'],
    'Tools & Version Control': ['Git', 'GitHub', 'VS Code', 'Postman']
  };

  return (
    <div className="portfolio-container">
      {/* 1. Header Component: Receives name, title, contact details, and theme color via props */}
      <Header
        name={studentData.name}
        title={studentData.title}
        contactInfo={studentData}
        themeColor={themeColor}
      />

      {/* Main Content Area */}
      <main className="portfolio-content">
        {/* 2. About Component: Static presentation component with bio and education highlights */}
        <About />

        {/* 3. Skills Component: Dynamically receives skill categories object via props */}
        <Skills skillCategories={skillCategories} />

        {/* 4. Projects Component: Renders list of academic projects using nested mapping */}
        <Projects />
      </main>

      {/* 5. Footer Component: Receives email, phone, and roll number via props */}
      <Footer
        contactEmail={studentData.email}
        phone={studentData.phone}
        rollNo={studentData.rollNo}
      />
    </div>
  );
}

export default App;
