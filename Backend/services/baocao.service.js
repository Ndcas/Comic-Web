const { Op } = require('sequelize');
const { deleteFromCachePrefix } = require('../services/cache.service');
const { deleteFile } = require('../utils/file');
const BaoCaoBinhLuan = require('../models/baocaobinhluan.model');
const BaoCaoTruyen = require('../models/baocaotruyen.model');
const BinhLuan = require('../models/binhluan.model');
const ChuongDaMoKhoa = require('../models/chuongdamokhoa.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const HinhAnh = require('../models/hinhanh.model');
const LichSuDoc = require('../models/lichsudoc.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/nguoidung.model');
const TheLoaiTruyen = require('../models/theloaitruyen.model');
const Truyen = require('../models/truyen.model');
const YeuThich = require('../models/yeuthich.model');

async function timBaoCaoBinhLuanChuaXuLy() {
    try {
        let result = await BaoCaoBinhLuan.findAll({
            where: { DaXuLy: 0 },
            include: { model: BinhLuan }
        });
        return {
            ok: true,
            data: { baoCaoBinhLuans: result }
        }
    } catch (error) {
        logger.error('Lỗi khi tìm báo cáo bình luận', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timBaoCaoTruyenChuaXuLy() {
    try {
        let result = await BaoCaoTruyen.findAll({
            where: { DaXuLy: 0 }
        });
        return {
            ok: true,
            data: { baoCaoTruyens: result }
        }
    } catch (error) {
        logger.error('Lỗi khi tìm báo cáo truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function xuLyBaoCaoBinhLuan(bcblid, mode = 0) {
    try {
        let baoCao = await BaoCaoBinhLuan.findOne({
            where: {
                BCBLID: bcblid,
                DaXuLy: 0
            }
        });
        if (!baoCao) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy báo cáo được yêu cầu'
            };
        }
        await database.transaction(async (transaction) => {
            if (mode == 0) {
                baoCao.DaXuLy = 1;
                await baoCao.save({ transaction: transaction });
                return;
            }
            if (mode == 1 || mode == 2) {
                await BaoCaoBinhLuan.destroy({
                    where: { BLID: baoCao.BLID }
                }, { transaction: transaction });
                await BinhLuan.destroy({
                    where: { BLID: baoCao.BLID }
                }, { transaction: transaction });
            }
            if (mode == 2) {
                let nguoiDung = await NguoiDung.findOne({
                    where: {
                        NDID: baoCao.NDID,
                        TrangThai: 1
                    }
                }, { transaction: transaction });
                if (nguoiDung) {
                    deleteFromCachePrefix(`RTNguoiDung:${nguoiDung.NDID}`);
                    nguoiDung.TrangThai = 0;
                    await nguoiDung.save({ transaction: transaction });
                }
            }
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi xử lý báo cáo bình luận', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function xuLyBaoCaoTruyen(bctid, mode = 0) {
    try {
        let baoCao = await BaoCaoTruyen.findOne({
            where: {
                BCTID: bctid,
                DaXuLy: 0
            }
        });
        if (!baoCao) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy báo cáo được yêu cầu'
            };
        }
        let truyen = await Truyen.findOne({
            where: { TID: baoCao.TID }
        });
        if (!truyen) {
            return { ok: true };
        }
        let fileHinhAnhs = [];
        let fileAnhBia = truyen.AnhBia;
        await database.transaction(async (transaction) => {
            if (mode == 0) {
                baoCao.DaXuLy = 1;
                await baoCao.save({ transaction: transaction });
                return;
            }
            if (mode == 1 || mode == 2) {
                let chuongTruyens = await ChuongTruyen.findAll({
                    where: { TID: truyen.TID },
                    include: { model: HinhAnh }
                }, { transaction: transaction });
                let ctids = [];
                chuongTruyens.forEach(item => {
                    ctids.push(item.CTID);
                    item.HinhAnhs.forEach(hinhAnh => {
                        fileHinhAnhs.push(hinhAnh.HinhAnh);
                    });
                });
                await YeuThich.destroy({
                    where: { TID: truyen.TID }
                }, { transaction: transaction });
                await TheLoaiTruyen.destroy({
                    where: { TID: truyen.TID }
                }, { transaction: transaction });
                await BinhLuan.destroy({
                    where: { TID: truyen.TID }
                }, { transaction: transaction });
                await BaoCaoTruyen.destroy({
                    where: { TID: truyen.TID }
                }, { transaction: transaction });
                await HinhAnh.destroy({
                    where: {
                        CTID: { [Op.in]: ctids }
                    }
                }, { transaction: transaction });
                await ChuongDaMoKhoa.destroy({
                    where: {
                        CTID: { [Op.in]: ctids }
                    }
                }, { transaction: transaction });
                await LichSuDoc.destroy({
                    where: {
                        CTID: { [Op.in]: ctids }
                    }
                }, { transaction: transaction });
                await ChuongTruyen.destroy({
                    where: { TID: truyen.TID }
                }, { transaction: transaction });
                await truyen.destroy({ transaction: transaction });
            }
            if (mode == 2) {
                let nguoiDung = await NguoiDung.findOne({
                    where: {
                        NDID: truyen.NDID,
                        TrangThai: 1
                    }
                }, { transaction: transaction });
                if (nguoiDung) {
                    deleteFromCachePrefix(`RTNguoiDung:${nguoiDung.NDID}`);
                    nguoiDung.TrangThai = 0;
                    await nguoiDung.save({ transaction: transaction });
                }
            }
        });
        if (mode == 1 || mode == 2) {
            fileHinhAnhs.forEach(async (item) => {
                await deleteFile(`./assets/images/${item}`);
            });
            if (fileAnhBia) {
                await deleteFile(`./assets/covers/${fileAnhBia}`);
            }
        }
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi tìm báo cáo truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function baoCaoBinhLuan(blid, lyDo) {
    try {
        let binhLuan = await BinhLuan.findOne({
            attributes: ['BLID'],
            where: { BLID: blid }
        });
        if (!binhLuan) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy bình luận được yêu cầu'
            };
        }
        await BaoCaoBinhLuan.create({
            BLID: binhLuan.BLID,
            LyDo: lyDo
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi tạo báo cáo bình luận', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function baoCaoTruyen(tid, lyDo) {
    try {
        let truyen = await Truyen.findOne({
            attributes: ['TID'],
            where: {
                TID: tid,
                DaDuyet: 1
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            };
        }
        await BaoCaoTruyen.create({
            TID: truyen.TID,
            LyDo: lyDo
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi tạo báo cáo truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { timBaoCaoBinhLuanChuaXuLy, timBaoCaoTruyenChuaXuLy, xuLyBaoCaoBinhLuan, xuLyBaoCaoTruyen, baoCaoBinhLuan, baoCaoTruyen };