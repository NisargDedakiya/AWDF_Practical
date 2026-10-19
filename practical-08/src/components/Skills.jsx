function Skills({ skillCategories }) {
  if (skillCategories && typeof skillCategories === 'object' && !Array.isArray(skillCategories)) {
    return (
      <section className="portfolio-section">
        <h2>Technical Skills</h2>
        <div className="skills-categories">
          {Object.entries(skillCategories).map(([category, items]) => (
            <div key={category} className="skill-category-item">
              <strong className="category-title">{category}: </strong>
              <span>{items.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const list = Array.isArray(skillCategories) ? skillCategories : [];
  return (
    <section className="portfolio-section">
      <h2>Technical Skills</h2>
      <ul className="skills-list">
        {list.map((s) => (
          <li key={s} className="skill-item">{s}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
