const { DataTypes } = require('sequelize');
const database = require('../database/database');

const BaoCaoBinhLuan = database.define('BaoCaoBinhLuan', {
    BCBLID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    BLID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BinhLuan',
            key: 'BLID'
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
    tableName: 'BaoCaoBinhLuan',
    timestamps: false
});

module.exports = BaoCaoBinhLuan;