const { DataTypes } = require('sequelize');
const database = require('../database/database');

const Truyen = database.define('Truyen', {
    TID: {
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
    TenTruyen: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    MoTa: {
        type: DataTypes.STRING(1000)
    },
    AnhBia: {
        type: DataTypes.STRING(100)
    },
    TacGia: {
        type: DataTypes.STRING(100)
    },
    LuotThich: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    DaDuyet: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: [[-1, 0, 1]]
        }
    },
    LyDoTuChoi: {
        type: DataTypes.STRING(500)
    },
    TrangThai: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: [[0, 1]]
        }
    },
    GioiHan18Tuoi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: [[0, 1]]
        }
    }
}, {
    tableName: 'Truyen',
    timestamps: false
});

module.exports = Truyen;