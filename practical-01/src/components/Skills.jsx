// Skills Component
// Demonstrates: Dynamic list rendering using JavaScript array methods (.map()), handling object/array props, and key props
function Skills({ skillCategories }) {
  // Case 1: skillCategories is passed as an object grouping skills by category
  if (skillCategories && typeof skillCategories === 'object' && !Array.isArray(skillCategories)) {
    return (
      <section className="portfolio-section skills-section">
        <h2 className="section-title">Technical Skills</h2>
        <div className="skills-category-grid">
          {Object.entries(skillCategories).map(([category, skills]) => (
            <div key={category} className="skill-category-card">
              <h3 className="category-title">{category}</h3>
              <div className="skill-badges">
                {skills.map((skill) => (
                  <span key={skill} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Case 2: Fallback when skillCategories is passed as a flat array (or empty)
  const skillsList = Array.isArray(skillCategories) ? skillCategories : [];

  return (
    <section className="portfolio-section skills-section">
      <h2 className="section-title">Technical Skills</h2>
      <div className="skill-badges">
        {skillsList.map((skill) => (
          <span key={skill} className="skill-badge">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

export default Skills;
