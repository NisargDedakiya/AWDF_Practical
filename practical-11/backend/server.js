require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical11';

// ==========================================
// 1. Built-in and Third-party Middleware
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// 2. Request Logging Middleware (Global)
// ==========================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 3. Connect to MongoDB via Mongoose ODM
// ==========================================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(` MongoDB connected successfully to: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(` MongoDB connection warning: ${err.message}`);
    console.warn(`(When running in Docker, ensure mongo service is healthy; when running locally, start MongoDB service on 27017)`);
  });

// ==========================================
// 4. Content-Type Validator Middleware
// ==========================================
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
// 5. Root / Health Route
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: 'AWDF Practical 11 - Containerized Full Stack Architecture (Docker + Express + MongoDB)',
    status: 'Running',
    student: {
      name: 'Nisarg Dedakiya',
      rollNo: '24CS014',
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Chandubhai S. Patel Institute of Technology (CSPIT)',
      university: 'Charotar University of Science and Technology (CHARUSAT)',
      course: 'ITUE301: Advanced Web Development Frameworks (AWDF)'
    },
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    containerTarget: MONGO_URI.includes('mongodb://mongodb') ? 'Docker Bridge Network (Internal DNS)' : 'Host Localhost',
    endpoints: {
      getAllTasks: 'GET /tasks',
      getTaskById: 'GET /tasks/:id',
      createTask: 'POST /tasks',
      updateTask: 'PUT /tasks/:id',
      deleteTask: 'DELETE /tasks/:id'
    }
  });
});

// ==========================================
// 6. CRUD Routes for Tasks
// ==========================================

// GET /tasks - Fetch all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }
    if (req.query.priority) {
      filter.priority = req.query.priority.toLowerCase();
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id - Fetch task by ID
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task ID format: '${id}'`
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with id '${id}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task
app.post('/tasks', validateContentType, async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required and cannot be empty.'
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      completed: Boolean(completed)
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update existing task
app.put('/tasks/:id', validateContentType, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task ID format: '${id}'`
      });
    }

    const updates = {};
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Task title cannot be empty.'
        });
      }
      updates.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description.trim();
    }

    if (req.body.completed !== undefined) {
      updates.completed = Boolean(req.body.completed);
    }

    if (req.body.priority !== undefined) {
      updates.priority = req.body.priority;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with id '${id}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task ID format: '${id}'`
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with id '${id}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 7. 404 Route Handler for undefined endpoints
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// ==========================================
// 8. Global Centralized Error-Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// ==========================================
// 9. Start Server
// ==========================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Practical 11 Backend Server is Running!`);
    console.log(` Student: Nisarg Dedakiya (24CS014) | CHARUSAT`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` MongoDB Target: ${MONGO_URI}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
