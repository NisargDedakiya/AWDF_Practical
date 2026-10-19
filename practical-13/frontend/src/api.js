/**
 * Centralized API Client for Practical 13 Full Stack AI Integration
 * Handles all HTTP communication with the Express/MongoDB backend and AI endpoints.
 * Automatically handles dynamic port resolution between 5001 and 5000.
 * Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
 */

let activeBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Robust fetch wrapper that handles dual-port fallback (port 5001 <-> 5000)
 */
async function fetchWithFallback(path, options = {}) {
  try {
    const res = await fetch(`${activeBaseUrl}${path}`, options);
    // If port 5000 returned 404 HTML (e.g. Practical 10 is running there), switch to 5001
    const contentType = res.headers.get('content-type') || '';
    if (res.status === 404 && path.startsWith('/api/ai')) {
      throw new Error('Endpoint not found on current port');
    }
    if (contentType.includes('text/html') && path.startsWith('/api/ai')) {
      throw new Error('Non-JSON response from endpoint');
    }
    return res;
  } catch (err) {
    if (!import.meta.env.VITE_API_URL) {
      const alternatePort = activeBaseUrl.includes('5001') ? '5000' : '5001';
      const alternateUrl = `http://localhost:${alternatePort}`;
      try {
        const altRes = await fetch(`${alternateUrl}${path}`, options);
        if (altRes.ok || altRes.status < 500) {
          activeBaseUrl = alternateUrl;
          return altRes;
        }
      } catch (altErr) {
        // Fall through
      }
    }
    throw err;
  }
}

/**
 * Helper to handle fetch responses and extract meaningful error messages
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.error || (data?.details ? data.details.join(', ') : `HTTP error: ${response.status} ${response.statusText}`);
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetch all tasks from MongoDB
 */
export async function getTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.completed !== undefined && filters.completed !== 'all') {
    params.append('completed', filters.completed);
  }
  if (filters.priority && filters.priority !== 'all') {
    params.append('priority', filters.priority);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithFallback(`/tasks${query}`);
  const result = await handleResponse(response);
  return result.data || [];
}

/**
 * Fetch a single task by ID
 */
export async function getTaskById(id) {
  const response = await fetchWithFallback(`/tasks/${id}`);
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Create a new task in MongoDB
 */
export async function createTask(taskData) {
  const response = await fetchWithFallback('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Update an existing task by ID
 */
export async function updateTask(id, updates) {
  const response = await fetchWithFallback(`/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Delete a task by ID
 */
export async function deleteTask(id) {
  const response = await fetchWithFallback(`/tasks/${id}`, {
    method: 'DELETE'
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Check backend health & AI provider status
 */
export async function checkBackendHealth() {
  const response = await fetchWithFallback('/');
  return await handleResponse(response);
}

/**
 * Practical 13: Generate AI Description using Backend OpenAI/Gemini/Fallback API
 */
export async function generateAiDescription(title) {
  const response = await fetchWithFallback('/api/ai/generate-description', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });
  return await handleResponse(response);
}
