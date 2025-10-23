const { DataTypes } = require('sequelize');
const database = require('../database/database');

const LoaiGiaoDich = database.define('LoaiGiaoDich', {
    LGDID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TenLGD: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    tableName: 'LoaiGiaoDich',
    timestamps: false
});

module.exports = LoaiGiaoDich;