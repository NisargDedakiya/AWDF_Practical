# Practical 04: Building a RESTful API with Node.js and Express

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
> **Practical 04:**  
> Design and implement a RESTful backend server with complete CRUD endpoints for a Task Management system using Node.js, Express, and an Express middleware pipeline. The implementation must include built-in, third-party, and custom route-level middlewares, global request logging, content-type and route parameter validation, custom 404 handler for unhandled routes, and centralized error handling with HTTP 500 responses.

---

## 2. Aim and Objectives
- **Primary Aim:** To build an asynchronous, modular RESTful API server for a Task Management application using Express.js on Node.js.
- **Specific Objectives:**
  1. Set up an Express.js application with built-in (`express.json()`) and third-party (`cors`) middleware.
  2. Implement custom global middleware for request logging (HTTP Method, URL, and ISO timestamp).
  3. Create route-specific validator middlewares (`validateContentType` and `validateTaskId`) for input sanitization and defensive programming.
  4. Implement full CRUD operations (`GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`) with standard HTTP response status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
  5. Implement custom 404 route handling for undefined endpoints and a 4-parameter centralized global error handler `(err, req, res, next)` returning HTTP 500.
  6. Verify endpoint behavior and middleware execution using an automated test script (`test-api.js`).

---

## 3. Technologies Used
- **Runtime Environment:** Node.js (v18.0.0+)
- **Backend Framework:** Express.js (`v4.21.2`)
- **Cross-Origin Resource Sharing:** CORS (`v2.8.5`)
- **Data Format:** JSON (JavaScript Object Notation)
- **Protocol:** HTTP/1.1 RESTful Architecture
- **Package Manager:** npm

---

## 4. Architecture & Middleware Pipeline

Every incoming HTTP request flows sequentially through the Express middleware pipeline:

```
                  Client Request (Postman / Browser / test-api.js)
                                         │
                                         ▼
                            [1. CORS Middleware (cors)]
                                         │
                                         ▼
                        [2. Body Parser (express.json())]
                                         │
                                         ▼
                   [3. Global Request Logger (Method, URL, Time)]
                                         │
                                         ▼
                   Express Router & Route-Specific Middlewares
              ┌──────────────────────────┴──────────────────────────┐
              ▼                                                     ▼
     [validateContentType]                                  [validateTaskId]
(Rejects POST/PUT without app/json)                     (Validates positive integer :id)
              │                                                     │
              ├───────────────► POST   /tasks                       ├───────────────► GET    /tasks/:id
              │                                                     ├───────────────► PUT    /tasks/:id
              └───────────────► PUT    /tasks/:id                   └───────────────► DELETE /tasks/:id
                                         │
                        GET  /tasks      │ (Direct routes)
                        GET  /           │
                        GET  /test-error │ (Deliberate test error)
                                         │
                                         ▼
                     [4. Undefined Route Handler (404 Not Found)]
                                         │
                                         ▼ (via next(err))
                     [5. Centralized Error Handler (500 Internal Server Error)]
                                         │
                                         ▼
                                   JSON Response
```

---

## 5. Project Folder Structure

```
practical-04/
├── .gitignore          # Ignores node_modules, logs, and environment files
├── package.json        # Dependencies (express, cors) and npm scripts
├── server.js           # Core Express REST API, middlewares, CRUD routes, and error handler
├── test-api.js         # Automated 11-step testing suite verifying all endpoints & status codes
└── README.md           # Complete college documentation and viva preparation guide
```

---

## 6. Explanation of Important Files

### `server.js`
The main server file containing:
- Express initialization and port binding (`PORT = process.env.PORT || 5000`).
- **Middlewares:**
  - `cors()`: Enables cross-origin requests from frontend apps.
  - `express.json()`: Parses incoming JSON request payloads into `req.body`.
  - Global Logger: Prints `[timestamp] METHOD URL` to the console.
  - `validateContentType`: Rejects `POST` and `PUT` requests if header lacks `application/json`.
  - `validateTaskId`: Parses `:id` route parameter, ensures positive integer, attaches `req.taskId`.
- **In-Memory Store:** Array `tasks` initialized with practical tasks, auto-incrementing `nextId`.
- **CRUD Routes:**
  - `GET /`: API welcome and student metadata (Nisarg Dedakiya, 24CS014).
  - `GET /tasks`: Returns list of all tasks.
  - `GET /tasks/:id`: Returns single task by ID or 404 if not found.
  - `POST /tasks`: Validates `title`, pushes new task, returns HTTP 201 Created.
  - `PUT /tasks/:id`: Updates fields (`title`, `description`, `completed`), returns HTTP 200.
  - `DELETE /tasks/:id`: Removes task by ID, returns HTTP 200 with deleted task payload.
  - `GET /test-error`: Intentionally triggers `next(err)` to verify the global error handler.
- **Error Handlers:**
  - 404 Catch-All: Catches undefined paths and returns structured JSON.
  - 4-argument Global Error Middleware `(err, req, res, next)`: Catches runtime exceptions and returns HTTP 500.

### `test-api.js`
An automated regression testing script that:
- Detects if `server.js` is already running on port 5000, or starts an in-process instance automatically.
- Tests all 11 endpoints and status codes (200, 201, 400, 404, 500).
- Verifies student identity returned in metadata.
- Gracefully cleans up and logs results with color-coded status output.

---

## 7. Prerequisites and Installation Instructions

### Prerequisites
- Node.js (version 18.0.0 or higher)
- npm (version 9.0.0 or higher)

### Installation
Open your terminal and navigate to `practical-04`:
```bash
cd practical-04
npm install
```

---

## 8. Step-by-Step Execution Instructions

### Option 1: Start the Server
```bash
npm start
```
The server will start on `http://localhost:5000`. You will see:
```text
===============================================
Task Manager API running at http://localhost:5000
Student: Nisarg Dedakiya (24CS014) | Practical 4
Course: ITUE301 - AWDF | CHARUSAT
===============================================
```

### Option 2: Development Mode (with file watcher)
```bash
npm run dev
```

### Option 3: Run the Automated Test Suite
```bash
npm test
```
*(Runs all 11 test cases automatically and displays pass/fail results).*

---

## 9. API Endpoints Specification

| Method | Endpoint | Description | Request Body | Success Status | Error Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | API Information & Student Details | *None* | `200 OK` | — |
| `GET` | `/tasks` | Retrieve all tasks | *None* | `200 OK` | — |
| `GET` | `/tasks/:id` | Retrieve single task by ID | *None* | `200 OK` | `400 / 404` |
| `POST` | `/tasks` | Create a new task | `{ title, description?, completed? }` | `201 Created` | `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update an existing task | `{ title?, description?, completed? }` | `200 OK` | `400 / 404` |
| `DELETE` | `/tasks/:id` | Delete a task by ID | *None* | `200 OK` | `400 / 404` |
| `GET` | `/test-error` | Deliberately trigger global error | *None* | — | `500 Internal Error` |
| `*` | `/*` (Any invalid route) | Catch-all for undefined endpoints | *Any* | — | `404 Not Found` |

---

## 10. Test Cases and Actual Test Results

Executed with `npm test`:

| Test # | Test Case Description | Target Endpoint | HTTP Method | Expected Status | Actual Status | Result |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Welcome Endpoint & Student Metadata | `/` | `GET` | `200` | `200` | **PASS** |
| 2 | Read All Tasks | `/tasks` | `GET` | `200` | `200` | **PASS** |
| 3 | Create New Task | `/tasks` | `POST` | `201` | `201` | **PASS** |
| 4 | Read Single Task by ID | `/tasks/:id` | `GET` | `200` | `200` | **PASS** |
| 5 | Update Existing Task | `/tasks/:id` | `PUT` | `200` | `200` | **PASS** |
| 6 | Delete Task by ID | `/tasks/:id` | `DELETE` | `200` | `200` | **PASS** |
| 7 | Retrieve Deleted Task (Verify 404) | `/tasks/:id` | `GET` | `404` | `404` | **PASS** |
| 8 | Validate Missing `Content-Type` Header | `/tasks` | `POST` | `400` | `400` | **PASS** |
| 9 | Validate Invalid Non-Integer ID format | `/tasks/abc` | `GET` | `400` | `400` | **PASS** |
| 10 | Catch-All for Undefined Route | `/undefined-route` | `GET` | `404` | `404` | **PASS** |
| 11 | Trigger Deliberate Unhandled Exception | `/test-error` | `GET` | `500` | `500` | **PASS** |

**Summary: 11 / 11 API Tests Passed (100% Success Rate).**

---

## 11. Explanation of Main Code and Logic

### 1. The Middleware Chain Pattern
In Express, request processing is structured as a pipeline of functions:
```javascript
const myMiddleware = (req, res, next) => {
  // Process or inspect request
  next(); // Pass control to next handler in pipeline
};
```
If a condition fails (e.g. invalid content type or malformed ID), the middleware terminates the pipeline early with `return res.status(400).json(...)`, preventing invalid data from reaching controllers.

### 2. Route Parameter Sanitization (`validateTaskId`)
```javascript
const validateTaskId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Task ID format. ID must be a positive integer.'
    });
  }
  req.taskId = id; // Attach parsed integer to request object
  next();
};
```
This guarantees that route handlers only process validated, clean integer IDs.

### 3. Centralized 4-Parameter Error Handling
Express identifies error-handling middleware specifically by having **four arguments**: `(err, req, res, next)`.
```javascript
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error: Something went wrong.',
    message: err.message
  });
});
```
When any route invokes `next(err)`, Express skips all remaining standard routes and directly executes this handler, guaranteeing that server crashes and uncaught exceptions return a clean JSON response rather than dropping the HTTP connection.

---

## 12. Common Errors and Troubleshooting

1. **Port 5000 Already in Use (`EADDRINUSE`)**:
   - Cause: Another application or zombie Node process is occupying port 5000.
   - Solution: Set an alternative port via environment variable:
     ```bash
     PORT=5001 npm start
     ```
2. **Missing `Content-Type: application/json` on POST/PUT**:
   - Error: `400 Bad Request: Invalid Content-Type. Header must be 'application/json'.`
   - Solution: Always include `Content-Type: application/json` in your request headers when using Postman or `fetch()`.
3. **`req.body` is `undefined`**:
   - Cause: Missing `express.json()` middleware before route declarations.
   - Solution: Ensure `app.use(express.json())` is placed at the top of the middleware stack.

---

## 13. Viva Questions and Answers

### Q1: What is Express.js, and why is it termed a "middleware-driven" framework?
**Answer:** Express.js is a minimal, fast, and flexible Node.js web application framework. It is termed "middleware-driven" because every request-response cycle is handled by a sequence of middleware functions that execute sequentially, each possessing access to the request (`req`), response (`res`), and the `next` function to either transform data or terminate the request.

### Q2: What is the purpose of `next()` in an Express middleware?
**Answer:** `next()` is a callback function passed by Express to middleware handlers. Invoking `next()` passes control to the subsequent middleware in the pipeline. If `next()` is omitted and no response (`res.send()` / `res.json()`) is dispatched, the client request remains hanging until it times out.

### Q3: How does Express distinguish a standard middleware from an error-handling middleware?
**Answer:** Express inspects the function's arity (`fn.length`). Standard middleware functions declare 2 or 3 parameters `(req, res, next)`, whereas error-handling middleware explicitly declares **4 parameters**: `(err, req, res, next)`.

### Q4: What is the difference between `PUT` and `PATCH` HTTP methods in a RESTful API?
**Answer:** `PUT` replaces the entire existing resource representation with the payload provided by the client (idempotent full update). `PATCH` applies partial modifications to the resource, changing only the attributes specified in the payload.

### Q5: Why is `express.json()` required, and where should it be positioned?
**Answer:** Built-in since Express 4.16, `express.json()` reads the raw incoming request stream, parses valid JSON payloads, and populates `req.body`. It must be placed before any route handlers that expect request body data so that parsed data is available when the route executes.
