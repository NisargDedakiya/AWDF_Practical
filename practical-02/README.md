# Practical 02: State Management and Routing in React

**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  
**Course:** Advanced Web Development Framework (AWDF / ITUE301)  

---

## 1. Exact Practical Question & Objective

> **Objective:** To implement reactive state management using the `useState` hook and multi-page client-side navigation using `react-router-dom` in the student portfolio application.

---

## 2. Theoretical Overview & Concepts

1. **Client-Side Routing (Single Page Applications):** In traditional multi-page web applications, clicking an `<a>` link triggers a full page request and reload from the web server. With React and `react-router-dom`, client-side routing intercepts URL changes, updates the browser history via the HTML5 History API, and dynamically swaps view components into the DOM without refreshing the page.
2. **`react-router-dom` Core Components:**
   - `<BrowserRouter>`: High-level router provider using standard URL paths.
   - `<Routes>` and `<Route>`: Declares route paths (`/`, `/projects`, `/contact`, `*`) and matches them to element views.
   - `<NavLink>`: Specialized navigation component that automatically applies an `active` CSS class to the currently active link for user visual feedback.
   - `<Link>`: Anchor-replacement for client-side transitions (e.g. "← Back to Home" button).
3. **State Management with `useState` Hook:**
   - **Controlled Components:** Form input elements whose values are controlled by React component state (`senderName`, `message`).
   - **Live State Preview:** Reflecting state changes in the UI in real time on every keystroke (`onChange`).
   - **Dynamic Character Counter:** Reading state length (`message.length`) on every update without manual DOM queries.
   - **UI Toggle State:** Boolean state (`showHelp`) conditionally rendering instructional content.
   - **Dark / Light Mode Toggle:** Root-level boolean state (`isDarkMode`) switching CSS classes and styling tokens dynamically.

---

## 3. Technologies Used

- **Runtime Environment:** Node.js (v18+ or v20+)
- **Package Manager:** npm
- **Build Tool & Bundler:** [Vite](https://vitejs.dev/)
- **Core Library:** React 18 & ReactDOM
- **Routing Library:** `react-router-dom` (v6)
- **Languages:** JavaScript (ES6+), HTML5, CSS3

---

## 4. Folder & File Structure

```
practical-02/
├── index.html              # HTML entry page hosting #root
├── package.json            # Dependencies: react, react-dom, react-router-dom
├── vite.config.js          # Vite config with React plugin (Port 3001)
├── .gitignore              # Ignores node_modules, dist, logs
├── README.md               # Practical 02 documentation & viva prep
└── src/
    ├── main.jsx            # Mounts App wrapped in <BrowserRouter>
    ├── index.css           # Global resets and root typography
    ├── App.jsx             # Manages Dark/Light mode state and <Routes>
    ├── App.css             # Light & Dark theme tokens, layout, and component styling
    └── components/
        ├── Header.jsx      # Student details banner with dynamic theme accent
        ├── NavBar.jsx      # Navigation using NavLink and theme toggle button
        ├── Home.jsx        # Home view route ("/") composing About & Skills
        ├── About.jsx       # Student bio and CSPIT/CHARUSAT highlights
        ├── Skills.jsx      # Categorized skill badges grid
        ├── Projects.jsx    # Projects view route ("/projects")
        ├── Contact.jsx     # Contact view route ("/contact") with useState form
        ├── NotFound.jsx    # Catch-all view route ("*") for 404 handling
        └── Footer.jsx      # Dynamic copyright year and contact info
```

---

## 5. Files and Their Specific Roles

| File | Purpose |
| :--- | :--- |
| `src/main.jsx` | Wraps the top-level `<App />` component in `<BrowserRouter>` to provide routing context. |
| `src/App.jsx` | Houses the `isDarkMode` state, `toggleTheme` function, and configures the `<Routes>` hierarchy. |
| `src/components/NavBar.jsx` | Renders `<NavLink>` links to `/`, `/projects`, `/contact` and the theme toggle button. |
| `src/components/Home.jsx` | Route `/`: Combines `About` and `Skills` components on the portfolio landing screen. |
| `src/components/Projects.jsx` | Route `/projects`: Displays academic and technical projects with tech stack pills. |
| `src/components/Contact.jsx` | Route `/contact`: Implements controlled inputs, real-time live preview, character counter, and UI visibility toggle. |
| `src/components/NotFound.jsx` | Route `*`: Renders friendly 404 message and return link when an unknown URL is requested. |
| `src/components/Header.jsx` | Displays student name, enrollment number (24CS014), and dynamic border/color based on theme. |
| `src/components/Footer.jsx` | Displays student contact details, roll number, and dynamic current year via `new Date().getFullYear()`. |
| `src/App.css` | Comprehensive CSS providing dark mode color palettes, active nav pill indicators, responsive cards, and form styles. |

---

## 6. Step-by-Step Setup & Execution Instructions

### Prerequisites:
- Ensure **Node.js** (v18.0+) and **npm** are installed:
  ```bash
  node -v
  npm -v
  ```

### Steps to Run:
1. Navigate into the `practical-02` directory:
   ```bash
   cd practical-02
   ```

2. Install project dependencies (`react`, `react-dom`, `react-router-dom`):
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```
   *Open the URL shown in terminal (typically `http://localhost:3001` or `http://localhost:5173`).*

4. Build for production verification:
   ```bash
   npm run build
   ```

---

## 7. Expected Output & Test Cases

| Test Case | Interaction / Inspection | Expected Output |
| :--- | :--- | :--- |
| **TC-01: Client-Side Navigation** | Click on `Home`, `Projects`, `Contact` links | Content switches instantly without browser tab reloading; active link receives highlighted `.active` styling. |
| **TC-02: Dark/Light Mode Toggle** | Click the `🌙 Dark Mode` button in navbar | Theme instantly switches to dark theme palette (`#0f172a`), button label changes to `☀️ Light Mode`. Clicking again reverts to light mode. |
| **TC-03: Controlled Inputs & Live Preview** | Type into `Your Name` and `Your Message` in `/contact` | Input state updates instantly; "Real-time State Preview" displays typed text as you type. |
| **TC-04: Dynamic Character Counter** | Type message in `/contact` | "Character count" updates synchronously with the length of `message`. |
| **TC-05: UI Visibility Toggle** | Click `Show Form Instructions` in `/contact` | Instructions box appears/disappears dynamically toggled by `showHelp` state. |
| **TC-06: Form Submission Alert** | Click `Submit Message` with filled fields | Green alert banner appears confirming message capture in state. |
| **TC-07: Form Reset** | Click `Clear Form` | Form fields, live preview, character counter, and alert reset to initial empty states. |
| **TC-08: 404 Catch-All Route** | Navigate to an invalid URL like `/random-test` | `NotFound.jsx` displays "404 - Page Not Found" and a link to return home. |

---

## 8. Key Code Explanations

### A. Wrapping in BrowserRouter
```jsx
// src/main.jsx
<BrowserRouter>
  <App />
</BrowserRouter>
```
*`BrowserRouter` enables the HTML5 history API, allowing React Router to manage URL changes without full page requests.*

### B. Route Configuration with Catch-All
```jsx
// src/App.jsx
<Routes>
  <Route path="/" element={<Home skillCategories={skillCategories} />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/contact" element={<Contact studentInfo={studentData} />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```
*`<Routes>` looks through its children `<Route>` elements to find the best match. The wildcard path `*` matches any path not matched above, handling 404 errors gracefully.*

### C. Controlled Component & Character Counter in Contact.jsx
```jsx
const [message, setMessage] = useState('');

<textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>
<div className="char-counter">
  Character count: <strong>{message.length}</strong>
</div>
```
*React manages the `<textarea>` value via the `message` state. Whenever a user types, `onChange` triggers `setMessage()`, re-rendering the component and updating both the textarea and `message.length` in real time.*

---

## 9. Common Errors and Troubleshooting

1. **Error: `useNavigate()` or `useLocation()` may be used only in the context of a `<Router>` component:**
   - *Cause:* Using React Router hooks or components outside of `<BrowserRouter>`.
   - *Fix:* Ensure `<BrowserRouter>` wraps `<App />` inside `main.jsx`.
2. **Active link styling not applying:**
   - *Cause:* Using standard HTML `<a href="...">` instead of React Router's `<NavLink to="...">`.
   - *Fix:* Use `<NavLink>` which provides the `isActive` property to conditionally apply the `.active` class.
3. **Form input cursor jumps to end or loses focus:**
   - *Cause:* Defining input components inside another component's render body.
   - *Fix:* Keep component definitions at module level.

---

## 10. Viva Voce Questions & Answers

### Q1. What is the difference between client-side routing and server-side routing?
> **Answer:** In server-side routing, every navigation request sends an HTTP GET request to the server, resulting in a full page refresh. In client-side routing (with React Router), the browser URL updates using the HTML5 History API and JavaScript re-renders the matching component locally without reloading the HTML document.

### Q2. What is the difference between `<Link>` and `<NavLink>` in `react-router-dom`?
> **Answer:** Both `<Link>` and `<NavLink>` facilitate client-side navigation without page reloads. However, `<NavLink>` specifically knows when the route it points to matches the current URL and allows conditional styling or adding an `active` class automatically.

### Q3. What is a "Controlled Component" in React?
> **Answer:** A controlled component is an input form element (like `<input>`, `<textarea>`, or `<select>`) whose value is governed by React component state (`useState`). Every input change invokes an `onChange` handler that updates the state, making state the "single source of truth".

### Q4. What happens when `useState` updater function is called?
> **Answer:** Calling the state updater function (e.g., `setMessage('hello')`) schedules a re-render of the component with the new state value. React compares the newly returned Virtual DOM against the previous Virtual DOM and applies only the necessary changes to the actual DOM.

### Q5. Why is the functional state update `setIsDarkMode(prev => !prev)` preferred over `setIsDarkMode(!isDarkMode)`?
> **Answer:** State updates in React may be batched or asynchronous. Passing an updater callback `(prev) => !prev` guarantees that the toggle operation is computed against the most recent state value rather than a stale closure snapshot.

### Q6. What is the purpose of the catch-all route `<Route path="*" element={<NotFound />} />`?
> **Answer:** The asterisk `*` serves as a wildcard route. If a user navigates to an undefined or mistyped URL, the router falls through all defined paths and matches the catch-all route, displaying a friendly 404 Error page instead of a blank screen.
