/**
 * In-Memory Cache Service using node-cache
 * Prevents hammering NASA APIs and respects rate limits
 */

const NodeCache = require('node-cache');

// Main cache: items expire after CACHE_TTL seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Statistics tracker
const stats = { hits: 0, misses: 0, sets: 0 };

/** Get item from cache */
function getCache(key) {
  const val = cache.get(key);
  if (val !== undefined) {
    stats.hits++;
    console.log(`[CACHE HIT] ${key}`);
    return val;
  }
  stats.misses++;
  return null;
}

/** Set item in cache with optional custom TTL */
function setCache(key, value, ttl = undefined) {
  stats.sets++;
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
  console.log(`[CACHE SET] ${key} (TTL: ${ttl || 'default'}s)`);
}

/** Delete a cache entry */
function deleteCache(key) {
  cache.del(key);
}

/** Clear all cache */
function flushCache() {
  cache.flushAll();
  console.log('[CACHE] Flushed all entries');
}

/** Get cache statistics */
function getCacheStats() {
  return {
    ...stats,
    keys: cache.keys().length,
    hitRate: stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) + '%'
      : '0%'
  };
}

/** Warm cache by pre-fetching critical data on startup */
async function warmCache() {
  try {
    const { getDashboardData } = require('./nasa');
    await getDashboardData();
    console.log('[CACHE] Warm-up complete ✓');
  } catch (err) {
    console.warn('[CACHE] Warm-up failed:', err.message);
  }
}

module.exports = { getCache, setCache, deleteCache, flushCache, getCacheStats, warmCache };
