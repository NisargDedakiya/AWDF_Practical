# Practical 08: Performance Optimization and Lazy Loading in React

**Course:** Advanced Web Development Frameworks (AWDF / ITUE301)  
**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  

---

## 1. Objective
To improve frontend performance and initial page load speed using route-based code splitting, `React.lazy()`, dynamic chunk imports, and `<Suspense>` fallback UI.

---

## 2. Architecture: Single Bundle vs Code-Split Chunks

### Before (Single Monolithic Bundle)
In a traditional single-page application without code splitting, all application routes and assets are compiled into one monolithic bundle. The browser is forced to download, parse, and execute every route upfront, even if the user never navigates beyond the home page.
```text
index.html ──► main.bundle.js (All routes: Home, Projects, Contact, Analytics loaded upfront)
```
- **Disadvantages:** Large initial transfer size, high Time to Interactive (TTI), slow First Contentful Paint (FCP), and excessive main-thread execution on mobile devices.

### After (Code Splitting with React.lazy & Suspense)
With route-based code splitting, the application is divided into an entry bundle containing core layout, navigation, and landing page code, plus on-demand dynamic chunks for remaining routes:
```text
Initial Visit (/):
index.html ──► index.js (Core layout, Home & React runtime only)

Route Navigation (On-Demand):
Visit /projects  ──► Projects-[hash].js (Loaded dynamically via HTTP)
Visit /contact   ──► Contact-[hash].js (Loaded dynamically via HTTP)
Visit /analytics ──► Analytics-[hash].js (Loaded dynamically via HTTP)
```
- **Advantages:** Substantially smaller initial payload, instant first render, faster Time to Interactive, and on-demand network chunk retrieval.

---

## 3. Bundle Measurement & Production Build Analysis

### Actual Vite Production Build Output (`npm run build`)
Running `vite build` transforms the modular React components into optimized, hashed asset bundles:

```bash
$ vite build
vite v5.4.21 building for production...
transforming...
✓ 46 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                      0.46 kB │ gzip:  0.31 kB
dist/assets/index-Dlbjtibn.css       8.84 kB │ gzip:  2.31 kB
dist/assets/Projects-ohAfpr1U.js     2.38 kB │ gzip:  1.25 kB
dist/assets/Contact-DEvyh3L9.js      3.32 kB │ gzip:  1.26 kB
dist/assets/Analytics-YaPIjMje.js    7.83 kB │ gzip:  2.50 kB
dist/assets/index-BnrFsPeq.js      172.60 kB │ gzip: 56.60 kB
✓ built in 1.45s
```

### Detailed Bundle Breakdown Table
| File | Bundle Category | Size (Raw) | Gzip Size | When Downloaded & Executed |
|:---|:---|:---|:---|:---|
| `dist/index.html` | HTML Entry Point | 0.46 kB | 0.31 kB | Initial page request |
| `dist/assets/index-Dlbjtibn.css` | Compiled Global CSS | 8.84 kB | 2.31 kB | Initial page request |
| `dist/assets/index-BnrFsPeq.js` | Core Application Bundle | 172.60 kB | 56.60 kB | Initial page request (Home, Navbar, Header, Footer) |
| `dist/assets/Projects-ohAfpr1U.js` | Dynamic Lazy Chunk | 2.38 kB | 1.25 kB | On-demand upon navigating to `/projects` |
| `dist/assets/Contact-DEvyh3L9.js` | Dynamic Lazy Chunk | 3.32 kB | 1.26 kB | On-demand upon navigating to `/contact` |
| `dist/assets/Analytics-YaPIjMje.js` | Dynamic Lazy Chunk | 7.83 kB | 2.50 kB | On-demand upon navigating to `/analytics` |

---

## 4. Implementation Details

In [src/App.jsx](file:///c:/Users/nisar/OneDrive/Desktop/AWDF_Practical/practical-08/src/App.jsx):

```jsx
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. Dynamic route imports using React.lazy()
const Projects = lazy(() => import('./components/Projects'));
const Contact = lazy(() => import('./components/Contact'));
const Analytics = lazy(() => import('./components/Analytics'));

// 2. Meaningful fallback UI displayed while dynamic chunk is loading
function LoadingFallback() {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="simple-loader"></div>
      <p className="loading-title">Loading Route Chunk...</p>
      <span className="loading-subtitle">
        React.lazy() is fetching the dynamic JavaScript bundle via HTTP
      </span>
    </div>
  );
}

// 3. Wrap routes inside Suspense
export default function App() {
  // ... state and theme logic
  return (
    <div className="app-container">
      <Header ... />
      <NavBar ... />
      <main className="main-content">
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
      <Footer ... />
    </div>
  );
}
```

---

## 5. Answers to Key Lab Questions

### Q1: What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?
- **Initial Bundle (`index-[hash].js`):** Downloaded, parsed, and executed immediately when the client requests the web application. It contains only the minimum required assets to render the root shell, top navigation, and default landing page (`/`).
- **Lazy-Loaded Chunks (`Projects.js`, `Contact.js`, `Analytics.js`):** Downloaded over the network on demand only when the user explicitly triggers route navigation. If a visitor never navigates to `/analytics`, the analytics bundle chunk is never transferred over the wire.

### Q2: Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?
Browsers parse and compile JavaScript on a single thread.
1. **Critical Path Reduction:** By splitting code, the initial JavaScript payload is much smaller, allowing the browser to parse and paint the page sooner.
2. **Superior Core Web Vitals:** First Contentful Paint (FCP) and Time to Interactive (TTI) drop significantly.
3. **Bandwidth Economy:** Users rarely visit every page in a web application during a single session; lazy loading avoids transferring unused code entirely.

### Q3: In what situations would lazy loading not be worth the added complexity?
- **Micro / Lightweight Applications:** If the entire uncompressed application is under ~50–100 kB, splitting it introduces HTTP request overhead and unnecessary spinner flickers.
- **Above-the-Fold Critical Content:** Elements and components visible immediately on the viewport should never be lazy loaded.
- **Micro-Components:** Splitting individual buttons or icons causes network request waterfalls, hurting performance instead of helping it.

---

## 6. Project Folder Structure

```text
practical-08/
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── dist/                          # Production build output with code-split chunks
│   ├── index.html
│   └── assets/
│       ├── index-Dlbjtibn.css
│       ├── index-BnrFsPeq.js      # Core entry bundle
│       ├── Projects-ohAfpr1U.js   # Lazy chunk 1
│       ├── Contact-DEvyh3L9.js    # Lazy chunk 2
│       └── Analytics-YaPIjMje.js  # Lazy chunk 3
├── src/
│   ├── App.css                    # Responsive stylesheet supporting light & dark mode
│   ├── App.jsx                    # Root component with React.lazy() & Suspense
│   ├── index.css                  # Global resets
│   ├── main.jsx                   # Vite entry point with BrowserRouter
│   └── components/
│       ├── About.jsx              # Eagerly loaded profile summary
│       ├── Analytics.jsx          # Lazy loaded performance & bundle visualizer
│       ├── Contact.jsx            # Lazy loaded controlled form with live preview
│       ├── Footer.jsx             # Footer with student credits
│       ├── Header.jsx             # Portfolio header with student info
│       ├── Home.jsx               # Eagerly loaded home view
│       ├── NavBar.jsx             # Navigation bar with dark mode toggle
│       ├── NotFound.jsx           # 404 fallback page
│       ├── Projects.jsx           # Lazy loaded featured projects list
│       └── Skills.jsx             # Categorized technical skills
└── README.md
```

---

## 7. Step-by-Step Execution Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm (Node Package Manager)

### Commands
1. Navigate to the `practical-08` directory:
   ```bash
   cd c:\Users\nisar\OneDrive\Desktop\AWDF_Practical\practical-08
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build production bundle to verify code splitting:
   ```bash
   npm run build
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:5174/
   ```

---

## 8. How to Observe Lazy Loading in Chrome DevTools

1. Open `http://localhost:5174/` in Google Chrome or Microsoft Edge.
2. Press **F12** (or `Ctrl+Shift+I`) to open Developer Tools.
3. Switch to the **Network** tab.
4. Set the network throttling dropdown from *No throttling* to **Fast 3G** or **Slow 3G**.
5. Filter by **JS**.
6. Notice that only `main.jsx`, `App.jsx`, `Home.jsx`, and runtime assets are loaded initially.
7. Click **Projects (Lazy)** in the navigation bar.
8. Watch the `<LoadingFallback />` spinner appear on screen while `Projects.jsx` is fetched over the network.
9. Click **Analytics & Metrics (Lazy)** to observe the `Analytics.jsx` chunk fetch and render its dashboard.

---

## 9. Common Errors and Troubleshooting

| Issue / Error | Cause | Resolution |
|:---|:---|:---|
| `Uncaught Error: A component suspended while rendering, but no fallback UI was specified` | Using `React.lazy()` without wrapping the component tree inside `<Suspense fallback={...}>`. | Ensure the `<Routes>` block is enclosed in `<Suspense fallback={<LoadingFallback />}>`. |
| Chunk failed to load (`ChunkLoadError` / 404 on deployment) | User has cached an older `index.html` after a new deployment with updated chunk hashes. | Implement service worker cache busting or handle dynamic import errors with an error boundary. |
| Flash of loading spinner on fast networks | Fast connections resolve chunks in under 50ms, causing a perceptible flicker. | Acceptable in typical SPAs; can use transition libraries (`useTransition`) in React 18 for delayed fallback render. |
| Lazy component not exporting default | `React.lazy()` requires dynamic imports to resolve a module with a default export (`export default Component`). | Ensure lazy components use `export default Component` rather than named exports only. |

---

## 10. Viva Questions and Answers

### Q1: What is Code Splitting and why is it important in modern web development?
**Answer:** Code splitting is a technique supported by bundlers (like Vite, Webpack, and Rollup) that splits a single large JavaScript bundle into multiple smaller chunks. These chunks can then be loaded on demand or in parallel, reducing the initial load time and improving Core Web Vitals (FCP, LCP, TTI).

### Q2: How does `React.lazy()` work under the hood?
**Answer:** `React.lazy()` takes a function that calls a dynamic `import()` statement, returning a Promise that resolves to a module with a default export. Until the promise resolves, React suspends rendering and looks up the component tree for the nearest `<Suspense>` boundary to show the fallback UI.

### Q3: What is the role of the `<Suspense>` component?
**Answer:** `<Suspense>` acts as a boundary that catches suspended promises emitted by children components (such as lazy-loaded components or asynchronous data resources) and coordinates rendering a designated fallback UI (e.g., a skeleton screen or spinner) until the asset finishes downloading.

### Q4: Can we lazy-load regular components, or is it only for routes?
**Answer:** `React.lazy()` can be used on any React component, not just route-level components. For example, a heavy rich-text editor, chart library, or rarely-opened modal can be lazy-loaded only when triggered by user interaction (e.g., clicking an "Open Modal" button).

### Q5: How do bundlers like Vite determine what to split into separate files?
**Answer:** Bundlers detect dynamic `import()` syntax (`import('./component')`). Whenever this syntax is encountered, the build tool's AST parser flags that import path as an asynchronous entry point and outputs a dedicated chunk file (`[name]-[hash].js`) during bundling.

---

## 11. Student Declaration
I hereby confirm that Practical 08 has been implemented, code-split into distinct chunks, verified via automated build inspection, tested in the browser, and fully documented under my own student credentials:

**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Date of Completion:** October 19, 2026  
