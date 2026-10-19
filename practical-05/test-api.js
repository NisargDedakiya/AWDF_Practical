// Automated Test Script for Practical 5 (MongoDB Integration & Schema Validation)
// Student: Nisarg Dedakiya (24CS014) - CSPIT / CHARUSAT
// Usage: node test-api.js (Run while server.js is running OR runs self-contained in-process)

const mongoose = require('mongoose');
const app = require('./server');

let BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
let serverInstance = null;

async function checkOrStartServer() {
  try {
    const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      console.log(`Connected to existing server at ${BASE_URL}\n`);
      return;
    }
  } catch (e) {
    await new Promise((resolve) => {
      serverInstance = app.listen(0, async () => {
        const port = serverInstance.address().port;
        BASE_URL = `http://localhost:${port}`;
        console.log(`Started in-process test server at ${BASE_URL}`);

        // Wait for Mongoose connection
        if (mongoose.connection.readyState !== 1) {
          console.log('Waiting for MongoDB connection...');
          for (let i = 0; i < 20; i++) {
            if (mongoose.connection.readyState === 1) break;
            await new Promise((r) => setTimeout(r, 200));
          }
        }
        console.log(`MongoDB state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Offline'}\n`);
        resolve();
      });
    });
  }
}

async function runTests() {
  console.log('🧪 Starting Practical 5 MongoDB & Schema Validation Tests (Nisarg Dedakiya - 24CS014)...\n');

  try {
    await checkOrStartServer();

    let passedTests = 0;
    const totalTests = 9;

    // 1. GET / - Welcome & DB status endpoint
    console.log('1. Testing GET / (Welcome & DB Status Endpoint)');
    let res = await fetch(`${BASE_URL}/`);
    let data = await res.json();
    console.log(`   Status: ${res.status} | DB Status: ${data.databaseStatus}`);
    console.log(`   Student: ${data.student?.name} (${data.student?.rollNo})`);
    if (res.status === 200 && data.student?.rollNo === '24CS014') passedTests++;

    // 2. Schema Validation Failure Test: Missing Required Title
    console.log('\n2. Testing Schema Validation (Missing required title - Expected 400)');
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Task without a title',
        priority: 'high'
      })
    });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 400) | Error: ${data.error}`);
    console.log(`   Structured Details: ${JSON.stringify(data.details)}`);
    if (res.status === 400 && data.details?.length > 0) passedTests++;

    // 3. Schema Validation Failure Test: Invalid Priority Enum
    console.log('\n3. Testing Schema Validation (Invalid priority enum - Expected 400)');
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Learn Mongoose',
        priority: 'urgent' // Invalid: must be 'low', 'medium', or 'high'
      })
    });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 400) | Error: ${data.error}`);
    console.log(`   Structured Details: ${JSON.stringify(data.details)}`);
    if (res.status === 400 && data.details?.length > 0) passedTests++;

    // 4. Successful Task Creation (with Pre-save trim testing & priority enum)
    console.log('\n4. Testing POST /tasks (Successful Creation with Pre-save Hook)');
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '   Build Full-Stack Task Manager   ', // Extra spaces to test pre-save trim
        description: 'Prepare for Practical 6 full-stack integration',
        completed: false,
        priority: 'high'
      })
    });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 201) | Stored Title: '${data.data?.title}'`);
    console.log(`   Generated MongoDB _id: ${data.data?._id}`);
    const newId = data.data?._id;
    if (res.status === 201 && data.data?.title === 'Build Full-Stack Task Manager') passedTests++;

    if (newId) {
      // 5. GET /tasks/:id (Read Single Document)
      console.log(`\n5. Testing GET /tasks/${newId} (Find by ID)`);
      res = await fetch(`${BASE_URL}/tasks/${newId}`);
      data = await res.json();
      console.log(`   Status: ${res.status} (Expected 200) | Priority: ${data.data?.priority}`);
      if (res.status === 200 && data.data?._id === newId) passedTests++;

      // 6. PUT /tasks/:id (Update Document)
      console.log(`\n6. Testing PUT /tasks/${newId} (Update with Validators)`);
      res = await fetch(`${BASE_URL}/tasks/${newId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          priority: 'medium'
        })
      });
      data = await res.json();
      console.log(`   Status: ${res.status} (Expected 200) | Completed: ${data.data?.completed} | Priority: ${data.data?.priority}`);
      if (res.status === 200 && data.data?.completed === true && data.data?.priority === 'medium') passedTests++;

      // 7. DELETE /tasks/:id (Delete Document)
      console.log(`\n7. Testing DELETE /tasks/${newId} (Delete Document)`);
      res = await fetch(`${BASE_URL}/tasks/${newId}`, { method: 'DELETE' });
      data = await res.json();
      console.log(`   Status: ${res.status} (Expected 200) | Message: ${data.message}`);
      if (res.status === 200) passedTests++;

      // 8. GET /tasks/:id after deletion (Expected 404)
      console.log(`\n8. Testing GET /tasks/${newId} after deletion (Expected 404)`);
      res = await fetch(`${BASE_URL}/tasks/${newId}`);
      data = await res.json();
      console.log(`   Status: ${res.status} (Expected 404) | Error: ${data.error}`);
      if (res.status === 404) passedTests++;
    }

    // 9. Testing invalid ObjectId format (Expected 404)
    console.log('\n9. Testing GET /tasks/invalid-id-123 (Invalid ObjectId format - Expected 404)');
    res = await fetch(`${BASE_URL}/tasks/invalid-id-123`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 404) | Error: ${data.error}`);
    if (res.status === 404) passedTests++;

    console.log(`\n==================================================`);
    console.log(`Result: ${passedTests} / ${totalTests} Practical 5 Tests Passed Successfully!`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Test script error:', err.message);
  } finally {
    if (serverInstance) {
      serverInstance.close();
      await mongoose.disconnect();
    }
  }
}

runTests();
