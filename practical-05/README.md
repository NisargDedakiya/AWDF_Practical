# Practical 05: MongoDB Integration and Schema Design with Mongoose

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
> **Practical 05:**  
> Connect a MongoDB database to an Express backend server using the Mongoose Object Data Modeling (ODM) library. Design a robust Task schema enforcing strict field-level validations (required fields, maximum length, trim), default values, custom priority enumeration (`low`, `medium`, `high`), pre-save middleware hooks (for automatic string sanitization), and complete CRUD operations. Implement structured error handling to intercept Mongoose validation and cast errors, converting them into clean HTTP 400 responses.

---

## 2. Aim and Objectives
- **Primary Aim:** To establish a database connection between an Express.js server and a MongoDB instance using Mongoose ODM, implementing schema constraints, lifecycle hooks, and resilient error transformations.
- **Specific Objectives:**
  1. Securely configure database connectivity using environment variables via `dotenv`.
  2. Architect a structured Mongoose schema (`models/Task.js`) with field constraints (`required`, `trim`, `maxlength`, `default`, `enum`).
  3. Implement a Mongoose document pre-save hook (`pre('save')`) to sanitize user inputs before persistence.
  4. Build RESTful CRUD endpoints (`find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`) utilizing Mongoose model methods.
  5. Enforce update validation using `{ runValidators: true }` in `findByIdAndUpdate`.
  6. Intercept Mongoose `ValidationError` and `CastError` in a centralized Express error middleware, preventing raw stack-trace leaks and returning clean JSON errors.
  7. Verify all endpoints and schema constraints through an automated test script (`test-api.js`).

---

## 3. Technologies Used
- **Runtime Environment:** Node.js (v18.0.0+)
- **Backend Framework:** Express.js (`v4.21.2`)
- **Object Data Modeling (ODM):** Mongoose (`v8.9.5`)
- **Database Engine:** MongoDB Server (Community Edition / Atlas)
- **Environment Management:** `dotenv` (`v16.4.7`)
- **Cross-Origin Resource Sharing:** `cors` (`v2.8.5`)
- **Data Format:** JSON (JavaScript Object Notation)

---

## 4. Architecture & Data Flow

```
                                  Client Request (Postman / test-api.js)
                                                    │
                                                    ▼
                                       [Global Express Middlewares]
                                    (CORS, express.json, Request Logger)
                                                    │
                                                    ▼
                                       Express Controller / Routes
                         (GET /tasks, GET /tasks/:id, POST, PUT, DELETE)
                                                    │
                                                    ▼
                                         Mongoose ODM Layer
                                          (models/Task.js)
                               ┌────────────────────┴────────────────────┐
                               ▼                                         ▼
                     [Schema Validations]                       [Pre-save Hook]
                - title: required, trim, max:100           taskSchema.pre('save')
                - priority: enum ['low','med','high']       Auto-trims whitespace
                - completed: default false
                               │
                               ▼
                   MongoDB Database (tasks collection)
                 { _id, title, description, completed, priority, createdAt }
                               │
                               ▼ (On Schema or Cast Failure)
               [Centralized Error Handling Middleware]
                 - ValidationError → HTTP 400 with details array
                 - CastError       → HTTP 400 with field message
                 - Unknown Error   → HTTP 500 fallback
```

---

## 5. Project Folder Structure

```
practical-05/
├── .env                  # Active environment variables (PORT, MONGO_URI)
├── .env.example          # Template environment configuration for evaluators
├── .gitignore            # Ignores node_modules, .env, and logs
├── models/
│   └── Task.js           # Mongoose Schema & Model with validation rules and hooks
├── package.json          # Manifest with express, mongoose, cors, dotenv
├── server.js             # Express application, MongoDB connection, routes, error handlers
├── test-api.js           # Automated test suite verifying 9 test cases
└── README.md             # Complete practical documentation and viva questions
```

---

## 6. Explanation of Important Files

### `models/Task.js`
Defines the Mongoose schema:
- `title`: String, required with custom message (`'Task title is required.'`), `trim: true`, `maxlength: 100`.
- `description`: String, `trim: true`, default `''`.
- `completed`: Boolean, default `false`.
- `priority`: String, enum restricted to `['low', 'medium', 'high']`, default `'medium'`.
- `createdAt`: Date, default `Date.now`.
- `versionKey: false`: Suppresses MongoDB `__v` internal revision field.
- **Pre-save Hook (`taskSchema.pre('save')`)**: Automatically strips leading/trailing whitespace from `this.title` before persisting to MongoDB.

### `server.js`
- Connects to MongoDB via `mongoose.connect(MONGO_URI)`.
- Implements CRUD operations:
  - `GET /`: Returns API info, student details (`Nisarg Dedakiya`, `24CS014`), and active database connection state.
  - `GET /tasks`: `Task.find().sort({ createdAt: -1 })`.
  - `GET /tasks/:id`: `Task.findById(id)` with ObjectId format pre-check.
  - `POST /tasks`: `Task.create(...)` with schema validation and pre-save hook.
  - `PUT /tasks/:id`: `Task.findByIdAndUpdate(id, data, { new: true, runValidators: true })`.
  - `DELETE /tasks/:id`: `Task.findByIdAndDelete(id)`.
- **Structured Error Handler**: Intercepts `err.name === 'ValidationError'` and `err.name === 'CastError'` to send clean HTTP 400 responses.

### `test-api.js`
Automated test suite executing 9 focused test cases:
- Detects if server is running on port 5000 or boots an in-process instance on an ephemeral port.
- Verifies database connection, missing title rejection, invalid priority enum rejection, pre-save whitespace trimming, single-document retrieval, document update with validators, document deletion, post-deletion 404, and invalid ObjectId handling.

---

## 7. Prerequisites and Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas cloud URI

### Installation
Navigate to `practical-05`:
```bash
cd practical-05
npm install
```

---

## 8. Database Setup

Ensure MongoDB is running locally. On Windows:
```powershell
Get-Service -Name *mongo*
# If stopped:
Start-Service -Name MongoDB
```
Or configure `.env` with your remote MongoDB Atlas connection string:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/awdf_practical5
```

---

## 9. Step-by-Step Execution Instructions

### Start the Server
```bash
npm start
```
Output:
```text
====================================================
Task Manager API running at http://localhost:5000
Connected to MongoDB: mongodb://127.0.0.1:27017/awdf_practical5
Student: Nisarg Dedakiya (24CS014) | Practical 5
====================================================
```

### Start in Development Mode (Watch Mode)
```bash
npm run dev
```

### Run Automated Test Suite
```bash
npm test
```

---

## 10. API Endpoints Specification

| Method | Endpoint | Description | Request Body | Success Status | Error Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | API & MongoDB Connection Status | *None* | `200 OK` | — |
| `GET` | `/tasks` | Get all tasks (sorted newest first) | *None* | `200 OK` | `500` |
| `GET` | `/tasks/:id` | Get single task by MongoDB `_id` | *None* | `200 OK` | `400 / 404` |
| `POST` | `/tasks` | Create task with schema validation | `{ title, description?, completed?, priority? }` | `201 Created` | `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update task with validators | `{ title?, description?, completed?, priority? }` | `200 OK` | `400 / 404` |
| `DELETE` | `/tasks/:id` | Delete task by MongoDB `_id` | *None* | `200 OK` | `400 / 404` |
| `*` | `/*` | Catch-all undefined route | *Any* | — | `404 Not Found` |

---

## 11. Test Cases and Actual Test Results

Executed via `npm test`:

| Test # | Test Case Description | Target Endpoint | HTTP Method | Expected Status | Actual Status | Result |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Welcome Endpoint & DB Status | `/` | `GET` | `200` | `200` | **PASS** |
| 2 | Validation: Missing Required Title | `/tasks` | `POST` | `400` | `400` | **PASS** |
| 3 | Validation: Invalid Priority Enum | `/tasks` | `POST` | `400` | `400` | **PASS** |
| 4 | Successful Creation with Pre-Save Trim | `/tasks` | `POST` | `201` | `201` | **PASS** |
| 5 | Read Single Document by MongoDB ID | `/tasks/:id` | `GET` | `200` | `200` | **PASS** |
| 6 | Update Document with `runValidators` | `/tasks/:id` | `PUT` | `200` | `200` | **PASS** |
| 7 | Delete Document by MongoDB ID | `/tasks/:id` | `DELETE` | `200` | `200` | **PASS** |
| 8 | Retrieve Deleted Document (Verify 404) | `/tasks/:id` | `GET` | `404` | `404` | **PASS** |
| 9 | Invalid ObjectId Format Handling | `/tasks/invalid-id-123` | `GET` | `404` | `404` | **PASS** |

**Summary: 9 / 9 Tests Passed (100% Success Rate).**

---

## 12. Explanation of Main Code and Logic

### 1. Pre-Save Middleware Hook
```javascript
taskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});
```
`pre('save')` executes before document persistence in MongoDB. The hook receives access to the document instance via `this`, allowing automatic data transformations such as trimming trailing/leading whitespace.

### 2. Enforcing Validators on Updates (`runValidators: true`)
By default, Mongoose runs schema validation on `save()` and `create()`, but **not** on `findOneAndUpdate` or `findByIdAndUpdate`. Adding `{ runValidators: true }` ensures that update payloads cannot bypass schema rules (e.g. attempting to assign an invalid priority enum).

### 3. Intercepting Mongoose Validation Errors
```javascript
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Schema Validation Failed',
      details: errorDetails
    });
  }
  // ...
});
```
Extracts user-friendly error messages from Mongoose's internal error tree, returning clean arrays rather than exposing server internals.

---

## 13. Common Errors and Troubleshooting

1. **`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`**:
   - Cause: MongoDB service is stopped or not installed.
   - Solution: Start the service via `net start MongoDB` or use a MongoDB Atlas cloud URI.
2. **Schema validation bypassed during `findByIdAndUpdate`**:
   - Cause: Mongoose ignores schema validators on update queries by default.
   - Solution: Pass `{ runValidators: true }` as an option in `findByIdAndUpdate`.
3. **`CastError: Cast to ObjectId failed for value "..."`**:
   - Cause: The client supplied a string that is not a valid 24-character hexadecimal MongoDB ObjectId.
   - Solution: Pre-validate using `mongoose.Types.ObjectId.isValid(id)` or catch `err.name === 'CastError'` in the global error handler.

---

## 14. Viva Questions and Answers

### Q1: What is Mongoose, and how does it differ from the native MongoDB driver?
**Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. Unlike the raw MongoDB driver, Mongoose provides a schema-based solution to model application data, enforce type casting, validation rules, default values, query builders, and lifecycle hooks (`pre` and `post` middleware).

### Q2: Why are schema validations not automatically executed during `findByIdAndUpdate`?
**Answer:** For performance reasons, update queries in Mongoose map directly to MongoDB driver commands (`updateOne`) without instantiating full document instances. To enforce schema rules on update queries, Mongoose requires the explicit option `{ runValidators: true }`.

### Q3: What is a Mongoose middleware (hook), and what types exist?
**Answer:** Mongoose middleware functions are passed control during the execution of asynchronous functions at the schema level. The four main types are:
1. **Document middleware** (e.g., `init`, `validate`, `save`, `remove`).
2. **Query middleware** (e.g., `find`, `findOne`, `findOneAndUpdate`).
3. **Aggregate middleware** (e.g., `aggregate`).
4. **Model middleware** (e.g., `insertMany`).

### Q4: How does MongoDB generate `_id` and what is its structure?
**Answer:** By default, MongoDB generates an `ObjectId` (12-byte BSON type):
- 4 bytes: Unix epoch timestamp.
- 5 bytes: Random value unique to the machine and process.
- 3 bytes: Incrementing counter starting at a random value.

### Q5: What is the purpose of `versionKey: false` in a Mongoose schema?
**Answer:** By default, Mongoose adds a `__v` field to track document internal revisions (used for concurrency control in array manipulations). Setting `versionKey: false` disables this property for cleaner JSON responses when document versioning is not required.
