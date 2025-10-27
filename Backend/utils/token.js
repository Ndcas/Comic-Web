const jsonwebtoken = require('jsonwebtoken');

const ACCESS_KEY = process.env.ACCESS_KEY || 'ComicWebAK';
const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS) || 300000;
const REFRESH_KEY = process.env.REFRESH_KEY || 'ComicWebRK';
const REFRESH_TOKEN_TTL_MS = parseInt(process.env.REFRESH_TOKEN_TTL_MS) || 604800000;

function signToken(payload, isRefresh = false) {
    let key = isRefresh ? REFRESH_KEY : ACCESS_KEY;
    let ttl = isRefresh ? REFRESH_TOKEN_TTL_MS : ACCESS_TOKEN_TTL_MS;
    return jsonwebtoken.sign(payload, key, {
        expiresIn: ttl
    });
}

function verifyToken(token, isRefresh = false) {
    try {
        let key = isRefresh ? REFRESH_KEY : ACCESS_KEY;
        return jsonwebtoken.verify(token, key);
    } catch (error) {
        return null;
    }
}

module.exports = { signToken, verifyToken };