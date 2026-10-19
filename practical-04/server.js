const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. Built-in and Third-party Middleware
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// 2. Request Logging Middleware (Global)
// ==========================================
// Logs HTTP method, URL, and timestamp for every incoming request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 3. Supplementary Middleware: Content-Type Validator
// ==========================================
// Rejects POST and PUT requests missing Content-Type: application/json
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: "Invalid Content-Type. Header must be 'application/json'."
      });
    }
  }
  next();
};

// ==========================================
// 4. Supplementary Middleware: Task ID Format Validator
// ==========================================
// Validates that :id parameter is a positive integer before hitting controller
const validateTaskId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Task ID format. ID must be a positive integer.'
    });
  }
  req.taskId = id;
  next();
};

// ==========================================
// 5. In-Memory Task Data Store
// ==========================================
let tasks = [
  {
    id: 1,
    title: 'Complete Practical 1',
    description: 'Build Student Portfolio with Vite and React components (Nisarg Dedakiya - 24CS014)',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Complete Practical 2',
    description: 'Implement React Router multi-page navigation and useState forms',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Complete Practical 3',
    description: 'Integrate GitHub REST API with loading and error states',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Complete Practical 4',
    description: 'Build Node.js Express Task Management REST API with middleware pipeline',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

let nextId = 5;

// ==========================================
// 6. REST API Routes
// ==========================================

// Welcome / Info Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management REST API - Practical 4',
    student: {
      name: 'Nisarg Dedakiya',
      rollNo: '24CS014',
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Chandubhai S. Patel Institute of Technology (CSPIT)',
      university: 'Charotar University of Science and Technology (CHARUSAT)',
      course: 'ITUE301: Advanced Web Development Frameworks'
    },
    endpoints: [
      'GET /tasks - Get all tasks',
      'GET /tasks/:id - Get task by ID',
      'POST /tasks - Create a new task',
      'PUT /tasks/:id - Update an existing task',
      'DELETE /tasks/:id - Delete a task',
      'GET /test-error - Trigger deliberate error for global handler verification'
    ]
  });
});

// GET /tasks - Get all tasks (HTTP 200)
app.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// GET /tasks/:id - Get a specific task by ID (HTTP 200 or 404)
app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${req.taskId} not found.`
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// POST /tasks - Create a new task (HTTP 201)
app.post('/tasks', validateContentType, (req, res) => {
  const { title, description, completed } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Task title is required and cannot be empty.'
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: Boolean(completed),
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: newTask
  });
});

// PUT /tasks/:id - Update an existing task (HTTP 200 or 404)
app.put('/tasks/:id', validateTaskId, validateContentType, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${req.taskId} not found.`
    });
  }

  const { title, description, completed } = req.body || {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title cannot be an empty string.'
      });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    tasks[taskIndex].description = description.trim();
  }

  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }

  tasks[taskIndex].updatedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: `Task ${req.taskId} updated successfully.`,
    data: tasks[taskIndex]
  });
});

// DELETE /tasks/:id - Delete a task (HTTP 200 or 404)
app.delete('/tasks/:id', validateTaskId, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${req.taskId} not found.`
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  res.status(200).json({
    success: true,
    message: `Task ${req.taskId} deleted successfully.`,
    data: deletedTask
  });
});

// Route to simulate an unhandled server error for testing the global error handler
app.get('/test-error', (req, res, next) => {
  next(new Error('Deliberate test error for verifying global error handler'));
});

// ==========================================
// 7. Supplementary: 404 Handler for Undefined Routes
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url} - Endpoint not found.`
  });
});

// ==========================================
// 8. Global Error Handling Middleware (Last in pipeline)
// ==========================================
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error: Something went wrong.',
    message: err.message
  });
});

// Start Server when invoked directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`Task Manager API running at http://localhost:${PORT}`);
    console.log(`Student: Nisarg Dedakiya (24CS014) | Practical 4`);
    console.log(`Course: ITUE301 - AWDF | CHARUSAT`);
    console.log(`===============================================`);
  });
}

module.exports = app;
