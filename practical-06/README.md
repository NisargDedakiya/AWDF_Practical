# Practical 06: Full Stack Integration (React + Node + MongoDB)

**Course:** Advanced Web Development Framework (AWDF / ITUE301)  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Department of Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  

### Student Details
- **Student Name:** Nisarg Dedakiya
- **Enrollment Number:** 24CS014
- **Email:** 24cs014@charusat.edu.in
- **Phone:** +91-9978132722

---

## 1. Exact Practical Question
> **Practical 06:**  
> Wire the React frontend with the Node.js/Express/MongoDB backend into a fully integrated, production-grade full-stack web application. The application must support complete bidirectional state synchronization, optimistic UI updates with automatic rollback on server errors, real-time feedback (toast notifications and confirmation modals), comprehensive search and priority filtering, and live database metrics. The backend must enforce CORS policies and schema validations, persisting all changes directly to MongoDB.

---

## 2. Aim and Objectives
- **Primary Aim:** To integrate a responsive React 18 single-page application with a secure Express.js REST API and MongoDB database using Mongoose ODM into an end-to-end full-stack system.
- **Specific Objectives:**
  1. Establish cross-origin communication between React (port `5173`) and Express (port `5000`) using `cors`.
  2. Implement an optimistic UI update strategy: local state updates immediately for zero-latency user interaction, with automatic rollback if the API rejects the mutation.
  3. Construct a centralized API client (`frontend/src/api.js`) encapsulating `GET`, `POST`, `PUT`, and `DELETE` requests.
  4. Build modular React components (`Header`, `StatsBar`, `TaskForm`, `TaskList`, `TaskItem`, `ConfirmModal`, `Toast`, `Spinner`, `ErrorMessage`).
  5. Provide non-destructive task deletion protected by a confirmation modal displaying the target task title.
  6. Deliver real-time status feedback through animated slide-in toast notifications and a live metrics bar tracking completion percentage.
  7. Validate full-stack state persistence by fetching fresh data from MongoDB across page reloads.

---

## 3. Technologies Used
- **Frontend Framework:** React 18 (`v18.3.1`)
- **Frontend Build Tool:** Vite (`v5.4.11`)
- **Backend Runtime:** Node.js (v18.0.0+)
- **Backend Framework:** Express.js (`v4.21.2`)
- **Object Data Modeling (ODM):** Mongoose (`v8.9.5`)
- **Database:** MongoDB Server (Community Edition / Atlas)
- **Cross-Origin Sharing:** `cors` (`v2.8.5`)
- **Environment Management:** `dotenv` (`v16.4.7`)
- **Styling:** Modern Vanilla CSS3 with Glassmorphism, CSS Custom Properties, and responsive Grid/Flexbox layouts

---

## 4. Architecture & Data Flow

```text
React Frontend (localhost:5173)
       │
       ▼ [fetch / REST API calls with JSON & CORS]
Express Backend Server (localhost:5000)
       │
       ▼ [Mongoose ODM (models/Task.js)]
MongoDB Database (localhost:27017 / awdf_practical6)
```

### Full-Stack Lifecycle Pipeline
1. **User Action:** The user creates, modifies, toggles completion, or deletes a task in the React UI.
2. **Optimistic Mutation:** The frontend generates a temporary ID (`temp-<timestamp>`), applies the change to local React state immediately, and flags the item as syncing.
3. **API Dispatch:** `src/api.js` dispatches an asynchronous HTTP request (`POST`, `PUT`, or `DELETE`) to the Express backend.
4. **Backend Validation & Persistence:** Express validates headers (`Content-Type: application/json`) and body parameters before Mongoose persists the document to MongoDB.
5. **Confirmation & Reconciliation:** The server responds with the finalized MongoDB document (including the genuine `_id` and timestamp). The frontend swaps the temporary ID for the MongoDB `_id` and displays a toast notification.
6. **Error Rollback:** If the backend rejects the request or the database is unreachable, the frontend intercepts the error, rolls back local state to its previous snapshot, and displays an alert toast.

---

## 5. Project Folder Structure

```text
practical-06/
├── .gitignore              # Ignores node_modules, .env, dist, and logs
├── backend/
│   ├── .env                # Port (5000) and MongoDB connection string
│   ├── .env.example        # Environment variable template
│   ├── models/
│   │   └── Task.js         # Mongoose schema with validations and pre-save trim hook
│   ├── package.json        # Backend dependencies (express, mongoose, cors, dotenv)
│   ├── server.js           # Express REST API, CORS configuration, and CRUD routes
│   └── test-api.js         # Automated backend test suite (5 test cases)
├── frontend/
│   ├── index.html          # HTML5 entry with Google Fonts (Plus Jakarta Sans, JetBrains Mono)
│   ├── package.json        # Frontend dependencies (react, react-dom, vite)
│   ├── vite.config.js      # Vite configuration targeting port 5173
│   └── src/
│       ├── api.js          # Centralized API service for backend communication
│       ├── App.jsx         # Master controller with state management & optimistic UI
│       ├── App.css         # Glassmorphic responsive dark theme
│       ├── index.css       # Global design tokens and reset
│       ├── main.jsx        # React DOM entry point
│       └── components/
│           ├── Header.jsx       # Header with student details & tech pills
│           ├── StatsBar.jsx     # Live metrics, progress bar & sync button
│           ├── TaskForm.jsx     # Task creation card with validation
│           ├── TaskList.jsx     # Search and filterable task list container
│           ├── TaskItem.jsx     # Task card with toggle, inline edit & delete
│           ├── ConfirmModal.jsx # Confirmation dialog before deleting
│           ├── Toast.jsx        # Slide-in success/error toast notifications
│           ├── Spinner.jsx      # Loading animation component
│           └── ErrorMessage.jsx # Error card with retry trigger
└── README.md
```

---

## 6. Explanation of Important Files

### Backend Files
- **`backend/server.js`:** Express server configured with `cors()`, `express.json()`, global logging, content-type verification, MongoDB connectivity, and REST routes (`/tasks`).
- **`backend/models/Task.js`:** Schema enforcing required title, max length 100, priority enum (`low`, `medium`, `high`), default values, and `pre('save')` whitespace trim hook.
- **`backend/test-api.js`:** Automated integration test suite validating Health Check, POST, GET, PUT, and DELETE operations.

### Frontend Files
- **`frontend/src/api.js`:** Centralized client encapsulating all REST API calls with error extraction from backend JSON payloads.
- **`frontend/src/App.jsx`:** Master application state coordinator managing optimistic mutations, error rollbacks, health checking, and toast notifications.
- **`frontend/src/components/Header.jsx`:** Displays application identity, student details (**Nisarg Dedakiya - 24CS014**), and framework badges.
- **`frontend/src/components/StatsBar.jsx`:** Computes total, completed, pending counts, and completion percentage in real time.
- **`frontend/src/components/TaskForm.jsx`:** Controlled form validating title length (max 100) and preventing empty task submissions.
- **`frontend/src/components/TaskItem.jsx`:** Task card supporting checkbox completion toggle, inline editing, and deletion requests.
- **`frontend/src/components/ConfirmModal.jsx`:** Modal dialog requiring explicit confirmation before permanent database deletion.
- **`frontend/src/components/Toast.jsx`:** Self-dismissing toast notification container.

---

## 7. Prerequisites and Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017`

### Step 1: Install Backend Dependencies
```bash
cd practical-06/backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 8. Step-by-Step Execution Instructions

### Running the Complete Full-Stack Application

#### Terminal 1 — Start the Express Backend Server:
```bash
cd practical-06/backend
npm start
```
*The backend starts at `http://localhost:5000` and automatically connects to MongoDB `awdf_practical6`.*

#### Terminal 2 — Start the React Frontend Dev Server:
```bash
cd practical-06/frontend
npm run dev
```
*The frontend launches at `http://localhost:5173` with full Hot Module Replacement (HMR).*

---

## 9. Test Cases and Actual Test Results

### Backend Automated Test Suite (`npm test` in `practical-06/backend`):

| Test # | Test Case Description | Target Endpoint | HTTP Method | Expected Status | Actual Status | Result |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Backend Health Check & Student Identity | `/` | `GET` | `200` | `200` | **PASS** |
| 2 | Create New Task Document | `/tasks` | `POST` | `201` | `201` | **PASS** |
| 3 | Fetch All Tasks from MongoDB | `/tasks` | `GET` | `200` | `200` | **PASS** |
| 4 | Update Task Status to Completed | `/tasks/:id` | `PUT` | `200` | `200` | **PASS** |
| 5 | Delete Task Document from MongoDB | `/tasks/:id` | `DELETE` | `200` | `200` | **PASS** |

### Frontend Build Verification (`npm run build` in `practical-06/frontend`):
```text
vite v5.4.21 building for production...
transforming...
✓ 42 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.08 kB │ gzip:  0.62 kB
dist/assets/index-BA_UWf82.css   17.56 kB │ gzip:  4.24 kB
dist/assets/index-BGafzgi-.js   163.03 kB │ gzip: 51.39 kB
✓ built in 1.18s
```
**Result: 100% Clean Production Build with 0 Errors.**

---

## 10. Supplementary Features Implemented

1. **Optimistic UI Updates:** New tasks and completion toggles appear instantly with a subtle `Syncing...` badge, eliminating perceived network latency.
2. **State Rollback on Failure:** If the backend rejects a mutation (e.g. database disconnect), the previous state is restored and an error toast is displayed.
3. **Confirmation Dialog Modal:** Task deletion requires two-step confirmation, displaying the exact task name to prevent accidental data loss.
4. **Live Metrics Bar:** Real-time counters calculate total, completed, pending tasks, and completion percentage dynamically.
5. **Instant Client-Side Filtering:** Tasks can be searched by title/description and filtered by status (`All`, `Active`, `Done`) and priority (`High`, `Medium`, `Low`).

---

## 11. Viva Questions and Answers

### Q1: What changes are required on the backend (CORS) to allow the React dev server to communicate with the Express API?
**Answer:** Browsers enforce the Same-Origin Policy (SOP), which blocks web pages on `http://localhost:5173` from making XMLHttpRequest/fetch requests to `http://localhost:5000`. By installing and registering `cors()` middleware on Express (`app.use(cors())`), the server sends the HTTP header `Access-Control-Allow-Origin: *`, permitting cross-origin requests from the React development server.

### Q2: Why should the UI update state using the backend response after a successful POST/PUT rather than assuming success silently?
**Answer:** The database generates critical metadata during write operations, including immutable `_id` values, default values, and timestamps (`createdAt`). If the frontend assumes success without reconciling with the backend response, child components will lack the true database `_id` needed for subsequent `PUT` or `DELETE` requests.

### Q3: What is the risk of not handling errors on write operations (POST/PUT/DELETE) the same way as read operations (GET)?
**Answer:** If write errors are ignored, the UI may deceptively show a task as created or completed, creating a false perception of success. Upon page reload, the user will find the changes gone, resulting in data inconsistency, silent data loss, and user frustration.

### Q4: What is an "Optimistic UI Update", and how does rollback work?
**Answer:** An optimistic UI update applies state changes to the user interface immediately before the server responds, providing zero perceived latency. The original state snapshot is saved in memory; if the network call fails, the application catches the exception, restores the saved snapshot, and notifies the user with an error toast.

### Q5: How does the application maintain state synchronization across browser refreshes?
**Answer:** When the React application mounts, `useEffect` triggers `fetchTasks()`, which issues a `GET /tasks` request to the Express API. The server executes `Task.find().sort({ createdAt: -1 })` against MongoDB, populating React state with the exact, persistent database record.
