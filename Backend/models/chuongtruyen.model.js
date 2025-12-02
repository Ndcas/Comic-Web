const { DataTypes } = require('sequelize');
const database = require('../database/database');

const ChuongTruyen = database.define('ChuongTruyen', {
    CTID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Truyen',
            key: 'TID'
        }
    },
    TenChuongTruyen: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    LuotXem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    NgayDang: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    GiaChuong: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'ChuongTruyen',
    timestamps: false
});

module.exports = ChuongTruyen;
