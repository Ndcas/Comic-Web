const { DataTypes } = require('sequelize');
const database = require('../database/database');

const Admin = database.define('Admin', {
    Email: {
        type: DataTypes.STRING(200),
        primaryKey: true,
        validate: {
            isEmail: true
        }
    },
    MatKhau: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
            len: [60, 60]
        }
    }
}, {
    tableName: 'Admin',
    timestamps: false
});

module.exports = Admin;