const nodeCache = require('node-cache');

const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS) || 604800;

const cacheClient = new nodeCache({
    stdTTL: CACHE_TTL_SECONDS
});

function saveToCache(key, value) {
    cacheClient.set(key, value);
}

function getFromCache(key) {
    return cacheClient.get(key);
}

function delFromCache(key) {
    cacheClient.del(key);
}

module.exports = { saveToCache, getFromCache, delFromCache };