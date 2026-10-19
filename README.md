# AWDF_Practical

**Advanced Web Development Framework (AWDF)**


## Student Information
- **Student Name:** Nisarg Dedakiya
- **Enrollment Number:** 24CS014
- **Degree:** B.Tech in Computer Science and Engineering
- **Department:** Computer Science and Engineering (CSE)
- **Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)
- **University:** Charotar University of Science and Technology (CHARUSAT)
- **Course:** Advanced Web Development Framework (AWDF / ITUE301)

---

## Practicals Index

| Practical | Topic / Title | Description | Technologies | Status |
| :---: | :--- | :--- | :--- | :---: |
| [Practical 01](./practical-01/) | **Introduction to React and Component Architecture** | Static student portfolio UI using independently structured components and props. | React 18, Vite, JavaScript, CSS3 | **Completed** |
| [Practical 02](./practical-02/) | **State Management and Routing in React** | Reactive state with `useState` (controlled inputs, live preview, dark mode) and client-side routing via `react-router-dom`. | React 18, React Router v6, Vite | **Completed** |
| [Practical 03](./practical-03/) | **API Integration and Data Rendering in React** | Asynchronous GitHub REST API consumption, `useEffect`, three-state UI (Loading, Error, Success), and client search filter. | React 18, React Router v6, Vite | **Completed** |
| [Practical 04](./practical-04/) | **Building a RESTful API with Node.js and Express** | Task management REST API with in-memory CRUD operations, middleware pipeline (logging, content-type and ID validation), custom 404, and centralized error handling. | Node.js, Express.js, CORS | **Completed** |
| [Practical 05](./practical-05/) | **MongoDB Integration and Schema Design with Mongoose** | Full CRUD REST API connected to MongoDB using Mongoose ODM, strict field-level validations, priority enum, pre-save hook, and structured error handling. | Node.js, Express.js, MongoDB, Mongoose | **Completed** |
| [Practical 06](./practical-06/) | **Full Stack Integration (React + Node + MongoDB)** | Complete full-stack integration with bidirectional state synchronization, optimistic UI updates with error rollback, live metrics, and real-time toast feedback. | React 18, Vite, Node.js, Express, MongoDB, Mongoose | **Completed** |
| [Practical 07](./practical-07/) | **Authentication and Middleware Pipeline** | JWT stateless authentication, bcrypt password hashing, input validation pipeline, user-scoped task access, and token expiration handling. | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, React | **Completed** |
| [Practical 08](./practical-08/) | **Performance Optimization and Lazy Loading in React** | Route-based code splitting using `React.lazy()`, dynamic chunk loading, `<Suspense>` fallback UI, and production bundle analysis. | React 18, React Router v6, Vite | **Completed** |
| [Practical 09](./practical-09/) | **In-Memory Caching and Query Optimization** | Server-side caching using `node-cache`, write invalidation pipeline, hit/miss metrics tracking, and response time benchmarking. | Node.js, Express, MongoDB, Mongoose, node-cache | **Completed** |
| [Practical 10](./practical-10/) | **Asynchronous Processing with Event-Driven Architecture** | Non-blocking background event execution using Node.js native `EventEmitter`, decoupled notification pipeline, timestamp verification, and fault-tolerant error listener. | Node.js, Express, MongoDB, Mongoose, EventEmitter, HTML5/CSS3 | **Completed** |
| [Practical 11](./practical-11/) | **Containerization with Docker and Docker Compose** | Multi-container application orchestration (React frontend, Express REST API, MongoDB) using Docker Compose, internal DNS networking, and persistent named volume storage. | Docker, Docker Compose, React 18, Vite, Express, MongoDB | **Completed** |


---

## General Setup & Prerequisites

Each practical is independently runnable in its own directory:
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Running Any Practical (e.g. Practical 01):
```bash
cd practical-01
npm install
npm run dev
```
To build for production verification:
```bash
npm run build
```
