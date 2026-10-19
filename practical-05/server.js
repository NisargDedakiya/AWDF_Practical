require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical5';

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
    console.log(`MongoDB connected successfully to: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(`MongoDB connection warning: ${err.message}`);
    console.warn(`(Ensure MongoDB is running locally or provide valid MONGO_URI in .env)`);
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
// 5. REST API Routes (Mongoose ODM CRUD)
// ==========================================

// Welcome / API Documentation Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management MongoDB REST API - Practical 5',
    student: {
      name: 'Nisarg Dedakiya',
      rollNo: '24CS014',
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Chandubhai S. Patel Institute of Technology (CSPIT)',
      university: 'Charotar University of Science and Technology (CHARUSAT)',
      course: 'ITUE301: Advanced Web Development Frameworks'
    },
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting / Offline',
    endpoints: [
      'GET /tasks - Get all tasks from MongoDB',
      'GET /tasks/:id - Get single task by ID with 404 handling',
      'POST /tasks - Create task with Mongoose schema validation',
      'PUT /tasks/:id - Update task with validators enabled',
      'DELETE /tasks/:id - Delete task from MongoDB'
    ]
  });
});

// GET /tasks - Fetch all tasks from MongoDB
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Fetch single task by ID with 404 handling
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found (Invalid ObjectId format).`
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create task in MongoDB with schema validation & pre-save hook
app.post('/tasks', validateContentType, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body || {};

    const newTask = await Task.create({
      title,
      description,
      completed,
      priority
    });

    res.status(201).json({
      success: true,
      message: 'Task created and stored in MongoDB successfully.',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update task with Mongoose runValidators
app.put('/tasks/:id', validateContentType, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found (Invalid ObjectId format).`
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully in MongoDB.',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Remove task from MongoDB
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found (Invalid ObjectId format).`
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully from MongoDB.',
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. 404 Handler for Undefined Routes
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url} - Endpoint not found.`
  });
});

// ==========================================
// 7. Structured Global Error Handling Middleware
// ==========================================
// Converts Mongoose ValidationErrors and CastErrors into clean, structured JSON responses
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.message || err);

  // Mongoose Validation Error (e.g. required title missing or priority enum invalid)
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Schema Validation Failed',
      details: errorDetails
    });
  }

  // Mongoose Cast Error (invalid ObjectId parameter)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid value '${err.value}' for field '${err.path}'.`
    });
  }

  // Fallback for general internal server error
  res.status(500).json({
    success: false,
    error: 'Internal Server Error: Something went wrong.',
    message: err.message
  });
});

// ==========================================
// 8. Server Boot
// ==========================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Task Manager API running at http://localhost:${PORT}`);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);
    console.log(`Student: Nisarg Dedakiya (24CS014) | Practical 5`);
    console.log(`====================================================`);
  });
}

module.exports = app;
