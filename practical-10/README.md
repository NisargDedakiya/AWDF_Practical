# Practical 10: Asynchronous Processing with Event-Driven Architecture

**Course:** Advanced Web Development Frameworks (AWDF / ITUE301)  
**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  

---

## 1. Objective
To implement non-blocking asynchronous background processing using Node.js native `EventEmitter` without external dependencies, demonstrating that background side effects (such as notifications) do not block the main HTTP request-response cycle.

---

## 2. Architecture & Event Flow

```text
POST /tasks Request
       │
       ▼
1. Validate & Save Task to MongoDB (<10ms)
       │
       ▼
2. Send HTTP 201 Response Immediately (<15ms)
   └── Client receives response, UI updates instantly
       │
       ▼
3. setImmediate(() => taskEvents.emit('task-created', taskData))
       │
       ▼ (Deferred to Event Loop Check Phase — Non-Blocking)
4. Notification Listener in listeners.js
       │
       ├── Logs [EVENT RECEIVED] timestamp
       ├── setTimeout(..., 1500ms) [Simulates Slow Background I/O: Email/Push/Webhook]
       └── [BACKGROUND LISTENER COMPLETED] Notification logged in RAM
```

### Key Architectural Mechanisms
1. **Decoupled Request-Response Cycle:**
   - The route handler commits the document to MongoDB and immediately invokes `res.status(201).json(...)`.
   - By decoupling side effects (like email/SMS notifications or analytics dispatch) from the HTTP thread, client round-trip latency remains lightning-fast (<15–50ms).
2. **Event Loop Deferral (`setImmediate`):**
   - Emitting events via `setImmediate()` ensures the call stack empties and the HTTP response headers and body are completely written to the client socket before the event listeners execute.
3. **Dedicated EventEmitter Singleton (`events.js`):**
   - An application-wide event bus instance ensures modular separation between route definitions (`server.js`) and background workers (`listeners.js`).
4. **Fault-Tolerant Error Safety (`listeners.js`):**
   - Node.js `EventEmitter` crashes the entire Node process if an `'error'` event is emitted and no `'error'` listener is registered. Practical 10 registers a dedicated error listener to catch background errors without interrupting the server.
5. **Interactive Demonstration Dashboard (`/dashboard`):**
   - An integrated client web dashboard provides live stopwatch timing and visual proof of non-blocking execution.

---

## 3. Project Structure

```text
practical-10/
├── models/
│   └── Task.js          # Mongoose schema with field validation, priority enum, & pre-save hook
├── public/
│   └── index.html       # Modern, interactive UI dashboard with live stopwatch & event visualizer
├── .env                 # Server PORT (5000), MONGO_URI, and NOTIFICATION_DELAY_MS (1500)
├── .env.example         # Template environment variables
├── .gitignore           # Ignores node_modules and .env
├── events.js            # Dedicated EventEmitter singleton instance
├── listeners.js         # Lifecycle event listeners ('task-created', 'task-deleted', 'error')
├── package.json         # express, mongoose, cors, dotenv manifests and scripts
├── server.js            # Express API with non-blocking event emission & dashboard serving
├── test-events.js       # Automated test suite providing empirical timestamp verification
└── README.md            # Comprehensive documentation & lab manual report
```

### File Explanation
- **`events.js`:** Defines and exports a singleton instance of Node.js's native `EventEmitter` (`TaskEvents`).
- **`listeners.js`:** Attaches asynchronous listeners to `taskEvents`. Simulates realistic background tasks (1.5-second I/O delay) and maintains an in-memory audit log of background events (`notificationLog`).
- **`models/Task.js`:** Defines the Mongoose Task model with required titles, max length constraint, priority enum (`['low', 'medium', 'high']`), and pre-save title trimming hook.
- **`server.js`:** Express application exposing CRUD operations, returning immediate responses, and delegating background work via `setImmediate`. Serves the interactive dashboard at `/dashboard`.
- **`public/index.html`:** Sleek, responsive web dashboard allowing visual experimentation and live timeline inspection.
- **`test-events.js`:** Automated verification script that programmatically tests API latency, timestamp differences, task deletion, and error resilience.

---

## 4. Timestamp Verification Evidence

The following empirical output was recorded by executing `npm test` against the running server:

```text
===============================================================
 Practical 10: Asynchronous EventEmitter Test Suite
 Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
===============================================================

[1] Checking Server Status & Event System...
    Status: 200 OK
    Message: "Practical 10: Asynchronous Processing with Event-Driven Architecture"
    EventEmitter: Active (Native Node.js EventEmitter)
    Database: Connected

[2] Creating Task (Testing Non-Blocking API Response Latency)...
    -> HTTP Response Status : 201 Created
    -> Round-Trip Latency   : 54.49 ms (FAST & NON-BLOCKING)
    -> API Response Time    : 2026-10-19T06:55:45.703Z
    -> Created Task ID      : 6ad5bef11b5994fe43164db9

[3] Waiting for Background Notification Worker (simulated 1500ms delay)...
[4] Querying Background Notification Log (GET /notifications)...
    -> Total Notifications in RAM : 1
    -> Event Type                 : task-created
    -> Task Title                 : "Verify Practical 10 Non-Blocking EventEmitter"
    -> Priority                   : high
    -> Worker Received Event At   : 2026-10-19T06:55:45.705Z
    -> Worker Completed At        : 2026-10-19T06:55:47.208Z

===============================================================
 TIMESTAMP VERIFICATION (Proof of Asynchronous Execution)
===============================================================
 1. API Returned to User at : 2026-10-19T06:55:45.703Z
 2. Background Completed at  : 2026-10-19T06:55:47.208Z
 3. Execution Time Delta     : +1505 ms
 -> Proof: The API responded ~1505ms BEFORE background execution finished!
===============================================================

[5] Deleting Task 6ad5bef11b5994fe43164db9 (Testing task-deleted event)...
    Delete Response: 200 OK | "Task deleted successfully. Deletion event emitted."
    Deletion Event Logged : YES (Confirmed)

[6] Testing Error Event Handling (POST /simulate-error)...
    Trigger Response : 200 OK | "Emitting test error event to verify fault-tolerant error listener."
    Post-Error Liveness Check: ALIVE (Server did not crash!)

===============================================================
 ALL PRACTICAL 10 TESTS PASSED SUCCESSFULLY!
 Verified for: Nisarg Dedakiya (24CS014) | CSPIT - CHARUSAT
===============================================================
```

### Verification Analysis
| Milestone | Timestamp | Latency Relative to API Response |
|:---|:---|:---|
| **API Response Sent to Client** | `2026-10-19T06:55:45.703Z` | **Baseline (0 ms)** |
| **Worker Event Received** | `2026-10-19T06:55:45.705Z` | **+2 ms** |
| **Worker Processing Finished** | `2026-10-19T06:55:47.208Z` | **+1505 ms** |

**Conclusion:** The client received a complete HTTP 201 response in under **55 ms**, while the background notification finished **1,505 ms later**. This proves that background processing does not block the main HTTP thread.

---

## 5. Answers to Key Lab Manual Questions

### Q1: Why does emitting an event not block the API response, even though both run on the same Node.js process?
**Answer:**  
Node.js operates on a single-threaded **Event Loop**.
- By wrapping the event emission in `setImmediate(() => taskEvents.emit(...))`, the callback is scheduled into the **Check phase** of the Event Loop.
- Inside the route handler, `res.status(201).json(...)` flushes HTTP headers and serialized JSON down the network socket immediately.
- The call stack empties, concluding the request-response cycle for the client.
- The Event Loop then picks up the background notification listener on subsequent ticks, where `setTimeout` delegates the 1.5s simulated I/O timer to the Libuv timer heap.

### Q2: What would happen to API response time if the notification logic were placed directly inside the POST route instead of in an event handler?
**Answer:**  
If notification logic (e.g., sending an email via SMTP or making a third-party SMS/webhook HTTP request) is executed sequentially inside the route handler:
1. **High Client Latency:** The client would be forced to wait for 1.5+ seconds before receiving an HTTP 201 response.
2. **Poor User Experience:** Web apps and mobile apps would appear sluggish or unresponsive.
3. **Severe Throughput Degradation:** Under concurrent traffic, worker threads or sockets waiting on slow external APIs would queue up, exhausting file descriptors and causing gateway timeouts (`504 Gateway Timeout`).

### Q3: Why is EventEmitter a reasonable choice for this scale of application, but not for a production system handling millions of events per day?
**Answer:**  
- **Why it works in this lab:**
  - Zero external infrastructure required (no Redis, RabbitMQ, or Kafka brokers needed).
  - Runs in-process with minimal overhead and instantaneous setup.
- **Why it fails at massive scale:**
  1. **In-Memory & Volatile (No Durability):** Events live in Node.js process heap memory. If the server crashes or restarts, all queued events are permanently lost.
  2. **Single Server Limitation:** `EventEmitter` cannot distribute jobs across multiple server instances behind a load balancer. If Instance A emits an event, listeners on Instance B will never receive it.
  3. **No Backpressure or Retries:** Native `EventEmitter` does not provide rate-limiting, dead-letter queues, scheduled delayed retries, or message acknowledgments (ACK/NACK).
  4. **Alternative for Production:** Distributed message queues like **BullMQ (Redis)**, **RabbitMQ (AMQP)**, or **Apache Kafka**.

---

## 6. API Endpoints Directory

| Method | Endpoint | Description | Asynchronous Side Effect | HTTP Status |
|:---|:---|:---|:---|:---:|
| `GET` | `/` | API status, student info, database status | Direct response (redirects to `/dashboard` if browser) | `200 OK` |
| `GET` | `/dashboard` | Interactive Web Dashboard | Serves frontend UI (`public/index.html`) | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks sorted by creation date | MongoDB query | `200 OK` |
| `POST` | `/tasks` | Create task and queue background notification | Emits `'task-created'` via `setImmediate` | `201 Created` |
| `DELETE` | `/tasks/:id` | Remove task and queue deletion alert | Emits `'task-deleted'` via `setImmediate` | `200 OK` |
| `GET` | `/notifications` | Query background audit logs from RAM | Inspects in-memory `notificationLog` | `200 OK` |
| `POST` | `/simulate-error`| Emits test error event on `taskEvents` | Tests fault-tolerant error listener | `200 OK` |

---

## 7. Step-by-Step Execution Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** Local instance running on `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies
Open a terminal in the practical directory:
```bash
cd practical-10
npm install
```

### Step 2: Start the Event-Driven Server
```bash
npm start
```
*Expected Console Output:*
```text
===============================================
 Practical 10 Server is Running!
 Student: Nisarg Dedakiya (24CS014) | CHARUSAT
 URL: http://localhost:5000
 Web Dashboard: http://localhost:5000/dashboard
 Native EventEmitter: Active (setImmediate non-blocking)
 MongoDB Target: mongodb://127.0.0.1:27017/awdf_practical10
===============================================
MongoDB connected successfully to: mongodb://127.0.0.1:27017/awdf_practical10
```

### Step 3: Run the Automated Verification Suite
In a second terminal:
```bash
cd practical-10
npm test
```
*Executes health check, latency measurement, timestamp comparison, deletion verification, and error handler safety.*

### Step 4: Open the Interactive Web Dashboard
Navigate to:
```text
http://localhost:5000/dashboard
```
- Create tasks to see live stopwatch response times (<15ms).
- Watch the background processing step complete after 1500ms.
- Inspect the live notification cards with exact timestamps.
- Test "Simulate Error Event" to verify that the server stays online.

---

## 8. Common Errors and Troubleshooting

| Issue / Error | Cause | Resolution |
|:---|:---|:---|
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB server service is stopped. | Start MongoDB in Windows Services (`net start MongoDB`) or run `mongod`. |
| Port 5000 already in use (`EADDRINUSE`) | Another Node.js process is occupying port 5000. | Change `PORT` in `.env` (e.g. `PORT=5001`) or stop the competing process. |
| Unhandled `'error'` event crash | Emitting `taskEvents.emit('error', ...)` without an `'error'` listener. | Always attach `taskEvents.on('error', (err) => ...)` in `listeners.js`. |
| Event listener not firing | `listeners.js` was never imported. | Ensure `require('./listeners')` is called inside `server.js` before server bootstrap. |
| High RAM usage over time | Storing unlimited notifications in memory. | Cap `notificationLog` size (e.g. `if (notificationLog.length > 50) notificationLog.pop()`). |

---

## 9. Viva Questions and Answers

### Q1: What is the Node.js Event Loop and how does `EventEmitter` interact with it?
**Answer:**  
The Node.js Event Loop is a single-threaded mechanism provided by the Libuv library that coordinates non-blocking asynchronous I/O by cycling through distinct phases: **Timers**, **Pending Callbacks**, **Idle/Prepare**, **Poll**, **Check (`setImmediate`)**, and **Close Callbacks**.  
`EventEmitter` is a synchronous publish-subscribe construct. When `emit()` is called directly, all attached listener functions execute synchronously in the order they were registered. To make event handling truly non-blocking relative to an HTTP response, we defer the `emit()` call using `setImmediate()`, which places it into the Check phase after the current I/O cycle completes.

### Q2: What is the difference between `process.nextTick()`, `setImmediate()`, and `setTimeout()`?
**Answer:**  
- **`process.nextTick()`:** Executes immediately after the current operation finishes, before the event loop advances to any other phase. (High priority microtask).
- **`setImmediate()`:** Designed to execute on the **Check phase** of the event loop, directly after the Poll phase has completed incoming I/O events.
- **`setTimeout(fn, ms)`:** Schedules execution on the **Timers phase** after at least `ms` milliseconds have elapsed.

### Q3: What is the Publisher-Subscriber (Pub/Sub) pattern and how does Practical 10 implement it?
**Answer:**  
Pub/Sub is a behavioral architectural design pattern where senders of messages (Publishers) do not send messages directly to specific receivers (Subscribers). Instead, publishers publish events through an intermediary channel without knowing who is listening. In Practical 10:
- **Publisher:** `server.js` (`POST /tasks` and `DELETE /tasks/:id`) emits events (`'task-created'`, `'task-deleted'`).
- **Intermediary:** `events.js` (the `TaskEvents` singleton instance).
- **Subscribers:** `listeners.js` listens to events and performs independent side effects (logging, simulated notifications).

### Q4: Why is having an `'error'` listener mandatory on any Node.js `EventEmitter`?
**Answer:**  
In Node.js, the `'error'` event is treated as a special case. If an `EventEmitter` instance emits an `'error'` event and has **no listener** registered for `'error'`, Node.js prints the stack trace, throws an unhandled exception, and terminates the entire Node.js process (`process.exit(1)`). Attaching `taskEvents.on('error', ...)` guarantees that unexpected background errors are caught safely and logged without taking down the production server.

### Q5: How would you prevent memory leaks when dynamically subscribing to events?
**Answer:**  
1. Call `emitter.removeListener(event, handler)` or `emitter.off()` when a listener is no longer needed (e.g., on component unmount or connection close).
2. Use `emitter.once(event, handler)` for events that only need to be handled a single time.
3. Monitor `emitter.listenerCount(event)` and set appropriate thresholds with `emitter.setMaxListeners(n)`. If more than 10 listeners are attached without increasing the maximum, Node.js emits a `MaxListenersExceededWarning`.

### Q6: How would you migrate this architecture to support horizontal scaling across multiple servers?
**Answer:**  
Replace the in-process `EventEmitter` with an external distributed message broker or task queue:
1. **Redis + BullMQ:** Producers push job objects into a Redis queue. Multiple worker instances consume jobs with concurrency control, automatic retries, and persistence.
2. **RabbitMQ (AMQP):** Uses exchanges and queues with message acknowledgments (ACK) to route messages across multiple worker microservices.
3. **Apache Kafka:** For massive streaming event pipelines supporting replayability and partitioned consumer groups.

---

## 10. Student Declaration
I hereby declare that Practical 10 has been implemented, tested, verified through automated timestamp benchmarking, and documented under my own student credentials:

- **Student Name:** Nisarg Dedakiya  
- **Enrollment Number:** 24CS014  
- **Institution:** Chandubhai S. Patel Institute of Technology (CSPIT)  
- **University:** Charotar University of Science and Technology (CHARUSAT)  
- **Date of Completion:** October 19, 2026  
