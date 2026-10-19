const NodeCache = require('node-cache');

// Standard TTL of 60 seconds as specified in Practical 09 problem statement
const TTL = parseInt(process.env.CACHE_TTL, 10) || 60;

// Initialize NodeCache instance
const nodeCache = new NodeCache({
  stdTTL: TTL,
  checkperiod: 120
});

// Cache Metrics Tracker (Supplementary Lab Feature)
const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0
};

const cache = {
  get(key) {
    const val = nodeCache.get(key);
    if (val !== undefined) {
      cacheMetrics.hits += 1;
      return val;
    }
    cacheMetrics.misses += 1;
    return null;
  },

  set(key, value, ttl = TTL) {
    cacheMetrics.sets += 1;
    return nodeCache.set(key, value, ttl);
  },

  del(key) {
    cacheMetrics.invalidations += 1;
    return nodeCache.del(key);
  },

  flush() {
    cacheMetrics.invalidations += 1;
    return nodeCache.flushAll();
  },

  getStats() {
    const totalRequests = cacheMetrics.hits + cacheMetrics.misses;
    const hitRatio = totalRequests > 0 ? ((cacheMetrics.hits / totalRequests) * 100).toFixed(2) + '%' : '0%';

    return {
      ttlSeconds: TTL,
      totalKeys: nodeCache.keys().length,
      keys: nodeCache.keys(),
      hits: cacheMetrics.hits,
      misses: cacheMetrics.misses,
      sets: cacheMetrics.sets,
      invalidations: cacheMetrics.invalidations,
      hitRatio,
      rawNodeCacheStats: nodeCache.getStats()
    };
  }
};

module.exports = cache;
