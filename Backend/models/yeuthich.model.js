const { DataTypes } = require('sequelize');
const database = require('../database/database');

const YeuThich = database.define('YeuThich', {
    TID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Truyen',
            key: 'TID'
        }
    },
    NDID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'NguoiDung',
            key: 'NDID'
        }
    }
}, {
    tableName: 'YeuThich',
    timestamps: false
});

module.exports = YeuThich;