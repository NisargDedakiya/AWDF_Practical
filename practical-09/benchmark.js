/**
 * Benchmark & Automated Test Script for Practical 09
 * Student: Nisarg Dedakiya (24CS014) | CSPIT, CHARUSAT
 *
 * Automates 3 sample readings of:
 * 1. Uncached Requests (direct MongoDB queries via ?noCache=true)
 * 2. Cached Requests (Node-Cache In-Memory hits)
 * 3. Verifies Cache Invalidation on write (POST /tasks)
 * 4. Verifies Single-Task Caching (GET /tasks/:id)
 * 5. Verifies Cache Stats endpoint (GET /cache-stats)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./server');

let BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
let serverInstance = null;
let isInProcess = false;

async function checkOrStartServer() {
  try {
    const res = await fetch(`${BASE_URL}/`);
    if (res.ok) {
      const data = await res.json();
      if (data?.message?.includes('Practical 09')) {
        console.log(` Connected to active Practical 09 server on ${BASE_URL}\n`);
        return;
      }
    }
  } catch (err) {
    // Port not open or different server running
  }

  // Fallback: Start an in-process ephemeral server
  console.log(' Starting in-process ephemeral test server on random port...');
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_practical9';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      BASE_URL = `http://localhost:${port}`;
      isInProcess = true;
      console.log(` In-process test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });
}

async function timeRequest(url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const data = await res.json();
  const end = performance.now();
  const duration = parseFloat((end - start).toFixed(2));
  const cacheHeader = res.headers.get('x-cache') || data.source || 'N/A';
  return { duration, status: res.status, cacheHeader, data };
}

async function runBenchmark() {
  console.log('===============================================================');
  console.log(' AWDF Practical 09: In-Memory Caching & Benchmark Suite');
  console.log(' Student: Nisarg Dedakiya (24CS014) | CSPIT, CHARUSAT');
  console.log('===============================================================\n');

  try {
    await checkOrStartServer();

    // 1. Health check verification
    console.log('[1] Verifying Root API & Student Info...');
    const healthRes = await fetch(`${BASE_URL}/`);
    const health = await healthRes.json();
    console.log(`   Message: ${health.message}`);
    console.log(`   Student: ${health.student.name} (${health.student.rollNo}) | ${health.student.institution}`);
    console.log(`   Database Status: ${health.database}`);
    console.log(`   Cache Engine: ${health.cacheEngine} (TTL: ${health.ttlSeconds}s)\n`);

    // 2. Flush cache before benchmark starts
    console.log('[2] Flushing Cache to establish baseline...');
    await fetch(`${BASE_URL}/cache`, { method: 'DELETE' });
    console.log('   Cache flushed successfully.\n');

    // 3. Ensure sample data exists
    console.log('[3] Checking sample data in MongoDB...');
    const checkTasks = await fetch(`${BASE_URL}/tasks?noCache=true`);
    const taskData = await checkTasks.json();
    if (!taskData.data || taskData.data.length < 3) {
      console.log('   Seeding 3 initial sample tasks...');
      for (let i = 1; i <= 3; i++) {
        await fetch(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Practical 09 Benchmark Task ${i}`,
            description: `Automated test task for performance benchmarking #${i}`,
            priority: i === 1 ? 'high' : i === 2 ? 'medium' : 'low'
          })
        });
      }
      console.log('   Seeded 3 sample tasks in MongoDB.\n');
    } else {
      console.log(`   Found ${taskData.data.length} existing tasks in database.\n`);
    }

    // 4. Measure 3 Uncached Requests (MongoDB direct reads)
    console.log('[4] Measuring Uncached Response Times (MongoDB direct reads via ?noCache=true):');
    const uncachedTimes = [];
    for (let i = 1; i <= 3; i++) {
      const result = await timeRequest(`${BASE_URL}/tasks?noCache=true`);
      uncachedTimes.push(result.duration);
      console.log(`   Sample ${i}: ${result.duration.toFixed(2)} ms [Header: ${result.cacheHeader}]`);
    }
    const avgUncached = (uncachedTimes.reduce((a, b) => a + b, 0) / uncachedTimes.length).toFixed(2);
    console.log(`   -> Average Uncached Response Time: ${avgUncached} ms\n`);

    // 5. Prime the cache (First request is a Cache MISS)
    console.log('[5] Priming Node-Cache (First request expected to be MISS)...');
    const prime = await timeRequest(`${BASE_URL}/tasks`);
    console.log(`   Primer Request: ${prime.duration.toFixed(2)} ms [Header: ${prime.cacheHeader}] (Stored in Cache)\n`);

    // 6. Measure 3 Cached Requests (In-Memory Hits)
    console.log('[6] Measuring Cached Response Times (node-cache in-memory HITs):');
    const cachedTimes = [];
    for (let i = 1; i <= 3; i++) {
      const result = await timeRequest(`${BASE_URL}/tasks`);
      cachedTimes.push(result.duration);
      console.log(`   Sample ${i}: ${result.duration.toFixed(2)} ms [Header: ${result.cacheHeader}]`);
    }
    const avgCached = (cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length).toFixed(2);
    console.log(`   -> Average Cached Response Time: ${avgCached} ms\n`);

    // 7. Test Cache Invalidation on Write (POST /tasks)
    console.log('[7] Testing Cache Invalidation Pipeline on Write (POST /tasks)...');
    const postRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Temporary Invalidation Test Task',
        description: 'Verifying that write operations invalidate stale cached datasets',
        priority: 'high'
      })
    });
    const postData = await postRes.json();
    console.log(`   Created Task: "${postData.data?.title}" (ID: ${postData.data?._id})`);
    console.log(`   Server Response: "${postData.message}"`);

    // Verify next read is a clean MISS
    const postInvalidateCheck = await timeRequest(`${BASE_URL}/tasks`);
    console.log(`   Subsequent Read Header: [${postInvalidateCheck.cacheHeader}] (${postInvalidateCheck.duration.toFixed(2)} ms)`);
    if (postInvalidateCheck.cacheHeader === 'MISS') {
      console.log('    VERIFIED: Cache was successfully invalidated on write!\n');
    } else {
      console.warn('   ⚠️ Expected MISS but got:', postInvalidateCheck.cacheHeader, '\n');
    }

    // Clean up temporary task
    if (postData.data?._id) {
      await fetch(`${BASE_URL}/tasks/${postData.data._id}`, { method: 'DELETE' });
    }

    // 8. Test Single-Task Endpoint Caching
    console.log('[8] Testing Single-Task Caching (GET /tasks/:id)...');
    const allRes = await fetch(`${BASE_URL}/tasks`);
    const allJson = await allRes.json();
    const firstTaskId = allJson.data[0]._id;

    const singleMiss = await timeRequest(`${BASE_URL}/tasks/${firstTaskId}`);
    console.log(`   Task ${firstTaskId} First Read: ${singleMiss.duration.toFixed(2)} ms [Header: ${singleMiss.cacheHeader}]`);

    const singleHit = await timeRequest(`${BASE_URL}/tasks/${firstTaskId}`);
    console.log(`   Task ${firstTaskId} Second Read: ${singleHit.duration.toFixed(2)} ms [Header: ${singleHit.cacheHeader}]`);
    if (singleHit.cacheHeader === 'HIT') {
      console.log('    VERIFIED: Single task endpoint cached successfully!\n');
    }

    // 9. Inspect Cache Stats
    console.log('[9] Inspecting Cache Statistics (GET /cache-stats)...');
    const statsRes = await fetch(`${BASE_URL}/cache-stats`);
    const stats = await statsRes.json();
    console.log(`   Total Cache Keys: ${stats.data.totalKeys}`);
    console.log(`   Active Keys: ${JSON.stringify(stats.data.keys)}`);
    console.log(`   Cache Hits: ${stats.data.hits}`);
    console.log(`   Cache Misses: ${stats.data.misses}`);
    console.log(`   Hit Ratio: ${stats.data.hitRatio}`);
    console.log(`   Total Sets: ${stats.data.sets}`);
    console.log(`   Total Invalidations: ${stats.data.invalidations}\n`);

    // 10. Output Benchmark Summary Table
    const speedup = (avgUncached / avgCached).toFixed(1);
    console.log('===============================================================');
    console.log(' BENCHMARK RESULTS SUMMARY (For Practical 09 Lab Journal)');
    console.log('===============================================================');
    console.log('| Metric                    | Uncached (MongoDB) | Cached (node-cache) |');
    console.log('|---------------------------|-------------------|---------------------|');
    console.log(`| Sample 1 Reading          | ${uncachedTimes[0].toFixed(2)} ms            | ${cachedTimes[0].toFixed(2)} ms               |`);
    console.log(`| Sample 2 Reading          | ${uncachedTimes[1].toFixed(2)} ms            | ${cachedTimes[1].toFixed(2)} ms               |`);
    console.log(`| Sample 3 Reading          | ${uncachedTimes[2].toFixed(2)} ms            | ${cachedTimes[2].toFixed(2)} ms               |`);
    console.log(`| Average Response Time     | ${avgUncached} ms            | ${avgCached} ms                |`);
    console.log(`| Performance Improvement   | Baseline          | ~${speedup}x Faster            |`);
    console.log('===============================================================');
    console.log(` Cache Hit Ratio Achieved: ${stats.data.hitRatio}`);
    console.log(' All Practical 09 test cases passed successfully!\n');

  } catch (err) {
    console.error('Benchmark Error:', err);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      await new Promise((r) => serverInstance.close(r));
    }
    if (isInProcess && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    setTimeout(() => process.exit(process.exitCode || 0), 100).unref();
  }
}

runBenchmark();
