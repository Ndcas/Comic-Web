require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_DIALECT = process.env.DB_DIALECT || 'mysql';
const DB_HOST = process.env.DB_HOST || '127.0.0.1'; 
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'comicweb';

const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
  timezone: '+07:00', 
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});


(async () => {
  try {
    await db.authenticate();
    console.log('✅ Kết nối MySQL thành công!');
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL:', error.message);
  }
})();

module.exports = db;