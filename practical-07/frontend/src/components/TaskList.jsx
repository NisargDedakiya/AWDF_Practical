import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

export default function TaskList({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        completed: false
      });
      setTasks([newTask, ...tasks]);
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (taskId, currentCompleted) => {
    try {
      const updated = await updateTask(taskId, { completed: !currentCompleted });
      setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="task-container">
      {/* Top Navbar */}
      <div className="navbar">
        <div>
          <h3>Task Manager</h3>
          <p className="user-greeting">Logged in as: <strong>{user?.name || user?.email}</strong> ({user?.email})</p>
        </div>
        <button onClick={onLogout} className="btn-logout" type="button">
          Logout
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Task Creation Form */}
      <div className="card">
        <h4>Create New Task</h4>
        <form onSubmit={handleAddTask} className="add-task-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      {/* Tasks List Table */}
      <div className="card">
        <h4>Your Tasks ({tasks.length})</h4>

        {loading ? (
          <p>Loading tasks from database...</p>
        ) : tasks.length === 0 ? (
          <p className="no-tasks">No tasks found. Create one above.</p>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Done</th>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th style={{ width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className={task.completed ? 'completed-row' : ''}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggle(task._id, task.completed)}
                    />
                  </td>
                  <td>
                    <span className={task.completed ? 'strike' : ''}>
                      {task.title}
                    </span>
                  </td>
                  <td>{task.description || '-'}</td>
                  <td>
                    <span className={`priority-tag tag-${task.priority}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
