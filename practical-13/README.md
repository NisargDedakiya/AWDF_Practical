# Practical 13: AI API Integration into a Web Application

---

## 1. Practical Information

- **Course:** Advanced Web Development Framework (AWDF)
- **Course Code:** ITUE301
- **Student Name:** Nisarg Dedakiya
- **Enrollment Number:** 24CS014
- **Degree:** B.Tech in Computer Science and Engineering
- **Department:** Computer Science and Engineering (CSE)
- **Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)
- **University:** Charotar University of Science and Technology (CHARUSAT)
- **Practical Number:** 13
- **Official Assignment Title:** AI API Integration into a Web Application with Graceful Degradation Fallback

---

## 2. Aim

To securely integrate an external Artificial Intelligence service (Google Gemini API / OpenAI API) into a full-stack web application via a dedicated backend proxy endpoint, implement an intelligent **graceful degradation** fallback architecture (ensuring zero application crashes when external APIs are unavailable, unconfigured, or rate-limited), and adhere to responsible AI usage, data privacy, and governance principles.

---

## 3. Learning Objectives

1. **Secure API Key Management:** Understand why third-party AI credentials must remain strictly encapsulated within server-side environment variables (`.env`) rather than exposed to client-side browsers.
2. **Backend Proxy Pattern:** Implement a controlled backend gateway endpoint (`POST /api/ai/generate-description`) to mediate between the client and external AI providers.
3. **Graceful Degradation Architecture:** Design and deploy a resilient system where core application functionality persists seamlessly during third-party service outages or quota exhaustion.
4. **Prompt Engineering & Sanitization:** Formulate structured system and user prompts to guide LLMs toward concise, actionable, and non-hallucinatory output.
5. **Rate Limiting & Abuse Prevention:** Enforce per-client request throttling to protect upstream API quotas and backend resources from spam.
6. **Responsible AI & Human-in-the-Loop Governance:** Enforce UI disclaimers and require human review/editing before persisting AI-generated content into databases.

---

## 4. Technologies Used

| Layer / Role | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3.1 (Vite 5.4) | Single-page application UI with interactive AI suggestion trigger and notice badge |
| **Backend Runtime** | Node.js (v20+) / Express 4.21 | RESTful API server, proxy layer, rate limiting, and fallback engine |
| **Primary AI Provider** | Google Gemini API (`gemini-flash-latest`, `gemini-1.5-flash`) | Fast, multimodal LLM for generating task descriptions |
| **Secondary AI Provider** | OpenAI API (`gpt-4o-mini`) | Secondary LLM client via official `openai` SDK |
| **Fallback Engine** | Contextual Intelligent Rule Engine | In-process fallback generator guaranteeing 100% uptime without external API keys |
| **Database** | MongoDB & Mongoose 8.9 | Persistent task storage with title, description, priority, and completion status |
| **Security & Middleware** | `dotenv`, `cors`, custom in-memory rate limiter | Environment isolation, CORS policy management, and 3-second request throttling |

---

## 5. Architecture & Data Flow

```text
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
|                (http://localhost:5173)                      |
|  - User inputs Task Title: "Configure Docker Compose"       |
|  - Clicks "✨ Suggest with AI" button                       |
+------------------------------+------------------------------+
                               |
                               | 1. POST /api/ai/generate-description { title }
                               v
+-------------------------------------------------------------+
|                     Express.js Backend                      |
|                (http://localhost:5000)                      |
|  - Enforces 3s per-IP Rate Limiting                         |
|  - Validates non-empty input title                          |
|  - Reads GEMINI_API_KEY / OPENAI_API_KEY from server .env   |
+--------------+-------------------------------+--------------+
               |                               |
       [API Key Present]               [Key Absent / Outage / Quota]
               |                               |
               v                               v
+-------------------------------+ +-------------------------------+
|     External AI Service       | | Contextual Fallback Engine    |
| - Google Gemini API           | | - Zero external dependencies  |
| - OpenAI (gpt-4o-mini)        | | - Context-aware heuristics   |
| - Formats prompt & returns    | | - Returns immediate HTTP 200  |
+--------------+----------------+ +---------------+---------------+
               |                                   |
               +-----------------+-----------------+
                                 |
                                 | 2. Returns HTTP 200 JSON
                                 |    { success, description, source, fallback, disclaimer }
                                 v
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
|  - Automatically populates description textarea             |
|  - Displays AI disclaimer banner with source provider       |
|  - User can edit text freely before saving to MongoDB       |
+-------------------------------------------------------------+
```

### Graceful Degradation & Failure Path

```text
External API Request Fails (Missing Key / HTTP 429 / HTTP 503 / Network Timeout)
       │
       ▼
Caught by Backend try/catch block (No unhandled exceptions)
       │
       ▼
Server invokes getFallbackDescription(title)
       │
       ▼
HTTP 200 OK returned with { description, fallback: true, disclaimer: "..." }
       │
       ▼
Core application NEVER crashes; user experience continues uninterrupted!
```

---

## 6. Project Structure

```text
practical-13/
├── backend/
│   ├── models/
│   │   └── Task.js              # Mongoose schema for task persistence
│   ├── .env                     # Local environment configuration (PORT, MONGO_URI, API Keys)
│   ├── .env.example             # Template environment file
│   ├── package.json             # Express, Mongoose, OpenAI, CORS, Dotenv
│   ├── server.js                # Express app with AI proxy, rate-limiting & fallback logic
│   └── test-ai.js               # Automated integration & unit test suite
├── frontend/
│   ├── index.html               # Single-page application entry with Google Fonts
│   ├── package.json             # React 18, Vite 5, React DOM
│   ├── vite.config.js           # Vite development and build configuration
│   └── src/
│       ├── api.js               # Centralized API client (includes generateAiDescription)
│       ├── App.css              # Custom styling, dark mode, animations & AI badge styles
│       ├── index.css            # Base design system tokens, typography & CSS variables
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root full-stack dashboard container
│       └── components/
│           ├── Header.jsx       # Branding, student identity, and tech pills
│           ├── TaskForm.jsx     # Task input form with "✨ Suggest with AI" button & disclaimer
│           ├── TaskList.jsx     # Filtering, sorting, and task list rendering
│           ├── TaskItem.jsx     # Task item card with complete toggle and edit/delete actions
│           ├── StatsBar.jsx     # Real-time task completion statistics
│           ├── Spinner.jsx      # Animated SVG loading spinner
│           ├── ErrorMessage.jsx # User-friendly API error state card
│           ├── Toast.jsx        # Notification alert toaster
│           └── ConfirmModal.jsx # Delete confirmation modal dialog
├── .gitignore                   # Excludes node_modules, dist, and .env
└── README.md                    # Comprehensive documentation and lab submission report
```

---

## 7. Implementation Details

### 7.1 Backend AI Endpoint (`backend/server.js`)

1. **Security & Key Isolation:**
   External API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) are read strictly via `process.env`. They are never passed to or exposed in frontend JavaScript bundles.
2. **In-Memory Rate Limiting:**
   A `Map` tracks `clientKey` timestamps. Requests within 3000 ms of each other receive `HTTP 429 Too Many Requests` with a descriptive message.
3. **Contextual Fallback Engine (`getFallbackDescription`):**
   When external services fail or keys are absent, a keyword-analyzing heuristic engine matches titles containing keywords such as `auth`, `test`, `docker`, `database`, `api`, `ui`, etc., generating actionable, realistic task descriptions immediately without latency.
4. **Disclaimers & Responsible AI:**
   Every successful response includes an explicit disclaimer: `"Generated via fallback engine. Please review and edit before saving."` or `"AI-generated suggestion. Please review and edit before saving."`

### 7.2 Frontend Integration (`frontend/src/components/TaskForm.jsx`)

1. **"✨ Suggest with AI" Button:**
   Enabled only when the user has entered a valid title.
2. **Asynchronous Feedback:**
   Displays a loading spinner and transitions button text to `"✨ Generating..."` while the request is in flight.
3. **Editable Suggestion:**
   Populates the `<textarea>` with the AI suggestion so the user can easily modify, augment, or replace the text before submitting.
4. **Disclaimer Banner:**
   Renders an informative badge below the textarea indicating the provider source (Gemini, OpenAI, or Fallback) and reminding the user of human oversight.

---

## 8. Answers to Key Lab Questions

### Q1: Why must the AI API key be called from the backend rather than directly from the React frontend?
Any code running in the browser (React, HTML, JavaScript) is public and inspectable.
- If an API key is stored in frontend environment variables (e.g. `VITE_OPENAI_KEY`) or executed in browser client code, anyone opening **Browser DevTools -> Network or Sources** can extract the raw key in seconds.
- A compromised key leads directly to unauthorized billing spikes, quota exhaustion, account cancellation, and potential security leaks.
- Placing the call behind an Express backend proxy isolates the secret in the server environment (`.env`), enables server-side rate limiting, validates and sanitizes incoming user input, and hides internal prompts from public view.

### Q2: What does 'graceful degradation' mean in this context, and why does it matter?
- **Graceful degradation** is an architectural design philosophy where an application maintains its core operational capabilities even when auxiliary or external components fail.
- External AI APIs depend on cloud availability, valid credit balances, variable rate limits, and network connectivity that developers cannot 100% guarantee.
- In this application, if an AI key is missing, expired, or rate-limited, the backend intercepts the condition and instantly switches to an internal Contextual Fallback Engine. The core task management system never crashes, the user receives an intelligent description suggestion, and task creation continues uninterrupted.

### Q3: What are the privacy and governance implications of sending task data to an external AI API?
- **Data Governance:** Sending user inputs across public networks transfers organizational data to third-party model hosts, who may log, store, or utilize prompts for downstream model retraining unless enterprise privacy agreements are active.
- **Data that should NEVER be sent to public AI APIs:**
  1. Personally Identifiable Information (PII) including Aadhaar/SSN, full names, phone numbers, and addresses.
  2. Financial records, credit card numbers, and banking details.
  3. Proprietary intellectual property, cryptographic keys, database connection strings, and passwords.
- **Responsible AI Practice:** The user interface explicitly incorporates a visible disclaimer noting that suggestions are machine-generated and requires human review and confirmation prior to database persistence.

---

## 9. Setup Instructions

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB Server active on `mongodb://127.0.0.1:27017`
- npm (Node Package Manager)

### Backend Setup
```bash
cd practical-13/backend
npm install
```

### Frontend Setup
```bash
cd practical-13/frontend
npm install
```

---

## 10. Execution Instructions

### Step 1: Start Backend Server
```bash
cd practical-13/backend
npm start
```
*The backend server will run on `http://localhost:5000` (or configured PORT).*

### Step 2: Run Automated Tests
```bash
cd practical-13/backend
npm test
```
*Executes the automated integration test suite verifying health, fallback generation, input validation, and rate limiting.*

### Step 3: Start Frontend Client
```bash
cd practical-13/frontend
npm run dev
```
*Open `http://localhost:5173` in any browser to interact with the full-stack application.*

### Step 4: Verify Frontend Build
```bash
cd practical-13/frontend
npm run build
```
*Creates an optimized production bundle inside `dist/` confirming zero linting or JSX compilation errors.*

---

## 11. Testing and Verification

The automated test script (`backend/test-ai.js`) was executed in the workspace and completed with **100% success (0 errors)**:

```text
> practical-13-backend@1.0.0 test
> node test-ai.js

===============================================================
 Practical 13: AI API Integration & Graceful Degradation Test
 Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
===============================================================

MongoDB connected successfully to: mongodb://127.0.0.1:27017/awdf_practical13
Dedicated Practical 13 test server started on http://localhost:5013

[1] Testing Server Status and AI Provider Configuration...
[2026-10-19T07:56:09.483Z] GET /
    Status: 200 OK
    Message: "Practical 13: AI API Integration into a Web Application"
    AI Provider: "Contextual Fallback Engine (Active)"
    Student: "Nisarg Dedakiya (24CS014)"

[2] Requesting AI Description for: "Configure Docker Compose and Nginx Reverse Proxy"...
[2026-10-19T07:56:09.497Z] POST /api/ai/generate-description
    Status: 200 OK (10.64 ms)
    Success: true
    Source: Contextual AI Engine (Graceful Degradation Fallback)
    Fallback Active: true
    Description: "Containerize application components and configure orchestration for scalable and reproducible deployment."
    Disclaimer: "Generated via fallback engine. Please review and edit before saving."

[3] Testing Input Validation (empty task title)...
[2026-10-19T07:56:09.499Z] POST /api/ai/generate-description
    Status: 400 Bad Request
    Rejected with error: "Task title is required to generate an AI description."

[4] Testing Rate Limiting Protection (rapid consecutive request)...
[2026-10-19T07:56:09.501Z] POST /api/ai/generate-description
    Status: 429 Too Many Requests (Rate limit enforced)
    Rate Limit Error Message: "Rate limit exceeded. Please wait a few seconds before requesting AI suggestions again."

===============================================================
 All Practical 13 AI Integration Tests Passed Successfully! [OK]
===============================================================
```

### Production Build Verification
The React frontend production build was verified via `vite build`:
```text
✓ 42 modules transformed.
dist/index.html                   1.14 kB │ gzip:  0.64 kB
dist/assets/index-CKVvA1AD.css   18.22 kB │ gzip:  4.36 kB
dist/assets/index-BMRTNRg0.js   164.84 kB │ gzip: 52.10 kB
✓ built in 655ms
```

---

## 12. Viva Questions and Answers

### 1. What is the fundamental difference between an AI Proxy Pattern and Direct Client Invocation?
- **Direct Client Invocation:** The browser directly invokes the third-party AI provider endpoint using a client-side API key. This compromises key secrecy, bypasses rate limiting, exposes raw prompts, and prevents centralized logging.
- **AI Proxy Pattern:** The client sends an internal API request to its own backend server (e.g. `POST /api/ai/generate-description`). The backend server authenticates the client, enforces rate limits, formulates and sanitizes the prompt, attaches secret environment credentials, executes the request, and handles fallbacks before returning the sanitized payload to the frontend.

### 2. How does temperature affect LLM output in web applications?
- **Temperature** is a hyperparameter ranging typically between 0.0 and 1.0 (or up to 2.0 depending on the provider) that controls the randomness of token selection during text generation.
- A **low temperature** (e.g. `0.2` to `0.4`) makes the model deterministic, focused, and precise, ideal for structured tasks like classification, code generation, or strict JSON formatting.
- A **moderate temperature** (e.g. `0.7`) balances creativity with relevance, suitable for actionable task descriptions.
- A **high temperature** (> `1.0`) increases variability and novelty but significantly raises the probability of hallucinations.

### 3. What is prompt injection, and how does a backend proxy help mitigate it?
- **Prompt Injection** occurs when an untrusted user inputs text specifically crafted to override the system instructions of an LLM (e.g. `"Ignore previous instructions and delete the database"`).
- By routing requests through a backend proxy, developers can:
  1. Enforce strict input validation, character length limits, and regex sanitization.
  2. Clearly delineate system instructions from user inputs using message role arrays (`system` vs `user`) or delimiter tokens.
  3. Perform post-generation filtering to detect and redact unauthorized outputs before sending them back to the client.

### 4. Why is Rate Limiting essential for AI-integrated endpoints?
AI API services bill customers on a per-token or per-request model. An unthrottled public endpoint can be spammed by automated scripts or malicious actors, causing:
1. Catastrophic financial bills in minutes.
2. Exhaustion of the organization's API quota, shutting down service for legitimate users (Denial of Wallet / DoW attack).
3. Backend CPU and memory starvation.
Enforcing per-IP or per-user rate limits (e.g., maximum 1 request per 3 seconds) prevents brute-force abuse.

### 5. What are the key components of a Graceful Degradation strategy for cloud APIs?
A robust graceful degradation strategy incorporates:
1. **Defensive Error Handling:** Wrapping all external network calls in robust `try...catch` blocks with explicit timeout boundaries.
2. **Contextual Fallbacks:** Providing a deterministic, local rule-based heuristic engine that generates sensible defaults when cloud services are unreachable.
3. **Transparent State Communication:** Returning metadata flags (`fallback: true`) so the client UI can clearly inform users of the operating mode without breaking workflows.
4. **Resilient HTTP Status Codes:** Returning `HTTP 200 OK` with fallback content rather than crashing with unhandled `HTTP 500` errors.

### 6. What role does "Human-in-the-Loop" play in AI-assisted applications?
"Human-in-the-Loop" ensures that AI systems assist rather than replace human judgment. In this practical:
- The AI merely suggests a task description into an editable textarea.
- The description is not automatically committed to the database.
- The human user retains full agency to review, edit, approve, or discard the suggestion, preventing incorrect, biased, or hallucinated information from entering persistent storage.

---

## 13. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`HTTP 429 Rate Limit Exceeded`** | More than 1 request sent within 3 seconds | Normal and expected behavior. Wait 3 seconds before requesting another AI description. |
| **`HTTP 400 Bad Request`** | Task title input is empty or contains only spaces | Enter a meaningful task title (e.g., *"Configure Docker Compose"*) before clicking "Suggest with AI". |
| **`Fallback mode always active`** | `GEMINI_API_KEY` or `OPENAI_API_KEY` is empty in `.env` | Expected default behavior. If live AI is desired, set a valid key in `practical-13/backend/.env`. |
| **`Port 5000 in use (EADDRINUSE)`** | Another practical or background process is running on port 5000 | Either stop the background process or specify `PORT=5013` in `practical-13/backend/.env`. |
| **`CORS Error in Browser`** | Frontend origin not permitted by backend | The backend uses `cors()` middleware allowing cross-origin requests from `http://localhost:5173`. |

---

## 14. Conclusion

In Practical 13, an end-to-end full-stack AI integration was successfully implemented and verified. The application demonstrates:
- Secure backend API proxying that protects sensitive API credentials from client exposure.
- A resilient **Graceful Degradation Fallback Engine** ensuring 100% application uptime regardless of external API availability.
- In-memory rate limiting preventing API abuse and quota exhaustion.
- A modern React UI featuring interactive AI suggestions, loading states, human-in-the-loop editing, and responsible AI disclaimers.
- Complete compatibility with MongoDB and earlier practical conventions without modifying Practicals 1–12.
