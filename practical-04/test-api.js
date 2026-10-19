// Automated API Test Script for Practical 4
// Student: Nisarg Dedakiya (24CS014) - CSPIT / CHARUSAT
// Usage: node test-api.js (Runs against running server OR starts in-process server automatically)

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
    // Server not running on BASE_URL, start in-process on an ephemeral port
    await new Promise((resolve) => {
      serverInstance = app.listen(0, () => {
        const port = serverInstance.address().port;
        BASE_URL = `http://localhost:${port}`;
        console.log(`Started in-process test server at ${BASE_URL}\n`);
        resolve();
      });
    });
  }
}

async function runTests() {
  console.log('🧪 Starting Practical 4 API Endpoint Tests (Nisarg Dedakiya - 24CS014)...\n');

  try {
    await checkOrStartServer();

    let passedTests = 0;
    const totalTests = 11;

    // 1. GET / - Welcome endpoint
    console.log('1. Testing GET / (Welcome / Student Metadata Endpoint)');
    let res = await fetch(`${BASE_URL}/`);
    let data = await res.json();
    console.log(`   Status: ${res.status} (Expected 200) - Success: ${data.success}`);
    console.log(`   Student: ${data.student?.name} (${data.student?.rollNo})`);
    if (res.status === 200 && data.student?.rollNo === '24CS014') passedTests++;

    // 2. GET /tasks - Get all tasks
    console.log('\n2. Testing GET /tasks (Read All Tasks)');
    res = await fetch(`${BASE_URL}/tasks`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 200) - Count: ${data.count}`);
    if (res.status === 200 && Array.isArray(data.data)) passedTests++;

    // 3. POST /tasks - Create task
    console.log('\n3. Testing POST /tasks (Create Task)');
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Complete Practical 4 Testing',
        description: 'Verify all middleware and CRUD operations for college submission',
        completed: false
      })
    });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 201) - Created ID: ${data.data?.id}`);
    const newId = data.data?.id;
    if (res.status === 201 && newId) passedTests++;

    // 4. GET /tasks/:id - Get created task
    console.log(`\n4. Testing GET /tasks/${newId} (Read Single Task)`);
    res = await fetch(`${BASE_URL}/tasks/${newId}`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 200) - Title: "${data.data?.title}"`);
    if (res.status === 200 && data.data?.id === newId) passedTests++;

    // 5. PUT /tasks/:id - Update task
    console.log(`\n5. Testing PUT /tasks/${newId} (Update Task)`);
    res = await fetch(`${BASE_URL}/tasks/${newId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: true,
        title: 'Complete Practical 4 Testing (Updated)'
      })
    });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 200) - Completed: ${data.data?.completed}`);
    if (res.status === 200 && data.data?.completed === true) passedTests++;

    // 6. DELETE /tasks/:id - Delete task
    console.log(`\n6. Testing DELETE /tasks/${newId} (Delete Task)`);
    res = await fetch(`${BASE_URL}/tasks/${newId}`, { method: 'DELETE' });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 200) - Deleted ID: ${data.data?.id}`);
    if (res.status === 200 && data.data?.id === newId) passedTests++;

    // 7. Testing 404 for deleted task
    console.log(`\n7. Testing GET /tasks/${newId} after deletion (Expected 404 Not Found)`);
    res = await fetch(`${BASE_URL}/tasks/${newId}`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 404) - Error: ${data.error}`);
    if (res.status === 404) passedTests++;

    // 8. Testing Supplementary 1: Missing Content-Type rejection
    console.log('\n8. Testing POST without Content-Type header (Expected 400 Bad Request)');
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      body: 'Raw string without application/json header'
    });
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 400) - Error: ${data.error}`);
    if (res.status === 400) passedTests++;

    // 9. Testing Supplementary 2: Invalid Task ID format
    console.log('\n9. Testing GET /tasks/abc (Invalid ID format - Expected 400 Bad Request)');
    res = await fetch(`${BASE_URL}/tasks/abc`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 400) - Error: ${data.error}`);
    if (res.status === 400) passedTests++;

    // 10. Testing Supplementary 3: Undefined 404 Route
    console.log('\n10. Testing GET /undefined-route (Undefined Route 404 Handler)');
    res = await fetch(`${BASE_URL}/undefined-route`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 404) - Error: ${data.error}`);
    if (res.status === 404) passedTests++;

    // 11. Testing Global Error Handler
    console.log('\n11. Testing GET /test-error (Global 500 Error Handler)');
    res = await fetch(`${BASE_URL}/test-error`);
    data = await res.json();
    console.log(`   Status: ${res.status} (Expected 500) - Error: ${data.error}`);
    if (res.status === 500) passedTests++;

    console.log(`\n==================================================`);
    console.log(`Result: ${passedTests} / ${totalTests} API Tests Passed Successfully!`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Test run error:', err.message);
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }
}

runTests();
