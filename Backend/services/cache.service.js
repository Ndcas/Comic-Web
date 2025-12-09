const nodeCache = require('node-cache');

const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS);

const cacheClient = new nodeCache({ stdTTL: CACHE_TTL_SECONDS });

function saveToCache(key, value, ttlSec = null) {
    if (ttlSec) {
        cacheClient.set(key, value, ttlSec);
    } else {
        cacheClient.set(key, value);
    }
}

function getFromCache(key) {
    return cacheClient.get(key);
}

function deleteFromCache(key) {
    cacheClient.del(key);
}

function deleteFromCachePrefix(prefix) {
    cacheClient.del(cacheClient.keys().filter(item => item.startsWith(prefix)));
}

module.exports = { saveToCache, getFromCache, deleteFromCache, deleteFromCachePrefix };