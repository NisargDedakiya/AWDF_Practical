import About from './About';
import Skills from './Skills';

function Home({ skillCategories }) {
  return (
    <div className="home-view">
      <About />
      <Skills skillCategories={skillCategories} />
    </div>
  );
}

export default Home;
