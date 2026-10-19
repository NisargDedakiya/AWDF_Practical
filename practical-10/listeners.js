const taskEvents = require('./events');

const NOTIFICATION_DELAY = parseInt(process.env.NOTIFICATION_DELAY_MS, 10) || 1500;

// In-memory store for recent asynchronous background notification logs
const notificationLog = [];

/**
 * 1. Listener for 'task-created' event
 * Handles notification asynchronously without blocking the main API response cycle
 */
taskEvents.on('task-created', (task) => {
  const eventReceivedAt = new Date().toISOString();
  console.log(`[EVENT RECEIVED] 'task-created' received at ${eventReceivedAt} for Task: "${task.title}"`);

  // Simulate slow asynchronous background processing (e.g. SMTP email, push notification, webhook)
  setTimeout(() => {
    try {
      const completedAt = new Date().toISOString();
      const notification = {
        event: 'task-created',
        taskId: task._id,
        title: task.title,
        priority: task.priority || 'medium',
        eventReceivedAt,
        completedAt,
        delayMs: NOTIFICATION_DELAY,
        message: `Background notification processed: Task "${task.title}" created successfully.`
      };

      notificationLog.unshift(notification);
      if (notificationLog.length > 50) notificationLog.pop();

      console.log(`[BACKGROUND LISTENER COMPLETED] [${completedAt}] Notification dispatched for: "${task.title}" (Priority: ${task.priority})`);
    } catch (err) {
      taskEvents.emit('error', err);
    }
  }, NOTIFICATION_DELAY);
});

/**
 * 2. Listener for 'task-deleted' event (Supplementary Lifecycle Event)
 */
taskEvents.on('task-deleted', (taskData) => {
  const completedAt = new Date().toISOString();
  const notification = {
    event: 'task-deleted',
    taskId: taskData.id,
    title: taskData.title,
    completedAt,
    message: `Background notification processed: Task "${taskData.title}" was deleted.`
  };

  notificationLog.unshift(notification);
  if (notificationLog.length > 50) notificationLog.pop();

  console.log(`[BACKGROUND LISTENER] [${completedAt}] Deletion notification: Task "${taskData.title}" (${taskData.id}) permanently removed.`);
});

/**
 * 3. Error Event Listener (Fault-Tolerance)
 * Catches unhandled errors emitted on taskEvents to prevent Node.js process termination
 */
taskEvents.on('error', (err) => {
  const errorAt = new Date().toISOString();
  console.error(`[EVENT ERROR LISTENER] Caught background event error: ${err.message}`);

  notificationLog.unshift({
    event: 'error',
    message: `Background Error Caught: ${err.message}`,
    completedAt: errorAt
  });
  if (notificationLog.length > 50) notificationLog.pop();
});

module.exports = {
  notificationLog,
  taskEvents
};
