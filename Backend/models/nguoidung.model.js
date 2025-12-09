const { DataTypes } = require('sequelize');
const database = require('../database/database');

const NguoiDung = database.define('NguoiDung', {
    NDID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TenTaiKhoan: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    Email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    MatKhau: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
            len: [60, 60]
        }
    },
    Diem: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    NgayThamGia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    TrangThai: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: [[0, 1]]
        }
    },
    NamSinh: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'NguoiDung',
    timestamps: false
});

module.exports = NguoiDung;