const { DataTypes } = require('sequelize');
const database = require('../database/database');

const BaoCaoTruyen = database.define('BaoCaoTruyen', {
    BCTID: {
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
    LyDo: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    DaXuLy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: [[0, 1]]
        }
    },
    NgayBaoCao: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'BaoCaoTruyen',
    timestamps: false
});

module.exports = BaoCaoTruyen;