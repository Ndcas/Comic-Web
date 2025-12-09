const { DataTypes } = require('sequelize');
const database = require('../database/database');

const LichSuDiem = database.define('LichSuDiem', {
    LSDID: {
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
    LGDID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'LoaiGiaoDich',
            key: 'LGDID'
        }
    },
    DiemThayDoi: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    GhiChu: {
        type: DataTypes.STRING(300)
    },
    NgayDoi: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'LichSuDiem',
    timestamps: false
});

module.exports = LichSuDiem;