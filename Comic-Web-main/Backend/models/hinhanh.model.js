const { DataTypes } = require('sequelize');
const database = require('../database/database');

const HinhAnh = database.define('HinhAnh', {
    HAID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CTID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ChuongTruyen',
            key: 'CTID'
        }
    },
    HinhAnh: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    tableName: 'HinhAnh',
    timestamps: false
});

module.exports = HinhAnh;