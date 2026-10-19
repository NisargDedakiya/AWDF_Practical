# Practical 03: API Integration and Data Rendering in React

**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  
**Course:** Advanced Web Development Framework (AWDF / ITUE301)  

---

## 1. Exact Practical Question & Objective

> **Objective:** To consume a REST API (GitHub REST API) in React and manage asynchronous data with loading, success, and error states using `useEffect` and `useState`.

---

## 2. Theoretical Overview & Concepts

1. **REST API Integration:** Modern web applications frequently consume external RESTful services. In React, HTTP requests are usually initiated using the native `fetch()` API or `axios` library.
2. **Component Lifecycle with `useEffect`:**
   - The `useEffect` hook allows functional components to perform side-effects, such as data fetching, subscriptions, or manually manipulating the DOM.
   - An **empty dependency array `[]`** tells React to run the effect **only once**, when the component initially mounts into the DOM.
3. **Three-State Asynchronous Data Model:**
   - **Loading State (`loading = true`):** Active when a network request is pending. Shows visual feedback like a `<Spinner />` so users know data is being retrieved.
   - **Error State (`error = '...'`):** Triggered when the HTTP response returns a failure status (e.g. 404, 500) or network connectivity fails. Renders `<ErrorMessage />` with a retry trigger.
   - **Success State (`repos = [...]`):** Once JSON data resolves successfully, `<RepoList />` maps the array of items into cards.
4. **Interactive Supplementary Features:**
   - **Live Client-Side Filtering:** User queries dynamically filter the loaded repository array in memory by repository name without re-fetching from the network.
   - **Retry Mechanism:** Allows the user to re-attempt an interrupted API call.
   - **Error Boundary/State Simulation:** A test button temporarily requests an invalid endpoint (`non_existent_user_999999_xyz`) to prove and demonstrate error state handling for viva and examination evaluators.

---

## 3. Technologies Used

- **Runtime Environment:** Node.js (v18+ or v20+)
- **Package Manager:** npm
- **Build Tool & Bundler:** [Vite](https://vitejs.dev/)
- **Core Library:** React 18 & ReactDOM
- **Routing:** `react-router-dom` (v6)
- **External Web API:** GitHub REST API (`https://api.github.com`)
- **Languages:** JavaScript (ES6+), HTML5, CSS3

---

## 4. Folder & File Structure

```
practical-03/
├── index.html              # HTML host document
├── package.json            # Dependencies: react, react-dom, react-router-dom
├── vite.config.js          # Vite configuration (Port 3002)
├── .gitignore              # Ignores node_modules, dist, logs
├── README.md               # Lab manual, architecture, and viva questions
└── src/
    ├── main.jsx            # Mounts App wrapped in <BrowserRouter>
    ├── index.css           # Global resets and typography
    ├── App.jsx             # Coordinates dark mode and multi-page routing
    ├── App.css             # Styles for API cards, spinner, and error banner
    └── components/
        ├── Header.jsx      # Banner displaying Nisarg Dedakiya & 24CS014
        ├── NavBar.jsx      # Client routing links and theme toggle
        ├── Home.jsx        # Landing page (About + Skills)
        ├── About.jsx       # Student academic bio (CSPIT, CHARUSAT)
        ├── Skills.jsx      # Categorized skill badges
        ├── Projects.jsx    # Projects route with GitHub REST API fetch & useEffect
        ├── Spinner.jsx     # Loading spinner animation component
        ├── ErrorMessage.jsx# Error notification card with retry button
        ├── RepoList.jsx    # Repository cards grid rendering stars & language
        ├── Contact.jsx     # Interactive contact form
        ├── NotFound.jsx    # 404 Catch-all route
        └── Footer.jsx      # Dynamic year & contact details
```

---

## 5. Files and Their Specific Roles

| File Name | Purpose |
| :--- | :--- |
| `src/components/Projects.jsx` | Coordinates the GitHub REST API call using `useEffect`, manages `repos`, `loading`, `error`, `searchQuery` states, and conditionally renders child components. |
| `src/components/Spinner.jsx` | Renders an animated CSS spinner during network pending state (`loading === true`). |
| `src/components/ErrorMessage.jsx` | Renders a styled alert with error message text and a "↻ Retry Request" callback button. |
| `src/components/RepoList.jsx` | Renders the grid of repository cards displaying name, description, stargazers count, language badge, and forks count. |
| `src/App.jsx` | Provides global `isDarkMode` state and sets up client routes (`/`, `/projects`, `/contact`, `*`). |
| `src/components/Header.jsx` | Header banner displaying student name (`Nisarg Dedakiya`), enrollment number (`24CS014`), and theme accents. |
| `src/components/Footer.jsx` | Displays contact links and dynamically computed copyright year via `new Date().getFullYear()`. |

---

## 6. Step-by-Step Setup & Execution Instructions

### Prerequisites:
- Ensure **Node.js** (v18.0+) and **npm** are installed:
  ```bash
  node -v
  npm -v
  ```

### Steps to Run:
1. Navigate into the `practical-03` directory:
   ```bash
   cd practical-03
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   *Open the displayed URL in your browser (typically `http://localhost:3002` or `http://localhost:5173`).*

4. Verify production compilation:
   ```bash
   npm run build
   ```

---

## 7. Expected Output & Test Cases

| Test Case | Interaction / Inspection | Expected Output |
| :--- | :--- | :--- |
| **TC-01: Component Mount Fetch** | Navigate to `/projects` | Spinner displays briefly while fetching data from `api.github.com/users/NisargDedakiya/repos`. |
| **TC-02: Successful Data Render** | Inspect API section on success | Repositories render inside responsive grid with clickable links, star counts, descriptions, and language badges. |
| **TC-03: Real-Time Search Filter** | Type in "🔍 Search repositories by name..." | List dynamically filters to show only repositories whose names match the query string. |
| **TC-04: Test Error State Simulation** | Click `⚠️ Test Error State` button | App requests an invalid endpoint; spinner displays, followed by `<ErrorMessage />` with "GitHub API Error: 404 Not Found" and a "↻ Retry Request" button. |
| **TC-05: Retry Action** | Click `↻ Retry Request` on error card | Clears error, displays spinner, and re-fetches valid student repository endpoint successfully. |
| **TC-06: Manual Refresh** | Click `🔄 Refresh` button | Re-initiates API call and updates repository list without page reload. |
| **TC-07: Dark Mode Compatibility** | Click theme toggle button in navbar | All repository cards, spinner, error banners, and search inputs seamlessly adopt dark theme palette (`#0f172a`). |

---

## 8. Important Code Explanations

### A. Lifecycle Data Fetching with `useEffect`
```jsx
// src/components/Projects.jsx
useEffect(() => {
  fetchRepos();
}, []); // Empty dependency array means: run once on component mount
```
*An empty dependency array `[]` ensures the effect executes once after the initial render, preventing an infinite fetch loop.*

### B. Three-State Asynchronous Data Fetching Logic
```jsx
const fetchRepos = (triggerError = false) => {
  setLoading(true);
  setError(null);

  const url = triggerError
    ? 'https://api.github.com/users/non_existent_user_999999_xyz/repos'
    : `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=30`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      setRepos(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      setError(err.message || 'Failed to fetch repositories.');
    })
    .finally(() => {
      setLoading(false); // Runs regardless of success or failure
    });
};
```
*`fetch()` returns a Promise. If the server responds with a non-200 status (like 404), `res.ok` is `false`, triggering our custom error throw caught by `.catch()`. The `.finally()` block ensures the loading spinner is turned off in all outcomes.*

### C. Conditional Rendering Pattern
```jsx
{loading && <Spinner />}

{!loading && error && (
  <ErrorMessage message={error} onRetry={() => fetchRepos(false)} />
)}

{!loading && !error && (
  <RepoList data={filteredRepos} />
)}
```
*Using logical `&&` short-circuiting ensures only one UI state (Loading, Error, or Data) is rendered at any given moment.*

---

## 9. Common Errors and Troubleshooting

1. **Infinite Re-render / API Rate Limit Exceeded:**
   - *Cause:* Calling `fetchRepos()` directly in the component body instead of inside `useEffect(() => { ... }, [])`.
   - *Fix:* Ensure the fetch call is placed inside `useEffect` with an empty dependency array.
2. **`TypeError: Cannot read properties of null (reading 'map')`:**
   - *Cause:* Trying to iterate over `repos` before data has resolved or when the API returned an error object rather than an array.
   - *Fix:* Check `Array.isArray(data)` before setting state, and use a default parameter `data = []`.
3. **GitHub API Rate Limit (HTTP 403 Forbidden):**
   - *Cause:* Unauthenticated GitHub REST API requests are limited to 60 requests per hour per IP.
   - *Fix:* Avoid rapid continuous refreshes or use cached data.

---

## 10. Viva Voce Questions & Answers

### Q1. What is the `useEffect` hook and why is it needed for API calls?
> **Answer:** `useEffect` allows functional components to perform side-effects. Since API fetching is an asynchronous side-effect that shouldn't block component rendering, placing it inside `useEffect` ensures the fetch executes after React renders the initial UI structure.

### Q2. What does an empty dependency array `[]` signify in `useEffect`?
> **Answer:** It indicates that the effect has no dependencies on state or props, so React will only execute the effect once when the component is initially mounted, mimicking the traditional class component `componentDidMount` lifecycle method.

### Q3. Why must we check `res.ok` when using the native `fetch()` API?
> **Answer:** Unlike Axios, native `fetch()` does not reject its Promise on HTTP error status codes (like 404 or 500); it only rejects on network failures. Checking `if (!res.ok)` allows us to detect HTTP error responses and throw an error manually.

### Q4. What is the purpose of the `.finally()` block in Promise handling?
> **Answer:** `.finally()` executes guaranteed clean-up code regardless of whether the Promise resolved successfully or was rejected with an error. In this practical, it ensures `setLoading(false)` is always called so the spinner stops spinning.

### Q5. How does client-side search filtering differ from server-side filtering?
> **Answer:** 
> - **Client-side filtering:** The entire dataset is fetched once and filtered in browser memory using JavaScript (`array.filter()`), offering instant search without extra network latency.
> - **Server-side filtering:** Every keystroke or query sends a new request with search query parameters to the backend (e.g., `?q=searchterm`), suitable for large databases.

### Q6. What are the three essential UI states of asynchronous data fetching?
> **Answer:** 
> 1. **Loading state:** Displays a spinner or skeleton to indicate work in progress.
> 2. **Error state:** Displays a clear, actionable error message with an option to retry.
> 3. **Success state:** Renders the loaded data to the user.
