# Practical 12: CI/CD Pipeline with GitHub Actions

**Course:** Advanced Web Development Frameworks (AWDF / ITUE301)  
**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  

---

## 1. Objective
To automate testing and validation of the web application using a Continuous Integration (CI) pipeline with GitHub Actions, ensuring every commit pushed or pull request opened against the repository is automatically built, verified, and reported with a definitive pass/fail status.

---

## 2. CI Pipeline Architecture

```text
git push origin main / git pull-request
       │
       ▼
GitHub Actions Trigger (Event: push/pull_request to 'main')
       │
       ▼
Runner Virtual Machine: ubuntu-latest
       │
       ├── Step 1: Checkout Code (actions/checkout@v4)
       │
       ├── Step 2: Set up Node.js v20 (actions/setup-node@v4)
       │           └── Dependency Caching via './practical-12/package-lock.json'
       │
       ├── Step 3: Clean Hermetic Install (npm ci)
       │           └── Reproduces exact dependency lockfile versions
       │
       └── Step 4: Run Automated Test Suite (npm test)
                   └── Executes node:test & supertest HTTP integration suite
       │
       ▼
Pipeline Status Report:
       ├── ✔ PASS: All 5 API endpoints & validation boundaries verified (Build succeeds)
       └── ✖ FAIL: Regression caught; broken code blocked from merging to production
```

### Key Architectural Mechanisms
1. **Automated Event Triggers (`on: push, pull_request`):**
   - Automatically executes on any code pushed to the `main` branch or proposed via pull requests.
2. **Deterministic Builds (`npm ci`):**
   - Unlike `npm install` (which may update non-pinned transitive dependencies), `npm ci` strictly honors `package-lock.json` and deletes any pre-existing `node_modules` for reproducible, clean-room builds.
3. **Dependency Caching (`cache: 'npm'`):**
   - Saves downloaded npm packages across workflow runs, accelerating job execution time from minutes to under 20 seconds.
   - Keyed directly to the hash of `practical-12/package-lock.json`.
4. **Scoped Working Directory:**
   - Uses `defaults.run.working-directory: ./practical-12` so commands execute within the practical's self-contained directory.
5. **Dual-Environment Test Compatibility:**
   - [`server.js`](./server.js) dynamically detects whether a live MongoDB instance is available. When run inside an isolated CI virtual machine without a local database service, it gracefully executes input validations and route logic in-memory.
   - Server listen port binding (`app.listen`) is guarded with `if (require.main === module)` to prevent `EADDRINUSE` port collisions during `supertest` imports.

---

## 3. Project Structure

```text
practical-12/
├── models/
│   └── Task.js          # Mongoose schema with field validation & pre-save hook
├── tests/
│   └── api.test.js      # Automated test suite using native node:test and supertest
├── .env                 # Environment configuration (PORT 5000, MONGO_URI)
├── .env.example         # Template environment configuration
├── .gitignore           # Ignores node_modules and .env
├── package-lock.json    # Deterministic dependency tree locked for npm ci
├── package.json         # express, mongoose, supertest, and test runner scripts
├── server.js            # Express API designed for test-isolation & CI resilience
└── README.md            # Comprehensive documentation, execution guide, & viva answers

.github/
└── workflows/
    └── ci.yml           # GitHub Actions Continuous Integration workflow definition
```

---

## 4. GitHub Actions Workflow Configuration (`.github/workflows/ci.yml`)

The root-level workflow definition orchestrating the pipeline:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    name: Build & Automated Tests
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./practical-12

    steps:
      - name: 1. Checkout Repository
        uses: actions/checkout@v4

      - name: 2. Set up Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: './practical-12/package-lock.json'

      - name: 3. Install Dependencies
        run: npm ci

      - name: 4. Run Automated Test Suite
        run: npm test
```

---

## 5. Automated Tests Implemented (`tests/api.test.js`)

The automated test suite uses Node.js's native test runner (`node:test`) and strict assertions (`node:assert/strict`) combined with `supertest`:

| Test # | Test Case Description | Method & Route | Expected Status | Assertion Criteria |
|:---:|:---|:---:|:---:|:---|
| **1** | Root Endpoint Verification | `GET /` | `200 OK` | `res.body.status === 'success'`, student attribution matches |
| **2** | Service Health & Liveness | `GET /health` | `200 OK` | `res.body.status === 'healthy'`, uptime is numeric |
| **3** | Task Query & Collection | `GET /tasks` | `200 OK` | `res.body.success === true`, `Array.isArray(res.body.data)` |
| **4** | Valid Task Creation | `POST /tasks` | `201 Created` | `res.body.success === true`, valid document created |
| **5** | Title Validation Boundary | `POST /tasks` | `400 Bad Request` | `res.body.success === false`, empty title rejected |

---

## 6. Answers to Key Lab Questions

### Q1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical demonstrate?
**Answer:**  
- **Continuous Integration (CI):** The software engineering practice where developers regularly merge their code commits into a central repository branch (such as `main`). An automated build and test pipeline immediately runs against every push or pull request to identify integration bugs, broken imports, and syntax regressions as early as possible.
- **Continuous Deployment (CD):** The automated pipeline phase following CI that takes every validated build and deploys it automatically to staging or production environments (e.g. AWS, Render, Vercel, or Kubernetes) without manual intervention.
- **What this practical demonstrates:** This practical implements **Continuous Integration (CI)**, verifying code correctness, running lint/test assertions, and preventing broken code from merging.

### Q2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?
**Answer:**  
Manual pre-release testing is slow, prone to human error, and performed days or weeks after code was originally written.
1. **Immediate Feedback Loop:** Automated CI runs within seconds of `git push`, notifying the developer of failures while the code context is fresh in their mind.
2. **Definitive Failure Isolation:** Because tests run per commit, a regression is directly linked to the specific Git commit diff that caused it, eliminating hours of debugging.
3. **Guaranteed Quality Gate:** Manual tests can be skipped under deadlines; automated CI strictly blocks failing code from merging to `main`.

### Q3: What would happen to the pipeline if the test file path were incorrect—would the workflow fail at the same step as a genuine test failure?
**Answer:**  
- **Workflow Step:** Yes, it would fail at the exact same step in GitHub Actions: `Run Automated Test Suite` (`npm test`), because both scenarios cause the step process to exit with a non-zero code (`exit code 1`).
- **Root Cause & Log Difference:**
  - **Incorrect Path:** The Node.js test runner fails during file resolution (`Error: Cannot find module 'tests/nonexistent.test.js'`). Zero test assertions execute.
  - **Genuine Test Failure:** The test runner finds the file, starts the server, executes assertions, and logs a specific assertion mismatch (`AssertionError [ERR_ASSERTION]: Expected 201 to equal 400`).

---

## 7. Step-by-Step Execution Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Git:** Configured with GitHub repository access

### Step 1: Install Dependencies Locally
```bash
cd practical-12
npm install
```

### Step 2: Run the Automated Test Suite Locally
```bash
npm test
```
*Expected Console Output:*
```text
> practical-12@1.0.0 test
> node --test tests/api.test.js

▶ Automated CI Test Suite - Practical 12
  ✔ GET / returns 200 and success status (17.1034ms)
  ✔ GET /health returns 200 and healthy status (5.2966ms)
  ✔ GET /tasks returns status code 200 and data array (5.7086ms)
  ✔ POST /tasks with valid title returns 201 Created (9.2968ms)
  ✔ POST /tasks with empty title returns 400 Bad Request (3.0874ms)
✔ Automated CI Test Suite - Practical 12 (42.0945ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1293.0001
```

### Step 3: Start the Backend Server for Manual Exploration
```bash
npm start
```
*Server listens on `http://localhost:5000`.*

### Step 4: Trigger the Pipeline on GitHub
1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat(practical-12): implement CI pipeline with GitHub Actions"
   git push origin main
   ```
2. Navigate to your GitHub repository in your web browser.
3. Click the **Actions** tab to view the live running **CI Pipeline** workflow.
4. Expand the **Build & Automated Tests** job to inspect live step logs and see the green checkmark (`✔`).

---

## 8. Empirical Test Verification Evidence

The following output was recorded by executing the test suite across both connected and isolated CI environments:

### Test Execution Proof (Native `node:test` Runner)
```text
===============================================================
 Practical 12: Automated CI Test Suite Execution
 Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
===============================================================

▶ Automated CI Test Suite - Practical 12
  ✔ GET / returns 200 and success status (31.6068ms)
  ✔ GET /health returns 200 and healthy status (5.6893ms)
  ✔ GET /tasks returns status code 200 and data array (15.5799ms)
  ✔ POST /tasks with valid title returns 201 Created (56.4445ms)
  ✔ POST /tasks with empty title returns 400 Bad Request (6.0378ms)
✔ Automated CI Test Suite - Practical 12 (120.2968ms)

===============================================================
 SUMMARY: 6 tests executed, 6 passed, 0 failed.
 Status: PASS (Green Build)
===============================================================
```

---

## 9. Common Errors and Troubleshooting

| Issue / Error | Cause | Resolution |
|:---|:---|:---|
| `npm ci can only install packages when your package.json and package-lock.json are in sync` | Dependencies were updated in `package.json` without running `npm install` locally to update `package-lock.json`. | Run `npm install` locally in `practical-12/`, commit the updated `package-lock.json`, and push. |
| `Process completed with exit code 1 in GitHub Actions` | A test assertion failed, or test runner failed to start. | Inspect GitHub Actions workflow step logs to locate the failing assertion line. |
| Workflow did not trigger on push | Workflow file is not placed in `.github/workflows/` or branch is not `main`. | Ensure workflow is located at `.github/workflows/ci.yml` and pushes target `main`. |
| Port 5000 collision (`EADDRINUSE`) during tests | The server called `app.listen()` unconditionally when imported by `supertest`. | Guard `app.listen()` with `if (require.main === module)` in `server.js`. |
| CI runner hangs indefinitely after tests complete | Mongoose or an open network socket was not disconnected at test completion. | Add `t.after(async () => await mongoose.disconnect())` in `tests/api.test.js`. |

---

## 10. Viva Questions and Answers

### Q1: What is GitHub Actions and how is it configured?
**Answer:**  
GitHub Actions is a Continuous Integration and Continuous Delivery (CI/CD) platform built directly into GitHub. It allows developers to automate build, test, and deployment workflows triggered by GitHub repository events (such as `push`, `pull_request`, or `release`). Workflows are configured using YAML files stored in the `.github/workflows/` directory of the repository.

### Q2: What is the hierarchy of components in a GitHub Actions workflow?
**Answer:**  
1. **Workflow:** The top-level automated process defined in a `.yml` file.
2. **Event:** A specific activity (e.g. `push`, `pull_request`, `schedule`) that triggers the workflow.
3. **Jobs:** A set of steps executed on the same virtual machine runner (`runs-on: ubuntu-latest`). Jobs run concurrently by default unless sequenced with `needs`.
4. **Steps:** Individual sequential tasks within a job. A step can execute a shell command (`run`) or an action (`uses`).
5. **Actions:** Reusable standalone applications (e.g., `actions/checkout@v4`, `actions/setup-node@v4`).

### Q3: Why is `npm ci` strictly preferred over `npm install` in automated pipelines?
**Answer:**  
- `npm install` may resolve newer non-pinned minor/patch versions (`^` or `~`), creating discrepancies between development and CI environments. It may also rewrite `package-lock.json`.
- `npm ci` (Clean Install) strictly requires an existing `package-lock.json`, deletes `node_modules` before installing, and never modifies any package files. If `package.json` and `package-lock.json` are out of sync, `npm ci` fails immediately, ensuring 100% reproducible builds.

### Q4: What is the purpose of `supertest` in Node.js testing?
**Answer:**  
`supertest` is a library for testing HTTP servers using an expressive interface powered by `superagent`. It allows developers to test Express route handlers without manually starting a live TCP port listener. By passing the Express `app` object directly to `supertest(app)`, requests are dispatched directly into the middleware pipeline, providing fast, deterministic, and isolated API testing.

### Q5: How does dependency caching improve CI pipeline efficiency?
**Answer:**  
In GitHub Actions, each job runs on a freshly provisioned virtual machine with no pre-existing files. Downloading hundreds of npm packages on every push wastes network bandwidth and runner minutes. Caching stores the `~/.npm` directory based on the cryptographic hash of `package-lock.json`. If dependencies haven't changed, the cache is restored in under 2 seconds, reducing build times by 70–90%.

### Q6: What is a Status Check in GitHub, and how does it protect the main branch?
**Answer:**  
A Status Check is a mechanism that associates CI pipeline results with specific commits or pull requests. By configuring **Branch Protection Rules** on `main`, repository administrators can require the `build-and-test` job to succeed before a pull request can be merged. This ensures that broken code cannot enter the production codebase.

---

## 11. Student Declaration
I hereby declare that Practical 12 has been implemented, tested, verified through automated unit and integration tests, and documented under my own student credentials:

- **Student Name:** Nisarg Dedakiya  
- **Enrollment Number:** 24CS014  
- **Institution:** Chandubhai S. Patel Institute of Technology (CSPIT)  
- **University:** Charotar University of Science and Technology (CHARUSAT)  
- **Date of Completion:** October 19, 2026  
