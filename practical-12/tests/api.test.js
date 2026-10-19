const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

/**
 * Automated CI Test Suite - Practical 12
 * Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
 */
test('Automated CI Test Suite - Practical 12', async (t) => {
  t.after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // Test 1: Root endpoint returns 200 OK
  await t.test('GET / returns 200 and success status', async () => {
    const res = await request(app).get('/');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'success');
    assert.match(res.body.message, /Practical 12/);
    assert.match(res.body.student, /Nisarg Dedakiya/);
  });

  // Test 2: Health check endpoint returns 200 OK
  await t.test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(typeof res.body.uptime, 'number');
  });

  // Test 3: GET /tasks returns 200 OK and task array
  await t.test('GET /tasks returns status code 200 and data array', async () => {
    const res = await request(app).get('/tasks');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  // Test 4: POST /tasks with valid title returns 201 Created
  await t.test('POST /tasks with valid title returns 201 Created', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        title: 'CI Automated Integration Task',
        priority: 'high'
      });
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
  });

  // Test 5: POST /tasks without title returns 400 Bad Request
  await t.test('POST /tasks with empty title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        title: '',
        priority: 'low'
      });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
  });
});
