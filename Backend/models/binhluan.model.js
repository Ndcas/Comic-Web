const { DataTypes } = require('sequelize');
const database = require('../database/database');

const BinhLuan = database.define('BinhLuan', {
    BLID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NDID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'NguoiDung',
            key: 'NDID'
        }
    },
    TID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Truyen',
            key: 'TID'
        }
    },
    NoiDung: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    ThoiGianBinhLuan: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'BinhLuan',
    timestamps: false
});

module.exports = BinhLuan;