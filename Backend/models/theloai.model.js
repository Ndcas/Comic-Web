const { DataTypes } = require('sequelize');
const database = require('../database/database');

const TheLoai = database.define('TheLoai', {
    TLID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TenTheLoai: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    tableName: 'TheLoai',
    timestamps: false
});

module.exports = TheLoai;