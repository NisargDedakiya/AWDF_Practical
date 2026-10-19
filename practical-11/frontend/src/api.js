/**
 * Centralized API Client for Practical 11 Containerized Architecture
 * Handles all HTTP communication with the Express/MongoDB backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
 * Optional query: { completed?: boolean, priority?: string }
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
  const response = await fetch(`${BASE_URL}/tasks${query}`);
  const result = await handleResponse(response);
  return result.data || [];
}

/**
 * Fetch a single task by ID
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`);
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Create a new task in MongoDB
 * @param {Object} taskData - { title, description, priority, completed }
 */
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
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
 * @param {string} id - Task MongoDB ObjectId
 * @param {Object} updates - Fields to update
 */
export async function updateTask(id, updates) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
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
 * @param {string} id - Task MongoDB ObjectId
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  const response = await fetch(`${BASE_URL}/`);
  return await handleResponse(response);
}
