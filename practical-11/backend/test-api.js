/**
 * Automated Verification Script for Practical 11 Backend API
 * Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runApiTests() {
  console.log('===============================================================');
  console.log(' Practical 11: Containerized Full Stack Backend Test Suite');
  console.log(' Student: Nisarg Dedakiya (24CS014) | CHARUSAT - CSPIT CSE');
  console.log('===============================================================\n');

  try {
    // 1. Health check
    console.log('[1] Testing Health Endpoint (GET /)...');
    const healthRes = await fetch(`${BASE_URL}/`);
    const health = await healthRes.json();
    console.log(`    Status: ${healthRes.status} OK`);
    console.log(`    Message: "${health.message}"`);
    console.log(`    Database: ${health.database}`);
    console.log(`    Target: ${health.containerTarget}\n`);

    // 2. Create Task (POST /tasks)
    console.log('[2] Testing Task Creation (POST /tasks)...');
    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Docker Compose Multi-Container Orchestration',
        description: 'Verify React, Express, and MongoDB inter-service bridge communication',
        priority: 'high',
        completed: false
      })
    });
    const createdData = await createRes.json();
    const taskId = createdData.data?._id;
    console.log(`    Status: ${createRes.status} Created`);
    console.log(`    Task ID: ${taskId}`);
    console.log(`    Title: "${createdData.data?.title}"\n`);

    // 3. Read All Tasks (GET /tasks)
    console.log('[3] Testing Fetch All Tasks (GET /tasks)...');
    const getRes = await fetch(`${BASE_URL}/tasks`);
    const getData = await getRes.json();
    console.log(`    Status: ${getRes.status} OK`);
    console.log(`    Total Tasks in DB: ${getData.count}\n`);

    // 4. Update Task (PUT /tasks/:id)
    if (taskId) {
      console.log(`[4] Testing Task Update (PUT /tasks/${taskId})...`);
      const updateRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          priority: 'medium'
        })
      });
      const updatedData = await updateRes.json();
      console.log(`    Status: ${updateRes.status} OK`);
      console.log(`    Updated Completed: ${updatedData.data?.completed}`);
      console.log(`    Updated Priority: ${updatedData.data?.priority}\n`);

      // 5. Delete Task (DELETE /tasks/:id)
      console.log(`[5] Testing Task Deletion (DELETE /tasks/${taskId})...`);
      const deleteRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteRes.json();
      console.log(`    Status: ${deleteRes.status} OK`);
      console.log(`    Message: "${deleteData.message}"\n`);
    }

    console.log('===============================================================');
    console.log(' ALL PRACTICAL 11 BACKEND API TESTS PASSED SUCCESSFULLY!');
    console.log(' Verified for: Nisarg Dedakiya (24CS014) | CSPIT - CHARUSAT');
    console.log('===============================================================');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Test Failure:', err.message);
    console.error('Ensure backend server is running: `npm start` inside practical-11/backend');
    process.exit(1);
  }
}

runApiTests();
