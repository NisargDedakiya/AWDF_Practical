import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  checkBackendHealth
} from './api';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success', duration = 3500) => {
    setToast({ message, type, duration });
  };

  // Check backend health & MongoDB connection
  const checkHealth = useCallback(async () => {
    try {
      const res = await checkBackendHealth();
      setIsConnected(res.database === 'Connected');
    } catch {
      setIsConnected(false);
    }
  }, []);

  // Fetch tasks from MongoDB
  const fetchTasks = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getTasks();
      setTasks(data);
      setIsConnected(true);
      if (showRefreshingState) {
        showToast('Tasks synchronized with MongoDB', 'success');
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.message || 'Failed to connect to backend server. Ensure Express is running on port 5000.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTasks();
    checkHealth();
  }, [fetchTasks, checkHealth]);

  // Handler: Add new task with Optimistic UI update
  const handleAddTask = async (newTaskData) => {
    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      ...newTaskData,
      _id: tempId,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    // Optimistic UI Update: Prepend immediately to state
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const created = await createTask(newTaskData);
      // Replace optimistic placeholder with real MongoDB doc
      setTasks((prev) =>
        prev.map((t) => (t._id === tempId ? created : t))
      );
      showToast(`Task "${created.title}" saved to MongoDB!`, 'success');
      return true;
    } catch (err) {
      console.error('Create task error:', err);
      // Rollback optimistic item on failure
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      showToast(`Failed to create task: ${err.message}`, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Toggle Task Completion with Optimistic UI update
  const handleToggleComplete = async (taskId, nextCompletedState) => {
    setProcessingId(taskId);

    // Save previous state for rollback
    const previousTasks = [...tasks];

    // Optimistically update UI
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, completed: nextCompletedState } : t
      )
    );

    try {
      const updated = await updateTask(taskId, { completed: nextCompletedState });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updated : t))
      );
      showToast(
        nextCompletedState
          ? `Completed "${updated.title}"!`
          : `Marked "${updated.title}" as active`,
        'info'
      );
    } catch (err) {
      console.error('Toggle complete error:', err);
      // Rollback
      setTasks(previousTasks);
      showToast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Handler: Update Task details (title, description, priority)
  const handleUpdateTask = async (taskId, updates) => {
    setProcessingId(taskId);
    try {
      const updated = await updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updated : t))
      );
      showToast(`Updated "${updated.title}" in MongoDB!`, 'success');
      return true;
    } catch (err) {
      console.error('Update task error:', err);
      showToast(`Update failed: ${err.message}`, 'error');
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  // Handler: Request delete confirmation
  const handleRequestDelete = (task) => {
    setDeleteTarget(task);
  };

  // Handler: Confirm Delete execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const targetId = deleteTarget._id;
    const targetTitle = deleteTarget.title;

    try {
      await deleteTask(targetId);
      setTasks((prev) => prev.filter((t) => t._id !== targetId));
      showToast(`Deleted "${targetTitle}" from database.`, 'info');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete task error:', err);
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Task Confirmation"
        message="Are you sure you want to permanently delete this task from MongoDB?"
        taskTitle={deleteTarget?.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      <div className="app-container">
        {/* Header */}
        <Header />

        {/* Global Stats and Connection Bar */}
        <StatsBar
          tasks={tasks}
          isConnected={isConnected}
          onRefresh={() => fetchTasks(true)}
          isRefreshing={isRefreshing}
        />

        {/* Main Content: Form + Task List */}
        <main className="main-content-grid">
          <section className="form-column">
            <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />
          </section>

          <section className="list-column">
            {isLoading ? (
              <div className="loading-card">
                <Spinner size="large" text="Fetching tasks from MongoDB..." />
              </div>
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => fetchTasks(false)} />
            ) : (
              <TaskList
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onUpdateTask={handleUpdateTask}
                onRequestDelete={handleRequestDelete}
                processingId={processingId}
              />
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            AWDF Practical 06 &bull; CHARUSAT &bull; Nisarg Dedakiya (24CS014) &bull; React + Express + MongoDB
          </p>
        </footer>
      </div>
    </div>
  );
}
