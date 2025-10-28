const BaoCaoBinhLuan = require('../models/baocaobinhluan.model');
const BaoCaoTruyen = require('../models/baocaotruyen.model');
const BinhLuan = require('../models/binhluan.model');
const ChuongDaMoKhoa = require('../models/chuongdamokhoa.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const HinhAnh = require('../models/hinhanh.model');
const LichSuDiem = require('../models/lichsudiem.model');
const LichSuDoc = require('../models/lichsudoc.model');
const LoaiGiaoDich = require('../models/loaigiaodich.model');
const NguoiDung = require('../models/nguoidung.model');
const TheLoai = require('../models/theloai.model');
const TheLoaiTruyen = require('../models/theloaitruyen.model');
const Truyen = require('../models/truyen.model');
const YeuThich = require('../models/yeuthich.model');

const restrict = {
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT'
}

function declareAssociation() {
    //Quan hệ cho BaoCaoBinhLuan
    BaoCaoBinhLuan.belongsTo(BinhLuan, {
        foreignKey: {
            name: 'BLID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho BaoCaoTruyen
    BaoCaoTruyen.belongsTo(Truyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho BinhLuan
    BinhLuan.hasMany(BaoCaoBinhLuan, {
        foreignKey: {
            name: 'BLID',
            allowNull: false
        },
        ...restrict
    });
    BinhLuan.belongsTo(NguoiDung, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    BinhLuan.belongsTo(Truyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho ChuongDaMoKhoa
    ChuongDaMoKhoa.belongsTo(NguoiDung, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    ChuongDaMoKhoa.belongsTo(ChuongTruyen, {
        foreignKey: {
            name: 'CTID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho ChuongTruyen
    ChuongTruyen.hasMany(ChuongDaMoKhoa, {
        foreignKey: {
            name: 'CTID',
            allowNull: false
        },
        ...restrict
    });
    ChuongTruyen.hasMany(HinhAnh, {
        foreignKey: {
            name: 'CTID',
            allowNull: false
        },
        ...restrict
    });
    ChuongTruyen.hasMany(LichSuDoc, {
        foreignKey: {
            name: 'CTID',
            allowNull: false
        },
        ...restrict
    });
    ChuongTruyen.belongsTo(Truyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho HinhAnh
    HinhAnh.belongsTo(ChuongTruyen, {
        foreignKey: {
            name: 'CTID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho LichSuDiem
    LichSuDiem.belongsTo(NguoiDung, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    LichSuDiem.belongsTo(LoaiGiaoDich, {
        foreignKey: {
            name: 'LGDID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho LichSuDoc
    LichSuDoc.belongsTo(ChuongTruyen, {
        foreignKey: {
            name: 'CTID',
            allowNull: false
        },
        ...restrict
    });
    LichSuDoc.belongsTo(NguoiDung, {
        foreignKey: 'NDID',
        ...restrict
    });
    //Quan hệ cho LoaiGiaoDich
    LoaiGiaoDich.hasMany(LichSuDiem, {
        foreignKey: {
            name: 'LGDID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho NguoiDung
    NguoiDung.hasMany(BinhLuan, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    NguoiDung.hasMany(ChuongDaMoKhoa, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    NguoiDung.hasMany(LichSuDiem, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    NguoiDung.hasMany(LichSuDoc, {
        foreignKey: 'NDID',
        ...restrict
    });
    NguoiDung.hasMany(Truyen, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    NguoiDung.hasMany(YeuThich, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho TheLoai
    TheLoai.hasMany(TheLoaiTruyen, {
        foreignKey: {
            name: 'TLID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho TheLoaiTruyen
    TheLoaiTruyen.belongsTo(TheLoai, {
        foreignKey: {
            name: 'TLID',
            allowNull: false
        },
        ...restrict
    });
    TheLoaiTruyen.belongsTo(Truyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho Truyen
    Truyen.hasMany(BaoCaoTruyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    Truyen.hasMany(BinhLuan, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    Truyen.hasMany(ChuongTruyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    Truyen.belongsTo(NguoiDung, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    Truyen.hasMany(TheLoaiTruyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    Truyen.hasMany(YeuThich, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
    //Quan hệ cho YeuThich
    YeuThich.belongsTo(NguoiDung, {
        foreignKey: {
            name: 'NDID',
            allowNull: false
        },
        ...restrict
    });
    YeuThich.belongsTo(Truyen, {
        foreignKey: {
            name: 'TID',
            allowNull: false
        },
        ...restrict
    });
}

module.exports = { declareAssociation };