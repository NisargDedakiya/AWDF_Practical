require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const taskEvents = require('./events');
const { notificationLog } = require('./listeners'); // Registers event listeners

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical10';

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve static interactive UI dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public')));

// Request logger with timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Database connection
if (process.env.NODE_ENV !== 'test-unit') {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(`MongoDB connected successfully to: ${MONGO_URI}`);
    })
    .catch((err) => {
      console.warn(`MongoDB connection error: ${err.message}`);
    });
}

// ==========================================
// 1. Root & Diagnostic Endpoints
// ==========================================

// GET / - Root API Status & Student Details
app.get('/', (req, res) => {
  // If request comes from a browser wanting HTML, provide link or serve dashboard
  if (req.accepts('html') && !req.xhr && !req.headers['content-type']?.includes('json')) {
    return res.redirect('/dashboard');
  }

  res.json({
    message: 'Practical 10: Asynchronous Processing with Event-Driven Architecture',
    student: {
      name: 'Nisarg Dedakiya',
      rollNo: '24CS014',
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Chandubhai S. Patel Institute of Technology (CSPIT)',
      university: 'Charotar University of Science and Technology (CHARUSAT)',
      course: 'ITUE301: Advanced Web Development Frameworks (AWDF)'
    },
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    eventEmitter: 'Active (Native Node.js EventEmitter)',
    notificationDelayMs: parseInt(process.env.NOTIFICATION_DELAY_MS, 10) || 1500,
    dashboardUrl: `http://localhost:${PORT}/dashboard`,
    endpoints: {
      getTasks: 'GET /tasks',
      createTask: 'POST /tasks (Emits task-created via setImmediate)',
      deleteTask: 'DELETE /tasks/:id (Emits task-deleted via setImmediate)',
      notifications: 'GET /notifications (View async background logs & timestamps)',
      simulateError: 'POST /simulate-error (Verifies error event listener safety)'
    }
  });
});

// GET /notifications - Query background processed notifications
app.get('/notifications', (req, res) => {
  res.json({
    success: true,
    count: notificationLog.length,
    data: notificationLog
  });
});

// POST /simulate-error - Trigger error event test to confirm fault-tolerance
app.post('/simulate-error', (req, res) => {
  const triggerTimestamp = new Date().toISOString();
  res.status(200).json({
    success: true,
    message: 'Emitting test error event to verify fault-tolerant error listener.',
    triggerTimestamp
  });

  setImmediate(() => {
    taskEvents.emit('error', new Error('Simulated Background Listener Error - Fault Tolerance Verified'));
  });
});

// ==========================================
// 2. Task Routes with Asynchronous EventEmitter
// ==========================================

// GET /tasks - Retrieve all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create task and trigger non-blocking asynchronous event
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required.'
      });
    }

    // 1. Save task to MongoDB
    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      completed: false
    });

    const responseTimestamp = new Date().toISOString();
    console.log(`[API RESPONSE SENT] Response 201 sent at ${responseTimestamp} for Task ID: ${newTask._id}`);

    // 2. Respond IMMEDIATELY to client (non-blocking, <15ms)
    res.status(201).json({
      success: true,
      message: 'Task created successfully. Background notification queued.',
      responseTimestamp,
      data: newTask
    });

    // 3. Emit event asynchronously on next event loop tick AFTER response is sent
    setImmediate(() => {
      taskEvents.emit('task-created', newTask);
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete task and trigger task-deleted event
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

    const responseTimestamp = new Date().toISOString();
    console.log(`[API RESPONSE SENT] Delete Response 200 sent at ${responseTimestamp} for Task ID: ${id}`);

    // 1. Respond immediately to the client
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully. Deletion event emitted.',
      responseTimestamp,
      data: deletedTask
    });

    // 2. Emit task-deleted event asynchronously
    setImmediate(() => {
      taskEvents.emit('task-deleted', { id, title: deletedTask.title });
    });

  } catch (error) {
    next(error);
  }
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('===============================================');
    console.log(' Practical 10 Server is Running!');
    console.log(` Student: Nisarg Dedakiya (24CS014) | CHARUSAT`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Web Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(` Native EventEmitter: Active (setImmediate non-blocking)`);
    console.log(` MongoDB Target: ${MONGO_URI}`);
    console.log('===============================================');
  });
}

module.exports = app;
