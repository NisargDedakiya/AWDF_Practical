require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Task = require('./models/Task');
const authMiddleware = require('./middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateTask
} = require('./middleware/validate');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical7';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_practical7_awdf_24cs014';

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB connected successfully to: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(`MongoDB connection error: ${err.message}`);
  });

// ==========================================
// 1. Root & Health Check
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: 'Practical 7 API: Authentication and Middleware Pipeline',
    status: 'Running',
    student: {
      name: 'Nisarg Dedakiya',
      rollNo: '24CS014',
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Chandubhai S. Patel Institute of Technology (CSPIT)',
      university: 'Charotar University of Science and Technology (CHARUSAT)',
      course: 'ITUE301: Advanced Web Development Frameworks'
    },
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      me: 'GET /me (Protected)',
      tasks: 'GET, POST /tasks (Protected)',
      taskById: 'PUT, DELETE /tasks/:id (Protected)'
    }
  });
});

// ==========================================
// 2. Authentication Routes
// ==========================================

// POST /register - Register a new user
app.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt (cost factor 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /login - User login and JWT issue
app.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /me - Return currently logged in user details
app.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. Protected Task Routes (User-specific)
// ==========================================

// GET /tasks - Fetch tasks belonging to logged-in user
app.get('/tasks', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task for logged-in user
app.post('/tasks', authMiddleware, validateTask, async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      completed: Boolean(completed),
      user: req.user.id
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

// PUT /tasks/:id - Update task belonging to logged-in user
app.put('/tasks/:id', authMiddleware, validateTask, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task ID format: '${id}'`
      });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.completed !== undefined) updates.completed = Boolean(req.body.completed);
    if (req.body.priority !== undefined) updates.priority = req.body.priority;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or you do not have permission to modify it.'
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

// DELETE /tasks/:id - Delete task belonging to logged-in user
app.delete('/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task ID format: '${id}'`
      });
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or you do not have permission to delete it.'
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

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

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Practical 07 Backend Server is running on http://localhost:${PORT}`);
    console.log(`Connected to MongoDB Target: ${MONGO_URI}`);
    console.log(`Student: Nisarg Dedakiya (24CS014) | CHARUSAT`);
  });
}

module.exports = app;
