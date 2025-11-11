const { deleteFromCachePrefix } = require('../services/cache.service');
const BaocaoBinhLuan = require('../models/baocaobinhluan.model');
const BaoCaoTruyen = require('../models/baocaotruyen.model');
const BinhLuan = require('../models/binhluan.model');
const ChuongDaMoKhoa = require('../models/chuongdamokhoa.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const HinhAnh = require('../models/hinhanh.model');
const LichSuDoc = require('../models/lichsudoc.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/nguoidung.model');
const Truyen = require('../models/truyen.model');
const YeuThich = require('../models/yeuthich.model');

async function timBaoCaoBinhLuanChuaXuLy() {
    try {
        let result = await BaocaoBinhLuan.findAll({
            where: { DaXuyLy: 0 },
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
            where: { DaXuyLy: 0 }
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
        let baoCao = await BaocaoBinhLuan.findOne({
            where: {
                BCBLID: bcblid,
                DaXuyLy: 0
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
            switch (mode) {
                case 0:
                    baoCao.DaXuLy = 1;
                    await baoCao.save({ transaction: transaction });
                    break;
                case 1:
                    await baoCao.destroy({ transaction: transaction });
                    await BinhLuan.destroy({
                        where: { BLID: baoCao.BLID }
                    }, { transaction: transaction });
                    break;
                case 2:
                    await baoCao.destroy({ transaction: transaction });
                    await BinhLuan.destroy({
                        where: { BLID: baoCao.BLID }
                    }, { transaction: transaction });
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
                    break;
            }
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi xử lý báo cáo bình luận', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function xuLyBaoCaoTruyen(bctid, LyDoTuChoi = null, mode = 0) {
    try {
        let baoCao = await BaoCaoTruyen.findOne({
            where: {
                BCTID: bctid,
                DaXuyLy: 0
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
            where: { TID: baoCao.TID },
            include: [
                { model: ChuongTruyen },
                { model: NguoiDung }
            ]
        });
        if (!truyen) {
            return { ok: true };
        }
        let ctids = truyen.ChuongTruyens.map(item => item.CTID);
        await database.transaction(async (transaction) => {
            // Đang viết
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi tìm báo cáo truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { timBaoCaoBinhLuanChuaXuLy, timBaoCaoTruyenChuaXuLy };