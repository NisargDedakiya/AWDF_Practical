// Skills Component
// Demonstrates: Dynamic mapping of categorized technical skills
function Skills({ skillCategories }) {
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
