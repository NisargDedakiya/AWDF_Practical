# Practical 07: Authentication and Middleware Pipeline

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
> **Practical 07:**  
> Implement a secure authentication and authorization system using JSON Web Tokens (JWT) and password hashing with `bcryptjs`. Build an Express middleware pipeline that enforces input validation, extracts and verifies bearer tokens, protects backend task routes, scopes task data to individual authenticated users, and handles token expiration and unauthorized requests gracefully on both the backend and React frontend.

---

## 2. Aim and Objectives
- **Primary Aim:** To secure an Express.js backend and React frontend with cryptographic password hashing, JWT stateless authentication, request validation middleware, and user-scoped resource management.
- **Specific Objectives:**
  1. Hash passwords during user registration using `bcryptjs` with a salt round cost factor of 10.
  2. Implement a login endpoint comparing password hashes and issuing signed JSON Web Tokens (`jwt.sign`) with a 1-hour expiration.
  3. Create an authentication middleware (`middleware/auth.js`) parsing `Authorization: Bearer <token>` headers, verifying signatures with `JWT_SECRET`, and rejecting unauthorized requests with `401 Unauthorized`.
  4. Create an input validation middleware pipeline (`middleware/validate.js`) checking for non-empty names, valid email formats, and minimum 6-character passwords.
  5. Scope task documents in MongoDB by associating each task with the authenticated user's `ObjectId` (`user: req.user.id`).
  6. Implement a protected `/me` endpoint returning currently authenticated user details.
  7. Implement client-side token management (`localStorage`), injection into outgoing API requests, and automatic redirection upon session expiration (`401`).
  8. Validate security rules and CRUD operations via an automated test script (`test-api.js`).

---

## 3. Technologies Used
- **Frontend Framework:** React 18 (`v18.3.1`)
- **Frontend Build Tool:** Vite (`v5.4.11`)
- **Backend Runtime:** Node.js (v18.0.0+)
- **Backend Framework:** Express.js (`v4.21.2`)
- **Database Engine:** MongoDB Server (`mongodb://127.0.0.1:27017/awdf_practical7`)
- **Object Data Modeling (ODM):** Mongoose (`v8.9.5`)
- **Password Hashing:** `bcryptjs` (`v2.4.3`)
- **Token Signing & Verification:** `jsonwebtoken` (`v9.0.2`)
- **Cross-Origin Sharing:** `cors` (`v2.8.5`)
- **Environment Management:** `dotenv` (`v16.4.7`)

---

## 4. Architecture & Authentication Flow

```text
Registration & Login Flow:
Client Request (POST /register) ──► Validate Input ──► Hash Password (bcrypt) ──► Save User ──► Sign JWT ──► 201 Created + Token
Client Request (POST /login)    ──► Validate Input ──► Compare Hash (bcrypt)   ──► Sign JWT   ──► 200 OK + Token

Protected Task Pipeline:
Client Request (Authorization: Bearer <token>)
       │
       ▼
[Request Logger Middleware]
       │
       ▼
[Auth Middleware (middleware/auth.js)]
 ├── Checks header presence & "Bearer <token>" format
 ├── Verifies signature using JWT_SECRET
 └── Injects payload into req.user = { id, email, name }
       │ (Rejects invalid/expired token with 401 Unauthorized)
       ▼
[Input Validation Middleware (middleware/validate.js)]
 └── Enforces non-empty title, priority enum ['low', 'medium', 'high']
       │ (Rejects malformed body with 400 Bad Request)
       ▼
Route Controller (Scoped by req.user.id)
 ├── GET /tasks       → Task.find({ user: req.user.id })
 ├── POST /tasks      → Task.create({ ..., user: req.user.id })
 ├── PUT /tasks/:id   → Task.findOneAndUpdate({ _id: id, user: req.user.id })
 └── DELETE /tasks/:id→ Task.findOneAndDelete({ _id: id, user: req.user.id })
```

---

## 5. Project Folder Structure

```text
practical-07/
├── .gitignore              # Ignores node_modules, .env, dist, and log files
├── backend/
│   ├── .env                # Port (5000), MongoDB URI & JWT_SECRET
│   ├── .env.example        # Environment variable template
│   ├── middleware/
│   │   ├── auth.js         # JWT extraction, signature validation & 401 handling
│   │   └── validate.js     # Server-side validation for registration, login & tasks
│   ├── models/
│   │   ├── User.js         # User schema with unique email & hashed password
│   │   └── Task.js         # Task schema with user reference ObjectId
│   ├── package.json        # Express, Mongoose, bcryptjs, jsonwebtoken, cors
│   ├── server.js           # Server routes for /register, /login, /me, /tasks
│   └── test-api.js         # Automated 10-step test script for auth & CRUD
├── frontend/
│   ├── index.html          # HTML entry
│   ├── package.json        # React 18, Vite dependencies
│   ├── vite.config.js      # Vite dev server configuration (port 5173)
│   └── src/
│       ├── api.js          # Centralized API client with JWT header injection & 401 event dispatch
│       ├── App.jsx         # Auth-aware root component with state switches
│       ├── App.css         # Styling for login, register & protected dashboard
│       ├── index.css       # Global reset styles
│       ├── main.jsx        # React DOM render entry
│       └── components/
│           ├── Login.jsx    # Email & password login form
│           ├── Register.jsx # New user registration form
│           └── TaskList.jsx # Protected task management UI with user-scoped CRUD & logout
└── README.md
```

---

## 6. Explanation of Important Files

### Backend Components
- **`backend/models/User.js`:** Schema storing `name`, unique lowercase `email`, and bcrypt hashed `password` (min 6 characters).
- **`backend/models/Task.js`:** Schema including a required `user` field of type `mongoose.Schema.Types.ObjectId` referencing `User`, enforcing data isolation.
- **`backend/middleware/auth.js`:** Intercepts incoming requests, verifies the Bearer token with `jwt.verify()`, handles `TokenExpiredError`, and attaches `req.user`.
- **`backend/middleware/validate.js`:** Validates request bodies for registration (name, regex email, password length), login, and task inputs before controllers execute.
- **`backend/server.js`:** Implements `/register`, `/login`, protected `/me`, and protected `/tasks` endpoints.
- **`backend/test-api.js`:** Complete automated test suite verifying health check, validation rejections, user registration, login, token-less 401s, `/me`, and user-scoped CRUD.

### Frontend Components
- **`frontend/src/api.js`:** Manages `localStorage` token storage, injects `Authorization: Bearer <token>` into fetch requests, and dispatches an `auth:unauthorized` window event on `401`.
- **`frontend/src/App.jsx`:** Verifies existing tokens on mount via `/me`, displays login/register forms when unauthenticated, and shows the protected task dashboard when logged in.
- **`frontend/src/components/Login.jsx` & `Register.jsx`:** Controlled forms providing client-side validation, error banners, and switching between auth views.
- **`frontend/src/components/TaskList.jsx`:** Protected dashboard showing logged-in user credentials, a creation form, priority tags, completion toggles, and logout.

---

## 7. Prerequisites and Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017`

### Step 1: Install Backend Dependencies
```bash
cd practical-07/backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 8. Step-by-Step Execution Instructions

### Running the Backend Server
```bash
cd practical-07/backend
npm start
```
*The server starts on `http://localhost:5000` connected to MongoDB `awdf_practical7`.*

### Running Automated Backend Tests
```bash
cd practical-07/backend
npm test
```
*Runs all 10 automated test cases (registration, hashing, validation, login, token-based /me, 401 unauthorized, and task CRUD).*

### Running the Frontend Application
```bash
cd practical-07/frontend
npm run dev
```
*Launches the Vite dev server at `http://localhost:5173`.*

---

## 9. Test Cases and Actual Test Results

### Backend Automated Test Suite (`npm test` in `practical-07/backend`):

| Test # | Test Case Description | Target Endpoint | HTTP Method | Expected Status | Actual Status | Result |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Health Check & Student Identity Verification | `/` | `GET` | `200` | `200` | **PASS** |
| 2 | Input Validation (Invalid Email & Short Password) | `/register` | `POST` | `400` | `400` | **PASS** |
| 3 | User Registration with Password Hashing & JWT | `/register` | `POST` | `201` | `201` | **PASS** |
| 4 | User Login & JWT Token Issuance | `/login` | `POST` | `200` | `200` | **PASS** |
| 5 | Protected Route Access Without Token | `/tasks` | `GET` | `401` | `401` | **PASS** |
| 6 | Protected `/me` Endpoint with Bearer Token | `/me` | `GET` | `200` | `200` | **PASS** |
| 7 | Create Task Document with Bearer Token | `/tasks` | `POST` | `201` | `201` | **PASS** |
| 8 | Fetch User Tasks with Bearer Token | `/tasks` | `GET` | `200` | `200` | **PASS** |
| 9 | Update Task Status with Bearer Token | `/tasks/:id` | `PUT` | `200` | `200` | **PASS** |
| 10 | Delete Task Document with Bearer Token | `/tasks/:id` | `DELETE` | `200` | `200` | **PASS** |

**Summary: 10 / 10 Backend Tests Passed Successfully.**

### Frontend Production Build (`npm run build` in `practical-07/frontend`):
```text
vite v5.4.21 building for production...
✓ 36 modules transformed.
dist/index.html                   0.44 kB │ gzip:  0.29 kB
dist/assets/index-D2wU-NvZ.css    3.21 kB │ gzip:  1.08 kB
dist/assets/index-CTrG_Rs4.js   150.99 kB │ gzip: 48.31 kB
✓ built in 888ms
```
**Summary: 100% Clean Production Build with 0 Errors.**

---

## 10. Supplementary Features Implemented

1. **Authenticated `/me` Endpoint:** Allows frontend clients to verify token validity on page reload and populate user profiles without re-authenticating.
2. **Graceful Token Expiry & 401 Handling:** Dispatches an `auth:unauthorized` event when the backend returns a 401, purging `localStorage` and returning the user to the login view.
3. **User-Scoped Data Isolation:** Tasks are linked to user ObjectIds; users cannot read, edit, or delete another user's tasks.
4. **Client-Side Logout:** Explicit logout button purges stored JWT credentials and resets UI state.

---

## 11. Viva Questions and Answers

### Q1: Why must passwords be hashed with a salted algorithm like bcrypt instead of plain text or simple MD5/SHA256?
**Answer:** Plain text storage exposes credentials in database dumps or log leaks. Fast hashing algorithms like MD5 or SHA-256 are vulnerable to precomputed rainbow table attacks and high-speed GPU cracking. `bcrypt` adds a unique cryptographic salt and uses a configurable work factor (cost), making brute force attacks computationally infeasible.

### Q2: How does JSON Web Token (JWT) authentication work, and why is it considered "stateless"?
**Answer:** A JWT consists of three Base64URL-encoded parts: Header, Payload, and Signature. When signed with `jwt.sign(payload, secret)`, the server sends the token to the client. On subsequent requests, the client transmits the token in `Authorization: Bearer <token>`. The server verifies the cryptographic signature with its secret key without querying a session store or database, making it completely stateless and horizontally scalable.

### Q3: What is the purpose of the authentication middleware, and what happens when a token is missing or expired?
**Answer:** The auth middleware extracts the token from the `Authorization` header and executes `jwt.verify(token, secret)`.
- If missing or malformed: returns `401 Unauthorized` (`Access denied. Missing or malformed Authorization header`).
- If expired or altered: `jwt.verify` throws an exception, caught by the middleware to return `401 Unauthorized` (`Token has expired` or `Invalid token`).

### Q4: Why must input validation be executed on the server even if the React frontend already validates input fields?
**Answer:** Frontend validation is solely for user convenience. Malicious actors or API testing tools (Postman, curl) can bypass frontend forms and transmit raw HTTP requests with empty or malicious payloads. Server-side validation acts as the definitive security perimeter protecting database integrity.

### Q5: How is multi-user data isolation achieved in the task management routes?
**Answer:** The `Task` schema contains a `user` field (`type: ObjectId, ref: 'User'`). All task routes extract `req.user.id` from the verified JWT payload and query using `{ user: req.user.id }` (e.g. `Task.find({ user: req.user.id })` and `Task.findOneAndDelete({ _id: id, user: req.user.id })`), preventing unauthorized cross-user modifications.
