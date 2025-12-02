const { DataTypes } = require('sequelize');
const database = require('../database/database');

const TheLoaiTruyen = database.define('TheLoaiTruyen', {
    TLID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'TheLoai',
            key: 'TLID'
        }
    },
    TID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Truyen',
            key: 'TID'
        }
    }
}, {
    tableName: 'TheLoaiTruyen',
    timestamps: false
});

module.exports = TheLoaiTruyen;