# Practical 01: Introduction to React and Component Architecture

**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  
**Course:** Advanced Web Development Framework (AWDF / ITUE301)  

---

## 1. Exact Practical Question / Aim
> **Objective:** To set up a React development environment using Vite and build a static User Interface (UI) for a student portfolio using independently structured, reusable components and props.

---

## 2. Theoretical Overview & Concepts
1. **React Component Architecture:** In modern web development frameworks like React, user interfaces are divided into independent, self-contained, and reusable pieces called **Components**.
2. **Component Independence:** Each UI section (`Header`, `About`, `Skills`, `Projects`, `Footer`) lives in its own file in `src/components/`, isolating logic and presentation.
3. **Props (Properties):** Mechanism to pass data from a parent component (`App.jsx`) to a child component (`Header.jsx`, `Skills.jsx`, `Footer.jsx`). Props flow strictly in a **unidirectional (top-to-bottom)** pattern.
4. **Dynamic List Rendering:** Using JavaScript array methods such as `.map()` to generate repeated JSX elements dynamically with unique `key` props for efficient Virtual DOM diffing.
5. **Inline Dynamic Styling:** Dynamically styling elements using props (e.g., passing a `themeColor` string prop to customize the border and heading color).

---

## 3. Technologies Used
- **Runtime Environment:** Node.js (v18+ or v20+)
- **Package Manager:** npm
- **Build Tool & Bundler:** [Vite](https://vitejs.dev/) (Fast development server & HMR)
- **Library:** React (v18 / v19) & ReactDOM
- **Languages:** JavaScript (ES6+), HTML5, CSS3

---

## 4. Folder & File Structure

```
practical-01/
├── index.html              # HTML entry page hosting the #root container
├── package.json            # Project manifest, dependencies, and npm scripts
├── vite.config.js          # Vite configuration with @vitejs/plugin-react
├── README.md               # Comprehensive documentation and viva preparation
└── src/
    ├── main.jsx            # React root renderer injecting App into #root
    ├── index.css           # Global CSS resets and body typography
    ├── App.jsx             # Top-level container component & state/data coordinator
    ├── App.css             # Component-scoped styling and responsive layout
    └── components/
        ├── Header.jsx      # Header receiving name, title, contactInfo, themeColor
        ├── About.jsx       # Static presentation component for student bio
        ├── Skills.jsx      # Dynamic list renderer mapping categorized technical skills
        ├── Projects.jsx    # Component rendering academic projects and tech stacks
        └── Footer.jsx      # Footer receiving contactEmail, phone, and rollNo props
```

---

## 5. Files and Their Specific Purposes

| File Name | Purpose |
| :--- | :--- |
| `index.html` | The single HTML file for the Single Page Application (SPA), containing `<div id="root"></div>`. |
| `vite.config.js` | Configures the Vite build tool and integrates the React SWC/Babel plugin. |
| `src/main.jsx` | Entry point of React that uses `ReactDOM.createRoot()` to mount the `<App />` component. |
| `src/App.jsx` | Parent component storing the student profile data model and passing props to child components. |
| `src/components/Header.jsx` | Displays student name, title, contact details, and applies dynamic inline styles via `themeColor`. |
| `src/components/About.jsx` | Displays student biography, academic degree, institution name, and focal areas. |
| `src/components/Skills.jsx` | Iterates over skill categories and arrays using `.map()` with unique `key` attributes. |
| `src/components/Projects.jsx` | Iterates over academic project objects, displaying tech stacks and bullet points. |
| `src/components/Footer.jsx` | Displays contact links, roll number, and dynamic current year via `new Date().getFullYear()`. |
| `src/App.css` | Styles cards, badges, grids, headings, and mobile responsive media queries. |

---

## 6. Step-by-Step Setup & Execution Instructions

### Prerequisites:
- Ensure **Node.js** (v18.0 or higher) and **npm** are installed. Check versions using:
  ```bash
  node -v
  npm -v
  ```

### Execution Steps:
1. Open terminal and navigate into the `practical-01` directory:
   ```bash
   cd practical-01
   ```

2. Install the necessary project dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The terminal will provide a local URL (typically `http://localhost:3000` or `http://localhost:5173`). Open this URL in any web browser to see the portfolio.*

4. To verify production compilation (build test):
   ```bash
   npm run build
   ```

---

## 7. Expected Output & Test Cases

| Test Case | Interaction / Inspection | Expected Output |
| :--- | :--- | :--- |
| **TC-01: Page Load** | Open `http://localhost:3000` | Entire student portfolio renders without console errors or layout breakage. |
| **TC-02: Header Props** | Verify Header content | Student Name (`Nisarg Dedakiya`), title, email, phone, and roll number (`24CS014`) are rendered. |
| **TC-03: Dynamic Theming** | Inspect Header inline styling | Header border and title text use the theme color `#1e40af` passed via `themeColor` prop. |
| **TC-04: Dynamic Skills** | Inspect Skills section | Categories (`Programming Languages`, `Web Technologies`, etc.) and skill badges are rendered via `.map()`. |
| **TC-05: Projects Cards** | Inspect Projects section | 3 project cards render with their respective title, tech stack badge, and bullet points. |
| **TC-06: Dynamic Footer Year** | Inspect Footer copyright text | Copyright year dynamically reflects current calendar year (`2026`). |
| **TC-07: Responsive Layout** | Resize browser window to mobile width (<640px) | Layout shifts to a clean single column; badges wrap without horizontal overflow. |

---

## 8. Important Code Explanations

### A. Passing Props to Header
```jsx
<Header
  name={studentData.name}
  title={studentData.title}
  contactInfo={studentData}
  themeColor={themeColor}
/>
```
*In `App.jsx`, props are passed as HTML-like attributes. In `Header.jsx`, they are destructured directly in the function parameter: `function Header({ name, title, contactInfo, themeColor = '#1e40af' })`.*

### B. Dynamic List Rendering with Keys
```jsx
{skills.map((skill) => (
  <span key={skill} className="skill-badge">
    {skill}
  </span>
))}
```
*The `.map()` function returns a new array of JSX elements. React requires the `key` prop so its Virtual DOM reconciliation algorithm can identify which items have changed, been added, or removed.*

---

## 9. Viva Voce Questions & Answers (College Exam Prep)

### Q1. What is React and why is it called a component-based library?
> **Answer:** React is a declarative, efficient JavaScript library developed by Facebook for building user interfaces. It is called component-based because the UI is divided into self-contained, independent, reusable modules (components) that manage their own state and logic.

### Q2. What are "Props" in React and how do they differ from "State"?
> **Answer:** 
> - **Props (Properties):** Read-only data passed from a parent component down to a child component. Props cannot be modified by the receiving child (immutable).
> - **State:** An internal, mutable data store managed within the component itself that can trigger re-renders when updated.

### Q3. Why is the `key` prop required when rendering lists using `.map()`?
> **Answer:** The `key` prop gives each element in a list a stable and unique identity. React's Virtual DOM diffing algorithm uses keys to identify which elements were added, removed, or reordered, avoiding unnecessary DOM re-creation and improving performance.

### Q4. What is Vite and why is it preferred over Create React App (CRA)?
> **Answer:** Vite is a next-generation frontend build tool powered by native ES Modules (ESM) in the browser and esbuild (written in Go). It provides significantly faster cold start times, instant Hot Module Replacement (HMR), and streamlined configuration compared to Webpack-based Create React App.

### Q5. What is the role of `ReactDOM.createRoot()` in `main.jsx`?
> **Answer:** Introduced in React 18, `createRoot()` creates a root container for the application within the specified HTML DOM element (`#root`) and enables React 18 concurrent rendering features.

### Q6. What does `React.StrictMode` do?
> **Answer:** `React.StrictMode` is a development-only helper tool that highlights potential problems in an application (e.g., deprecated lifecycle methods, unexpected side-effects) by intentionally double-invoking certain functions in development mode. It has no effect on production builds.

### Q7. Can a child component pass props back up to its parent component?
> **Answer:** In React, data flow is strictly unidirectional (top-to-bottom). However, a parent can pass a **callback function** down to a child as a prop; when the child invokes this function with arguments, data is effectively passed back up to the parent.
