const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

function hash(string) {
    return bcrypt.hashSync(string, BCRYPT_SALT_ROUNDS);
}

function compare(string, hash) {
    return bcrypt.compareSync(string, hash);
}

module.exports = { hash, compare };