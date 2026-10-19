require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const cache = require('./cache');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical9';

app.use(cors());
app.use(express.json());

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
// 1. Root & Cache Debug Endpoints
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: 'Practical 09: In-Memory Caching and Query Optimization (node-cache)',
    student: {
      name: 'Nisarg Dedakiya',
      rollNo: '24CS014',
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Chandubhai S. Patel Institute of Technology (CSPIT)',
      university: 'Charotar University of Science and Technology (CHARUSAT)',
      course: 'ITUE301: Advanced Web Development Frameworks (AWDF)'
    },
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cacheEngine: 'node-cache',
    ttlSeconds: parseInt(process.env.CACHE_TTL, 10) || 60,
    endpoints: {
      getTasks: 'GET /tasks (Cached, supports ?noCache=true)',
      getTaskById: 'GET /tasks/:id (Cached, supports ?noCache=true)',
      createTask: 'POST /tasks (Invalidates Cache)',
      updateTask: 'PUT /tasks/:id (Invalidates Cache)',
      deleteTask: 'DELETE /tasks/:id (Invalidates Cache)',
      cacheStats: 'GET /cache-stats (Debug Metrics & Hit Ratio)',
      flushCache: 'DELETE /cache (Manually Flush Cache)'
    }
  });
});

// GET /cache-stats - Debug metrics endpoint
app.get('/cache-stats', (req, res) => {
  res.json({
    success: true,
    data: cache.getStats()
  });
});

// DELETE /cache - Manually flush cache for benchmark testing
app.delete('/cache', (req, res) => {
  cache.flush();
  res.json({
    success: true,
    message: 'Cache flushed successfully.'
  });
});

// ==========================================
// 2. Cached Tasks Endpoints
// ==========================================

// GET /tasks - Fetch all tasks with In-Memory Caching
app.get('/tasks', async (req, res, next) => {
  try {
    const bypassCache = req.query.noCache === 'true';
    const cacheKey = 'all_tasks';

    // 1. Check Cache first (unless explicitly bypassed)
    if (!bypassCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json({
          success: true,
          source: 'cache (HIT)',
          count: cachedData.length,
          data: cachedData
        });
      }
    }

    // 2. Cache MISS: Query MongoDB
    const tasks = await Task.find().sort({ createdAt: -1 });

    // 3. Store result in cache
    if (!bypassCache) {
      cache.set(cacheKey, tasks);
    }

    res.set('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.status(200).json({
      success: true,
      source: bypassCache ? 'database (BYPASS)' : 'database (MISS)',
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id - Single-task endpoint with separate caching key
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid task ID format: '${id}'`
      });
    }

    const bypassCache = req.query.noCache === 'true';
    const cacheKey = `task_${id}`;

    // 1. Check cache
    if (!bypassCache) {
      const cachedTask = cache.get(cacheKey);
      if (cachedTask) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json({
          success: true,
          source: 'cache (HIT)',
          data: cachedTask
        });
      }
    }

    // 2. Query MongoDB
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with id '${id}' not found.`
      });
    }

    // 3. Store in cache
    if (!bypassCache) {
      cache.set(cacheKey, task);
    }

    res.set('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.status(200).json({
      success: true,
      source: bypassCache ? 'database (BYPASS)' : 'database (MISS)',
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create task & Invalidate Cache
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required.'
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      completed: Boolean(completed)
    });

    // Invalidate all-tasks cache so stale data is never served
    cache.del('all_tasks');

    res.status(201).json({
      success: true,
      message: 'Task created successfully and cache invalidated.',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update task & Invalidate Cache
app.put('/tasks/:id', async (req, res, next) => {
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

    // Invalidate both all_tasks cache and the single-task cache
    cache.del('all_tasks');
    cache.del(`task_${id}`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully and cache invalidated.',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete task & Invalidate Cache
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

    // Invalidate cache
    cache.del('all_tasks');
    cache.del(`task_${id}`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully and cache invalidated.',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Practical 09 Caching Server is Running!`);
    console.log(` Student: Nisarg Dedakiya (24CS014) | CHARUSAT`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Node-Cache TTL: ${process.env.CACHE_TTL || 60} seconds`);
    console.log(` MongoDB Target: ${MONGO_URI}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
