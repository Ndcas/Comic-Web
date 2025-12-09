const { DataTypes } = require('sequelize');
const database = require('../database/database');

const ChuongDaMoKhoa = database.define('ChuongDaMoKhoa', {
    NDID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'NguoiDung',
            key: 'NDID'
        }
    },
    CTID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'ChuongTruyen',
            key: 'CTID'
        }
    },
    Diem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'ChuongDaMoKhoa',
    timestamps: false
});

module.exports = ChuongDaMoKhoa;