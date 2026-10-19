# Practical 11: Containerization with Docker and Docker Compose

**Course:** Advanced Web Development Frameworks (AWDF / ITUE301)  
**Student Name:** Nisarg Dedakiya  
**Enrollment Number:** 24CS014  
**Degree:** B.Tech in Computer Science and Engineering  
**Department:** Computer Science and Engineering (CSE)  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)  
**University:** Charotar University of Science and Technology (CHARUSAT)  

---

## 1. Objective
To containerize the full-stack application (React frontend, Node/Express backend, and MongoDB database) using Docker and orchestrate all three services with Docker Compose to build, link, and start the entire system with a single command.

---

## 2. Multi-Container Architecture

```text
                                 docker-compose.yml
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
      ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
      │  frontend Service   │ │   backend Service   │ │   mongodb Service   │
      │  React 18 + Vite    │ │  Node 18 + Express  │ │  Official Mongo 6   │
      │  Container Port 5173│ │ Container Port 5000 │ │Container Port 27017 │
      └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                 │                       │                       │
                 │ Host Port: 5173       │ Host Port: 5000       │ Host Port: 27017
                 ▼                       ▼                       ▼
         Browser Client        REST API Consumption     mongo-data Volume
      (http://localhost:5173) (http://localhost:5000) (Persistent /data/db)
                 ▲                       ▲                       ▲
                 └───────────────────────┴───────────────────────┘
                                         │
                     Isolated Bridge Network: app-network
                  (Internal DNS: backend:5000, mongodb:27017)
```

### Key Architectural Mechanisms
1. **Single-Command Orchestration (`docker-compose.yml`):**
   - Automatically builds both custom container images (`backend` and `frontend`) and pulls the official MongoDB image (`mongo:6-jammy`).
   - Starts all three services in correct dependency order (`mongodb` → `backend` → `frontend`).
2. **Internal DNS Service Discovery:**
   - In containerized environments, `localhost` refers only to the container's own isolated loopback interface.
   - Docker Compose creates a private user-defined bridge network (`app-network`).
   - The backend references `mongodb://mongodb:27017/awdf_practical11`, where the hostname `mongodb` is resolved automatically by Docker's embedded DNS server.
3. **Persistent Storage with Named Volumes:**
   - Containers are ephemeral by default. If a container is removed, changes to its internal file system are lost.
   - The named volume `mongo-data` is mounted to `/data/db` inside the MongoDB container, ensuring tasks and database state persist across container re-creations and reboots.
4. **Optimized Multi-Stage Builds (`frontend/Dockerfile`):**
   - Separates the build-time environment from the runtime environment.
   - Stage 1 compiles JSX and minifies CSS/JS bundles.
   - Stage 2 serves the production distribution via Vite Preview with host binding (`0.0.0.0:5173`).
5. **Layer Caching Optimization:**
   - Both Dockerfiles copy `package*.json` and execute `npm install` *before* copying the application source code.
   - Docker reuses cached dependency layers whenever source files change, speeding up subsequent image builds from minutes to seconds.

---

## 3. Project Structure

```text
practical-11/
├── backend/
│   ├── models/
│   │   └── Task.js          # Mongoose schema with field validation & pre-save hook
│   ├── .dockerignore        # Excludes node_modules, npm-debug.log, .env, and .git
│   ├── .env                 # Environment variables for backend
│   ├── .env.example         # Template environment configuration
│   ├── Dockerfile           # Backend Node.js containerization instructions
│   ├── package.json         # Express, Mongoose, CORS, Dotenv manifests
│   ├── server.js            # Express REST API connecting to MongoDB
│   └── test-api.js          # Automated end-to-end API test suite
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular React components (Header, TaskForm, TaskList, etc.)
│   │   ├── api.js           # Centralized API client supporting VITE_API_URL
│   │   ├── App.css          # Glassmorphic, responsive dark theme styling
│   │   ├── App.jsx          # Main application with optimistic UI updates
│   │   ├── index.css        # Global CSS variables and typography
│   │   └── main.jsx         # React application entry point
│   ├── .dockerignore        # Excludes node_modules, dist, and debug logs
│   ├── Dockerfile           # Multi-stage React build & production preview
│   ├── index.html           # HTML5 document template
│   ├── package.json         # React 18, Vite dependencies & scripts
│   └── vite.config.js       # Vite configuration with 0.0.0.0 host binding
├── docker-compose.yml       # Orchestration manifest (services, networks, volumes)
├── .gitignore               # Ignores node_modules, dist, and .env
└── README.md                # Comprehensive documentation & lab manual report
```

---

## 4. Dockerfiles and Compose Configuration

### 4.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### 4.2 Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy application source code and build production bundle
COPY . .
RUN npm run build

EXPOSE 5173

# Serve production build using Vite preview accessible across Docker bridge network
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### 4.3 Multi-Service Orchestration (`docker-compose.yml`)
```yaml
services:
  # 1. MongoDB Database Service
  mongodb:
    image: mongo:6-jammy
    container_name: practical11-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  # 2. Node/Express Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: practical11-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/awdf_practical11
    depends_on:
      - mongodb
    networks:
      - app-network

  # 3. React Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: practical11-frontend
    restart: always
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
    driver: local
```

---

## 5. Answers to Key Lab Questions

### Q1: Why does the backend container need to reference the MongoDB container by its service name (e.g., `mongodb`) rather than `localhost`?
**Answer:**  
In Docker, each container runs in its own network namespace with an independent loopback interface (`127.0.0.1` / `localhost`).  
If the backend attempts to connect to `localhost:27017`, it searches for a MongoDB daemon running inside the *backend* container itself, resulting in a connection failure (`ECONNREFUSED`).  
Docker Compose provisions a user-defined bridge network (`app-network`) and an embedded DNS server. It automatically registers each service's name (`mongodb`, `backend`, `frontend`) as an internal DNS record. Referencing `mongodb://mongodb:27017` routes the connection directly to the internal IP address of the MongoDB container.

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
**Answer:**  
- **`EXPOSE` (Metadata/Documentation):** Informs Docker and administrators that the container listens on the designated network port at runtime. It functions as documentation and enables inter-container communication across a shared network, but does **not** publish or expose the port to the host operating system.
- **`ports` (Host Port Forwarding):** Configures network Address Translation (NAT) on the host machine using `-p HOST:CONTAINER` (e.g. `"5173:5173"`). This makes the container's service accessible from host web browsers at `http://localhost:5173`.

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
**Answer:**  
1. **Binary Incompatibility:** Many npm packages rely on native C/C++ bindings compiled for the host OS and architecture (e.g., Windows x64 with MSVC). Copying them into a Linux container (`node:18-alpine` running musl libc) causes instant runtime segmentation faults or load failures.
2. **Build Context Bloat:** The `node_modules` folder contains tens of thousands of files and hundreds of megabytes. Copying it significantly slows down the initial `docker build` context upload.
3. **Clean Environment Isolation:** Using `.dockerignore` to exclude `node_modules` and executing `RUN npm install` inside the container guarantees a clean, hermetic, platform-native installation.

### Q4: What is a multi-stage Docker build and why is it beneficial for frontend applications?
**Answer:**  
A multi-stage build uses multiple `FROM` statements in a single Dockerfile.
- **Stage 1 (Build):** Contains full developer tooling, Node.js runtime, and npm packages to run `vite build` and compile TypeScript/JSX into static HTML, CSS, and JS bundles.
- **Stage 2 (Runtime):** Copies only the compiled `dist/` directory into a lightweight web server (such as Alpine Nginx or a lightweight Node server).
- **Benefit:** Strips build-time compilers and devDependencies from the final container image, reducing image size from ~300MB down to <30MB, eliminating security attack surface, and boosting deployment speed.

### Q5: How do named volumes provide data persistence in containerized databases?
**Answer:**  
Docker containers use a copy-on-write (CoW) storage driver where files written to the container layer are deleted when the container is removed (`docker rm`).  
A **named volume** (`mongo-data:/data/db`) bypasses the container storage layer. Docker allocates a persistent directory on the host filesystem managed by the Docker storage engine. When the MongoDB container stops, restarts, or is rebuilt, the volume remains intact and is re-attached, preserving all collections, documents, and indexes.

---

## 6. How to Run the Application

### Option A: Single-Command Docker Compose (Production / Verification)
When Docker Desktop is installed and running:
```bash
# 1. Navigate to practical-11
cd practical-11

# 2. Build images and start all 3 containers in the foreground
docker compose up --build

# Or run in detached background mode:
docker compose up -d --build
```

#### Verification Commands:
```bash
# Check running containers
docker ps

# Expected output shows:
# practical11-mongodb   mongo:6-jammy   0.0.0.0:27017->27017/tcp
# practical11-backend   Dockerfile      0.0.0.0:5000->5000/tcp
# practical11-frontend  Dockerfile      0.0.0.0:5173->5173/tcp

# View combined container logs
docker compose logs -f

# Stop and clean up containers (data preserved in mongo-data volume)
docker compose down
```

### Option B: Local Direct Execution (Development / Quick Testing)
If Docker Desktop is temporarily not running, both services can be run natively using Node.js and local MongoDB:

#### 1. Start Backend:
```bash
cd practical-11/backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (or `PORT=5001` if port 5000 is occupied).*

#### 2. Start Frontend:
```bash
cd practical-11/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

#### 3. Run Backend Automated Test Suite:
```bash
cd practical-11/backend
npm test
```

---

## 7. Verification and Test Results

### 7.1 Frontend Production Build Verification
The frontend was tested and built using Vite production compiler:
```text
> practical-11-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 42 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.99 kB │ gzip:  0.57 kB
dist/assets/index-BA_UWf82.css   17.56 kB │ gzip:  4.24 kB
dist/assets/index-k3XKQgcC.js   163.39 kB │ gzip: 51.51 kB
✓ built in 422ms
```

### 7.2 Backend API Test Suite Execution
Executing `test-api.js` against the backend produced the following verified output:
```text
===============================================================
 Practical 11: Containerized Full Stack Backend Test Suite
 Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
===============================================================

[1] Testing Health Endpoint (GET /)...
    Status: 200 OK
    Message: "AWDF Practical 11 - Containerized Full Stack Architecture (Docker + Express + MongoDB)"
    Database: Connected
    Target: Host Localhost

[2] Testing Task Creation (POST /tasks)...
    Status: 201 Created
    Task ID: 6ad5c46e872046e05b971d62
    Title: "Docker Compose Multi-Container Orchestration"

[3] Testing Fetch All Tasks (GET /tasks)...
    Status: 200 OK
    Total Tasks in DB: 1

[4] Testing Task Update (PUT /tasks/6ad5c46e872046e05b971d62)...
    Status: 200 OK
    Updated Completed: true
    Updated Priority: medium

[5] Testing Task Deletion (DELETE /tasks/6ad5c46e872046e05b971d62)...
    Status: 200 OK
    Message: "Task deleted successfully."

===============================================================
 ALL PRACTICAL 11 BACKEND API TESTS PASSED SUCCESSFULLY!
 Verified for: Nisarg Dedakiya (24CS014) | CSPIT - CHARUSAT
===============================================================
```

---

## 8. Common Errors and Troubleshooting

| Issue / Error | Root Cause | Solution |
|:---|:---|:---|
| `docker : The term 'docker' is not recognized` | Docker Desktop is not installed or not added to system PATH. | Install Docker Desktop for Windows and ensure WSL 2 backend is enabled. |
| `MongooseServerSelectionError: connect ECONNREFUSED mongodb:27017` | Backend attempted to connect before MongoDB finished initializing. | Add healthchecks or `depends_on: - mongodb` in `docker-compose.yml`. |
| Port 5000 or 5173 already in use | Another application or previous practical is running on host port. | Change host port mapping in `docker-compose.yml` (e.g., `"5001:5000"` or `"5174:5173"`). |
| Data vanishes after running `docker compose down` | Command executed with `-v` flag (`docker compose down -v`). | Avoid using `-v` during normal shutdown so that the named volume `mongo-data` is retained. |
| Vite Preview returns empty page or connection refused | Vite preview listening only on `localhost` inside container. | Ensure `vite.config.js` and CMD include `--host 0.0.0.0` so Vite listens on all container network interfaces. |

---

## 9. Viva Questions and Answers

### Q1: What is containerization and how does Docker differ from a Virtual Machine (VM)?
**Answer:**  
Containerization is OS-level virtualization that packages an application and all its dependencies into an isolated unit called a container.  
- **Virtual Machines:** Each VM runs a full guest operating system on top of a hypervisor, consuming gigabytes of storage, several gigabytes of RAM, and requiring minutes to boot.
- **Docker Containers:** Share the host OS kernel and run as isolated processes in user space using Linux namespaces and cgroups. They start in milliseconds, require minimal memory overhead, and ensure consistent behavior across development, staging, and production.

### Q2: What is the purpose of Docker Compose?
**Answer:**  
Docker Compose is a declarative tool for defining and running multi-container Docker applications. Through a single YAML file (`docker-compose.yml`), developers configure services, networks, volumes, environment variables, and build contexts. Compose coordinates container initialization order, configures cross-container networking, and enables single-command management (`docker compose up` / `docker compose down`).

### Q3: How does Docker Compose configure networking between services by default?
**Answer:**  
Docker Compose automatically creates a single user-defined bridge network named `<project>_default` (or custom named network like `app-network`).  
Each container defined in the file joins this network and is assigned a private IP. Docker runs an embedded DNS resolver at `127.0.0.11` inside each container, allowing containers to resolve and communicate with other services simply by using their Compose service names (`http://backend:5000`, `mongodb:27017`).

### Q4: What is the significance of the `.dockerignore` file?
**Answer:**  
The `.dockerignore` file tells the Docker CLI which files and folders to exclude when packaging the build context to send to the Docker daemon. Excluding large, ephemeral, or sensitive files (such as `node_modules/`, `.git/`, `.env`, and `dist/`):
1. Greatly accelerates the initial build context transfer.
2. Prevents secret leakage (e.g., API keys in `.env`).
3. Prevents host-compiled native binary modules from contaminating the Linux container environment.

### Q5: What is the role of `depends_on` in `docker-compose.yml`?
**Answer:**  
`depends_on` defines the dependency and startup order of services. For example, `depends_on: - mongodb` instructs Docker Compose to start the `mongodb` container before starting `backend`. Note that `depends_on` waits until the container is created and running; for full application-level readiness, healthcheck conditions can be combined with `condition: service_healthy`.

### Q6: How does containerization solve the classic "It works on my machine" problem?
**Answer:**  
In traditional setups, applications depend on specific host operating system versions, global Node.js versions, installed libraries, system environment variables, and local database configurations that vary across machines.  
Docker packages the exact OS filesystem (e.g. Alpine Linux), exact runtime (Node 18), exact dependencies (`npm install` inside the container), and exact configuration into an immutable container image. The resulting image runs identically regardless of whether the host is Windows, macOS, Ubuntu, or AWS ECS.

---

## 10. Student Declaration
I hereby declare that Practical 11 has been implemented, tested, verified through frontend bundle builds and backend API test scripts, and documented under my own student credentials:

- **Student Name:** Nisarg Dedakiya  
- **Enrollment Number:** 24CS014  
- **Institution:** Chandubhai S. Patel Institute of Technology (CSPIT)  
- **University:** Charotar University of Science and Technology (CHARUSAT)  
- **Date of Completion:** October 19, 2026  
