require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Task = require('./models/Task');

/**
 * Practical 13: AI API Integration into a Web Application
 * Student: Nisarg Dedakiya (24CS014)
 * Institution: CHARUSAT - CSPIT CSE
 */

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical13';

// Initialize AI Providers
const geminiApiKey = process.env.GEMINI_API_KEY;
const hasGemini = Boolean(
  geminiApiKey &&
  geminiApiKey.trim() !== '' &&
  geminiApiKey !== 'your_gemini_api_key_here' &&
  geminiApiKey !== 'mock_or_demo_key'
);

const openaiApiKey = process.env.OPENAI_API_KEY;
let openai = null;
if (openaiApiKey && openaiApiKey !== 'your_openai_api_key_here' && openaiApiKey !== 'mock_or_demo_key') {
  openai = new OpenAI({ apiKey: openaiApiKey });
}

app.use(cors());
app.use(express.json());

// Request logging middleware
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
    console.warn(`MongoDB connection warning: ${err.message}`);
  });

// Simple in-memory rate limiting map (Supplementary requirement: 1 request every 3s per IP)
const lastRequestTime = new Map();

// Helper: Contextual intelligent fallback description generator
function getFallbackDescription(title) {
  const lower = title.toLowerCase();
  if (lower.includes('auth') || lower.includes('login') || lower.includes('register') || lower.includes('jwt')) {
    return 'Implement user authentication with input validation, password encryption, and session/token management.';
  }
  if (lower.includes('test') || lower.includes('ci') || lower.includes('pipeline') || lower.includes('workflow')) {
    return 'Write automated unit and integration tests to verify functionality and ensure continuous quality delivery.';
  }
  if (lower.includes('docker') || lower.includes('container') || lower.includes('deploy') || lower.includes('nginx')) {
    return 'Containerize application components and configure orchestration for scalable and reproducible deployment.';
  }
  if (lower.includes('database') || lower.includes('mongo') || lower.includes('schema') || lower.includes('crud')) {
    return 'Design data schemas, establish indexes, and implement robust query optimization and persistence logic.';
  }
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('route') || lower.includes('backend')) {
    return 'Develop RESTful endpoints with input sanitization, consistent status codes, and comprehensive error handling.';
  }
  if (lower.includes('ui') || lower.includes('frontend') || lower.includes('component') || lower.includes('react')) {
    return 'Build responsive, accessible user interface components with fluid state management and seamless user feedback.';
  }
  return `Plan, implement, and verify all requirements for "${title}" with proper error handling and clean documentation.`;
}

// ==========================================
// 1. Root & Status
// ==========================================
app.get('/', (req, res) => {
  let providerName = 'Contextual Fallback Engine (Active)';
  if (hasGemini) {
    providerName = 'Google Gemini (gemini-flash-latest)';
  } else if (openai) {
    providerName = 'OpenAI (gpt-4o-mini)';
  }

  res.json({
    message: 'Practical 13: AI API Integration into a Web Application',
    student: 'Nisarg Dedakiya (24CS014)',
    institution: 'CHARUSAT - CSPIT CSE',
    aiProvider: providerName,
    endpoints: {
      generateDescription: 'POST /api/ai/generate-description',
      tasks: 'GET, POST /tasks',
      taskById: 'PUT, DELETE /tasks/:id'
    }
  });
});

// ==========================================
// 2. AI Description Generation Endpoint
// ==========================================
app.post('/api/ai/generate-description', async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Task title is required to generate an AI description.'
    });
  }

  // Rate Limiting (Supplementary Requirement: 1 request every 3s per IP/client)
  const clientKey = req.ip || 'anonymous';
  const now = Date.now();
  if (lastRequestTime.has(clientKey) && now - lastRequestTime.get(clientKey) < 3000) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a few seconds before requesting AI suggestions again.'
    });
  }
  lastRequestTime.set(clientKey, now);

  // 1. Try Google Gemini API if GEMINI_API_KEY is configured
  if (hasGemini) {
    try {
      const prompt = `You are a helpful project manager. Write a concise, 1-2 sentence actionable task description based on this task title: "${title.trim()}". Return only the description text without quotation marks or bullet points.`;

      const modelsToTry = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-2.5-flash'];
      let generatedText = null;
      let usedModel = 'gemini-flash-latest';

      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey.trim()}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            })
          });

          const data = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            generatedText = data.candidates[0].content.parts[0].text.trim();
            usedModel = model;
            break;
          }
        } catch (innerErr) {
          // Try next model if any network or response error
        }
      }

      if (generatedText) {
        return res.status(200).json({
          success: true,
          description: generatedText,
          source: `Google Gemini (${usedModel})`,
          fallback: false,
          disclaimer: 'AI-generated suggestion. Please review and edit before saving.'
        });
      }
    } catch (geminiError) {
      console.warn('Google Gemini API call failed or quota reached:', geminiError.message);
      console.log('Falling back gracefully to contextual description generator...');
      // Fall through to fallback below
    }
  }

  // 2. Try OpenAI API if OpenAI client is configured
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful project manager. Write a concise, 1-2 sentence actionable task description based on the user\'s task title.'
          },
          {
            role: 'user',
            content: `Write a short task description for: "${title.trim()}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const generatedText = completion.choices[0]?.message?.content?.trim();

      if (generatedText) {
        return res.status(200).json({
          success: true,
          description: generatedText,
          source: 'OpenAI (gpt-4o-mini)',
          fallback: false,
          disclaimer: 'AI-generated suggestion. Please review and edit before saving.'
        });
      }
    } catch (apiError) {
      console.warn('OpenAI API call failed or quota exceeded:', apiError.message);
      console.log('Falling back gracefully to contextual description generator...');
      // Fall through to graceful degradation below
    }
  }

  // Graceful Degradation / Fallback Path (Step 3 & 6 in Practical 13)
  // App continues working smoothly with high-quality fallback even without external API key!
  const fallbackDesc = getFallbackDescription(title);

  return res.status(200).json({
    success: true,
    description: fallbackDesc,
    source: 'Contextual AI Engine (Graceful Degradation Fallback)',
    fallback: true,
    disclaimer: 'Generated via fallback engine. Please review and edit before saving.'
  });
});

// ==========================================
// 3. Task CRUD Routes
// ==========================================
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium'
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Practical 13 Backend running on http://localhost:${PORT}`);
    console.log(`AI Endpoint available at POST /api/ai/generate-description`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  PORT ${PORT} IS ALREADY IN USE!`);
      console.error(`   Another process (such as Practical 10) is currently running on port ${PORT}.`);
      console.error(`   To free port ${PORT}, run:`);
      console.error(`     npx kill-port ${PORT}`);
      console.error(`   Or terminate the previous terminal running practical-10.`);
      console.error(`   Alternatively, set PORT=5001 in practical-13/backend/.env\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

module.exports = app;
