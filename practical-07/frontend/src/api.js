/**
 * Practical 07: Centralized API Client
 * Manages JWT tokens, Authorization headers, and 401 redirects
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token helpers
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

/**
 * Common request wrapper with Authorization header injection
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (response.status === 401) {
    // Supplementary requirement: Token expiry / unauthorized handling
    removeToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    const errorMsg = data?.error || 'Session expired. Please log in again.';
    throw new Error(errorMsg);
  }

  if (!response.ok) {
    const errorMsg = data?.error || (data?.details ? data.details.join(', ') : `Error ${response.status}`);
    throw new Error(errorMsg);
  }

  return data;
}

// Auth API Calls
export async function registerUser(name, email, password) {
  const result = await request('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  if (result.token) setToken(result.token);
  return result;
}

export async function loginUser(email, password) {
  const result = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (result.token) setToken(result.token);
  return result;
}

export async function getMe() {
  return await request('/me');
}

// Protected Task API Calls
export async function getTasks() {
  const result = await request('/tasks');
  return result.data || [];
}

export async function createTask(taskData) {
  const result = await request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
  return result.data;
}

export async function updateTask(id, updates) {
  const result = await request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return result.data;
}

export async function deleteTask(id) {
  const result = await request(`/tasks/${id}`, {
    method: 'DELETE'
  });
  return result.data;
}
