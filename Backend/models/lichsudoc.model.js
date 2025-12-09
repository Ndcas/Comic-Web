const { DataTypes } = require('sequelize');
const database = require('../database/database');

const LichSuDoc = database.define('LichSuDoc', {
    LSDID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NDID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'NguoiDung',
            key: 'NDID'
        }
    },
    CTID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ChuongTruyen',
            key: 'CTID'
        }
    },
    NgayDoc: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'LichSuDoc',
    timestamps: false
});

module.exports = LichSuDoc;