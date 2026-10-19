import React, { useState } from 'react';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('bundle');

  const bundleData = [
    { file: 'dist/index.html', type: 'HTML Entry Point', size: '0.50 kB', gzip: '0.33 kB', when: 'Initial Page Request' },
    { file: 'dist/assets/index.css', type: 'Compiled Stylesheet', size: '3.42 kB', gzip: '1.10 kB', when: 'Initial Page Request' },
    { file: 'dist/assets/index-[hash].js', type: 'Main Core Bundle', size: '142.10 kB', gzip: '45.20 kB', when: 'Initial Page Request (Home, Nav, Layout)' },
    { file: 'dist/assets/Projects-[hash].js', type: 'Lazy Chunk', size: '2.15 kB', gzip: '0.98 kB', when: 'On-Demand (Navigating to /projects)' },
    { file: 'dist/assets/Contact-[hash].js', type: 'Lazy Chunk', size: '3.20 kB', gzip: '1.24 kB', when: 'On-Demand (Navigating to /contact)' },
    { file: 'dist/assets/Analytics-[hash].js', type: 'Lazy Chunk', size: '4.80 kB', gzip: '1.85 kB', when: 'On-Demand (Navigating to /analytics)' }
  ];

  const metricsData = [
    { metric: 'First Contentful Paint (FCP)', singleBundle: '1.85 s', codeSplit: '0.72 s', improvement: '61.1% Faster', status: 'Good (< 1.8s)' },
    { metric: 'Time to Interactive (TTI)', singleBundle: '2.40 s', codeSplit: '1.05 s', improvement: '56.3% Faster', status: 'Good (< 3.8s)' },
    { metric: 'Initial JS Transferred', singleBundle: '152.25 kB', codeSplit: '142.10 kB', improvement: 'Reduced Initial Overhead', status: 'Optimal' },
    { metric: 'Main Thread Blocking Time', singleBundle: '340 ms', codeSplit: '95 ms', improvement: '72.0% Reduction', status: 'Good (< 200ms)' }
  ];

  const monthlyData = [
    { month: 'Practical 01', topic: 'React Components & Props', components: 4, bundleImpact: 'Baseline' },
    { month: 'Practical 02', topic: 'useState & React Router v6', components: 6, bundleImpact: 'Low (+12 kB)' },
    { month: 'Practical 03', topic: 'useEffect & GitHub REST API', components: 5, bundleImpact: 'Low (+8 kB)' },
    { month: 'Practical 04', topic: 'Node.js & Express REST API', components: 8, bundleImpact: 'Backend Only' },
    { month: 'Practical 05', topic: 'MongoDB & Mongoose Schema', components: 7, bundleImpact: 'Backend Only' },
    { month: 'Practical 06', topic: 'Full-Stack State Synchronization', components: 10, bundleImpact: 'Medium (+24 kB)' },
    { month: 'Practical 07', topic: 'JWT Auth & Middleware Pipeline', components: 12, bundleImpact: 'Medium (+28 kB)' },
    { month: 'Practical 08', topic: 'Code Splitting & Lazy Loading', components: 9, bundleImpact: 'Optimized (-40% Initial)' }
  ];

  return (
    <div className="page-box analytics-view">
      <div className="section-header-row">
        <h2>Performance Optimization & Analytics</h2>
        <span className="lazy-badge">⚡ Lazy Loaded Chunk: Analytics-[hash].js</span>
      </div>
      <p className="chunk-desc">
        You are viewing an on-demand dynamic chunk. React dynamically fetched this module bundle over the network
        and resolved it inside <code>&lt;Suspense fallback=&lbrace;&lt;LoadingFallback /&gt;&rbrace;&gt;</code>.
      </p>

      {/* Tab Switcher */}
      <div className="analytics-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'bundle' ? 'active' : ''}`}
          onClick={() => setActiveTab('bundle')}
        >
          Bundle Chunk Distribution
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Performance Metrics (Before vs After)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'practicals' ? 'active' : ''}`}
          onClick={() => setActiveTab('practicals')}
        >
          Practicals Progression Overview
        </button>
      </div>

      {/* Tab 1: Bundle Distribution */}
      {activeTab === 'bundle' && (
        <div className="tab-content">
          <h3>Vite Production Bundle Distribution</h3>
          <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '12px' }}>
            Notice how non-critical routes are split into separate JavaScript chunks instead of a single giant monolithic bundle.
          </p>
          <div className="table-responsive">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Output Asset</th>
                  <th>Bundle Category</th>
                  <th>Raw Size</th>
                  <th>Gzip Size</th>
                  <th>Download Trigger</th>
                </tr>
              </thead>
              <tbody>
                {bundleData.map((item, idx) => (
                  <tr key={idx} className={item.type.includes('Lazy') ? 'highlight-lazy-row' : ''}>
                    <td><code>{item.file}</code></td>
                    <td><span className={`badge-pill ${item.type.includes('Lazy') ? 'pill-lazy' : 'pill-main'}`}>{item.type}</span></td>
                    <td>{item.size}</td>
                    <td>{item.gzip}</td>
                    <td><strong>{item.when}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="architecture-callout">
            <h4>Code Splitting Architecture Mechanism</h4>
            <pre className="code-snippet">
{`// App.jsx: React.lazy() dynamic import triggers Webpack/Vite chunk extraction
const Projects = lazy(() => import('./components/Projects'));
const Contact = lazy(() => import('./components/Contact'));
const Analytics = lazy(() => import('./components/Analytics'));

// Wrapped in Suspense to render fallback UI during network chunk transfer
<Suspense fallback={<LoadingFallback />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/analytics" element={<Analytics />} />
  </Routes>
</Suspense>`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Performance Metrics */}
      {activeTab === 'metrics' && (
        <div className="tab-content">
          <h3>Simulated Lighthouse & Web Vitals Benchmark</h3>
          <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '12px' }}>
            Comparing Monolithic Single-Bundle vs Route-Based Code Splitting on a 3G Mobile Connection:
          </p>
          <div className="table-responsive">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Performance Metric</th>
                  <th>Single Monolithic Bundle</th>
                  <th>Route-Based Code Splitting</th>
                  <th>Net Gain</th>
                  <th>Web Vitals Status</th>
                </tr>
              </thead>
              <tbody>
                {metricsData.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.metric}</strong></td>
                    <td style={{ color: '#dc2626' }}>{row.singleBundle}</td>
                    <td style={{ color: '#16a34a', fontWeight: 'bold' }}>{row.codeSplit}</td>
                    <td><span className="improvement-tag">{row.improvement}</span></td>
                    <td><span className="badge-pill pill-main">{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="vitals-explanation">
            <div className="vital-card">
              <h4>FCP (First Contentful Paint)</h4>
              <p>Measures the time from navigation to when the browser renders the first bit of DOM content. Lower is better.</p>
            </div>
            <div className="vital-card">
              <h4>TTI (Time to Interactive)</h4>
              <p>Measures when a page becomes fully interactive and responds reliably to user clicks. Code splitting drastically reduces TTI.</p>
            </div>
            <div className="vital-card">
              <h4>Parse & Compile Time</h4>
              <p>Browsers must parse and compile all downloaded JavaScript. Deferring chunks keeps CPU cycles free for immediate rendering.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Progression Overview */}
      {activeTab === 'practicals' && (
        <div className="tab-content">
          <h3>AWDF Practicals Framework Summary</h3>
          <div className="table-responsive">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Practical</th>
                  <th>Key Concept & Implementation</th>
                  <th>Component Count</th>
                  <th>Bundle Architecture Impact</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.month}</strong></td>
                    <td>{row.topic}</td>
                    <td>{row.components}</td>
                    <td><code>{row.bundleImpact}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
