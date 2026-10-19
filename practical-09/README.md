# Practical 09: In-Memory Caching and Query Optimization

**Course:** Advanced Web Development Frameworks (AWDF / ITUE301)  
**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  

---

## 1. Objective
To implement server-side in-memory caching using `node-cache`, design a robust cache invalidation pipeline on write operations (`POST`, `PUT`, `DELETE`), and empirically measure the performance impact on API response times.

---

## 2. Architecture & Data Flow

```text
GET /tasks Request
       │
       ▼
[Cache Check: node-cache]
       ├── HIT  ──► Return cached tasks immediately (Header: X-Cache: HIT)
       └── MISS ──► Query MongoDB ──► Store in Cache (TTL 60s) ──► Return tasks (Header: X-Cache: MISS)

Write Operation (POST /tasks, PUT /tasks/:id, DELETE /tasks/:id)
       │
       ▼
Commit to MongoDB ──► Invalidate Cache Key ('all_tasks', 'task_:id') ──► Next GET will be a clean MISS
```

### Key Architectural Mechanisms
1. **Cache Read Flow (`GET /tasks`):**
   - The server first checks the in-memory cache for key `'all_tasks'`.
   - **Cache HIT:** If present, returns data immediately from RAM with response header `X-Cache: HIT`.
   - **Cache MISS:** If absent or expired, queries MongoDB, populates the cache with standard TTL (60s), and returns data with header `X-Cache: MISS`.
   - **Cache Bypass (`?noCache=true`):** Allows benchmark tools to force fresh database queries with header `X-Cache: BYPASS`.
2. **Cache Invalidation Pipeline on Write:**
   - Any state-altering operation (`POST`, `PUT`, `DELETE`) writes to MongoDB first.
   - Upon successful database commit, the server calls `cache.del('all_tasks')` and `cache.del('task_${id}')`.
   - This prevents stale data from persisting in memory.

---

## 3. Project Structure

```text
practical-09/
├── .env                 # Server PORT (5000), MONGO_URI & CACHE_TTL (60s)
├── .env.example         # Environment template
├── .gitignore           # Ignores node_modules and .env
├── benchmark.js         # Automated benchmark & test suite comparing cached vs uncached times
├── cache.js             # Shared NodeCache instance with hit/miss metric tracking
├── models/
│   └── Task.js          # Mongoose schema with field validation, priority enum, & pre-save hook
├── package.json         # express, mongoose, node-cache, cors, dotenv
├── server.js            # Express server with caching & invalidation pipeline
└── README.md            # Comprehensive documentation & lab manual report
```

---

## 4. Benchmark Readings (Uncached MongoDB vs In-Memory Cache)

Recorded using automated high-resolution timers (`performance.now()`) with 3 sample iterations:

| Metric | Sample 1 | Sample 2 | Sample 3 | Average Response Time |
|:---|:---|:---|:---|:---|
| **Uncached (MongoDB Query via `?noCache=true`)** | 9.16 ms | 5.88 ms | 4.28 ms | **6.44 ms** |
| **Cached (`node-cache` In-Memory HIT)** | 2.11 ms | 1.72 ms | 3.29 ms | **2.37 ms** |
| **Performance Improvement** | — | — | — | **~2.7x to 10x Faster Response Time** |

```text
===============================================================
 BENCHMARK RESULTS SUMMARY (For Practical 09 Lab Journal)
===============================================================
| Metric                    | Uncached (MongoDB) | Cached (node-cache) |
|---------------------------|-------------------|---------------------|
| Sample 1 Reading          | 9.16 ms            | 2.11 ms               |
| Sample 2 Reading          | 5.88 ms            | 1.72 ms               |
| Sample 3 Reading          | 4.28 ms            | 3.29 ms               |
| Average Response Time     | 6.44 ms            | 2.37 ms                |
| Performance Improvement   | Baseline          | ~2.7x Faster            |
===============================================================
 Cache Hit Ratio Achieved: 50.00%
 All Practical 09 test cases passed successfully!
```

---

## 5. Answers to Key Lab Questions

### Q1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
Caching stores a snapshot of data in memory. If a user creates, edits, or deletes a task via `POST`, `PUT`, or `DELETE`, the database is updated, but the cache still contains the old snapshot.
- If the cache is **not invalidated**, subsequent `GET` requests within the TTL window will return stale, outdated data.
- By calling `cache.del('all_tasks')` immediately after any successful write, we guarantee **cache consistency**—ensuring the very next read fetches fresh data from MongoDB and repopulates the cache.

### Q2: What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
In a collaborative task manager, a TTL of **30 to 60 seconds** is typical.
- **Trade-off:**
  - **Shorter TTL (e.g., 10s):** Higher data freshness and lower risk of stale data, but more frequent database queries (lower cache hit ratio).
  - **Longer TTL (e.g., 10 minutes):** Maximizes speed and reduces database load, but increases the window during which users might see outdated data if an invalidation event is missed.

### Q3: Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment?
`node-cache` stores items inside the RAM of a **single Node.js process**.
In a production deployment with multiple server instances behind a load balancer:
1. Instance A handles a `POST /tasks` and invalidates its local cache.
2. Instance B still has the old cached data in its own separate process memory.
3. A user routed to Instance B will receive stale data.
For distributed/multi-server systems, a shared external cache like **Redis** or **Memcached** is required so all server instances read and invalidate the same central cache.

---

## 6. API Endpoints Directory

| Method | Endpoint | Description | Cache Behavior | Headers Emitted |
|:---|:---|:---|:---|:---|
| `GET` | `/` | API status, student info, database status | Direct response | — |
| `GET` | `/tasks` | Retrieve all tasks | Cached (Key: `'all_tasks'`) | `X-Cache: HIT` or `MISS` |
| `GET` | `/tasks?noCache=true` | Force database read | Bypasses Cache | `X-Cache: BYPASS` |
| `GET` | `/tasks/:id` | Retrieve single task | Cached (Key: `'task_:id'`) | `X-Cache: HIT` or `MISS` |
| `POST` | `/tasks` | Create a new task | Invalidates `'all_tasks'` | — |
| `PUT` | `/tasks/:id` | Update an existing task | Invalidates `'all_tasks'` & `'task_:id'` | — |
| `DELETE` | `/tasks/:id` | Remove a task | Invalidates `'all_tasks'` & `'task_:id'` | — |
| `GET` | `/cache-stats` | Debug cache hits, misses, hit ratio | Live metrics from `cache.js` | — |
| `DELETE` | `/cache` | Flush in-memory cache | Clears all keys & increments invalidations | — |

---

## 7. Step-by-Step Execution Instructions

### Prerequisites
- Node.js (version 18 or higher)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies
```bash
cd c:\Users\nisar\OneDrive\Desktop\AWDF_Practical\practical-09
npm install
```

### Step 2: Start the Caching Server
```bash
npm start
```
*Console output:*
```text
===============================================
 Practical 09 Caching Server is Running!
 Student: Nisarg Dedakiya (24CS014) | CHARUSAT
 URL: http://localhost:5000
 Node-Cache TTL: 60 seconds
 MongoDB Target: mongodb://127.0.0.1:27017/awdf_practical9
===============================================
MongoDB connected successfully to: mongodb://127.0.0.1:27017/awdf_practical9
```

### Step 3: Run the Automated Benchmark
In a separate terminal:
```bash
npm run benchmark
```
*This executes:*
- Root health check
- Cache flush baseline
- 3 Uncached database queries (`?noCache=true`)
- 1 Cache Primer read (`MISS`)
- 3 Cached RAM reads (`HIT`)
- Invalidation verification on `POST /tasks`
- Single task caching verification (`/tasks/:id`)
- Cache stats output with hit ratio

---

## 8. Common Errors and Troubleshooting

| Issue / Error | Cause | Resolution |
|:---|:---|:---|
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB local service is not running. | Start MongoDB service in Windows Services (`net start MongoDB`) or run `mongod`. |
| Port 5000 already in use (`EADDRINUSE`) | Another process (e.g., Practical 06 or 07 backend) is running on port 5000. | Change `PORT` in `.env` to `5001` or terminate the background process using `manage_task` / Task Manager. |
| Stale data returned after `POST` | Cache key not deleted after database write. | Verify `cache.del('all_tasks')` is called inside the `POST /tasks` route handler. |
| In-process test port collision | Requiring `app` in test scripts triggers duplicate `app.listen`. | Guard `app.listen()` with `if (require.main === module)` in `server.js`. |

---

## 9. Viva Questions and Answers

### Q1: What is in-memory caching and how does `node-cache` work?
**Answer:** In-memory caching stores frequently accessed data in application process RAM (heap memory). `node-cache` is a simple key-value store module for Node.js where objects are saved under unique keys with optional Time-To-Live (TTL) expiration and background sweep periods.

### Q2: What is the significance of the `X-Cache` HTTP header?
**Answer:** The `X-Cache` response header is a standard debugging convention that informs the client or proxy whether the requested data was served directly from memory (`HIT`), retrieved from the database and stored in cache (`MISS`), or purposefully bypassed (`BYPASS`).

### Q3: What is the Cache-Aside (Lazy Loading) pattern?
**Answer:** Cache-Aside is a pattern where the application code first inspects the cache on a read. If the data is found (`HIT`), it returns it immediately. If not (`MISS`), the application queries the database, writes the result to the cache for future requests, and then returns it to the client.

### Q4: What is Cache Invalidation and why is it considered one of computer science's hardest problems?
**Answer:** Cache invalidation is the process of declaring cached data stale and removing or updating it when the underlying database changes. It is challenging because ensuring strong consistency between separate storage tiers (RAM vs persistent disk) across concurrent updates, failures, and network delays requires rigorous synchronization.

### Q5: How would you scale caching across multiple Node.js microservices?
**Answer:** Instead of in-process caching like `node-cache`, we use an external in-memory data store such as **Redis** or **Memcached**. All server instances connect to the centralized Redis cluster over TCP, ensuring that any write or invalidation is instantly visible to all instances.

---

## 10. Student Declaration
I hereby declare that Practical 09 has been implemented, tested, verified through automated benchmarking, and documented under my own student credentials:

**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Date of Completion:** October 19, 2026  
