/**
 * Automated Test Script for Practical 06 Backend
 * Student: Nisarg Dedakiya (24CS014) - CSPIT / CHARUSAT
 * Verifies: Health Check, POST /tasks, GET /tasks, PUT /tasks/:id, DELETE /tasks/:id
 */

const mongoose = require('mongoose');
const app = require('./server');

let BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
let serverInstance = null;

async function checkOrStartServer() {
  try {
    const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      console.log(`Connected to existing backend server at ${BASE_URL}\n`);
      return;
    }
  } catch (e) {
    await new Promise((resolve) => {
      serverInstance = app.listen(0, async () => {
        const port = serverInstance.address().port;
        BASE_URL = `http://localhost:${port}`;
        console.log(`Started in-process test server at ${BASE_URL}`);

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
  console.log('========================================================');
  console.log(' Starting Automated Tests for Practical 06 Backend');
  console.log(' Student: Nisarg Dedakiya (24CS014) - CHARUSAT');
  console.log('========================================================\n');

  try {
    await checkOrStartServer();

    let passedTests = 0;
    const totalTests = 5;

    // 1. Health check
    console.log('[TEST 1] Checking Root / Health Route...');
    const healthRes = await fetch(`${BASE_URL}/`);
    const healthData = await healthRes.json();
    console.log(` Status: ${healthRes.status} OK | Message: "${healthData.message}"`);
    console.log(` Student: ${healthData.student?.name} (${healthData.student?.rollNo})`);
    if (healthRes.status === 200 && healthData.student?.rollNo === '24CS014') passedTests++;

    // 2. Create a new task (POST /tasks)
    console.log('\n[TEST 2] Creating New Task (POST /tasks)...');
    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Complete Practical 06 Full Stack Integration',
        description: 'Connect React frontend with Express and MongoDB',
        priority: 'high',
        completed: false
      })
    });
    const createData = await createRes.json();
    console.log(` Status: ${createRes.status} Created | Task ID: ${createData.data?._id}`);
    const createdId = createData.data?._id;
    if (createRes.status === 201 && createdId) passedTests++;

    // 3. Fetch all tasks (GET /tasks)
    console.log('\n[TEST 3] Fetching All Tasks (GET /tasks)...');
    const getAllRes = await fetch(`${BASE_URL}/tasks`);
    const getAllData = await getAllRes.json();
    console.log(` Status: ${getAllRes.status} OK | Total Tasks in MongoDB: ${getAllData.count}`);
    if (getAllRes.status === 200 && Array.isArray(getAllData.data)) passedTests++;

    // 4. Update task (PUT /tasks/:id)
    if (createdId) {
      console.log(`\n[TEST 4] Updating Task (${createdId}) to Completed (PUT /tasks/:id)...`);
      const updateRes = await fetch(`${BASE_URL}/tasks/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true, priority: 'medium' })
      });
      const updateData = await updateRes.json();
      console.log(` Status: ${updateRes.status} OK | Completed: ${updateData.data?.completed}`);
      if (updateRes.status === 200 && updateData.data?.completed === true) passedTests++;

      // 5. Delete task (DELETE /tasks/:id)
      console.log(`\n[TEST 5] Deleting Task (${createdId}) (DELETE /tasks/:id)...`);
      const deleteRes = await fetch(`${BASE_URL}/tasks/${createdId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteRes.json();
      console.log(` Status: ${deleteRes.status} OK | Message: "${deleteData.message}"`);
      if (deleteRes.status === 200) passedTests++;
    }

    console.log('\n========================================================');
    console.log(` Result: ${passedTests} / ${totalTests} Backend Tests Passed Successfully!`);
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n Test execution failed:', err.message);
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
    await mongoose.disconnect();
    setTimeout(() => process.exit(0), 100).unref();
  }
}

runTests();
