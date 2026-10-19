const EventEmitter = require('events');

/**
 * Dedicated EventEmitter singleton instance for task lifecycle events
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 * Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
 */
class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
