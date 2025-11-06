const { Op, QueryTypes, where } = require('sequelize');
const { getFromCache, saveToCache } = require('./cache.service');
const { verifyToken } = require('../utils/token');
const ChuongDaMoKhoa = require('../models/chuongdamokhoa.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const HinhAnh = require('../models/hinhanh.model');
const LichSuDoc = require('../models/lichsudoc.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/nguoidung.model');
const TheLoai = require('../models/theloai.model');
const TheLoaiTruyen = require('../models/theloaitruyen.model');
const Truyen = require('../models/truyen.model');

const HOT_COMICS = parseInt(process.env.HOT_COMICS);
const COMICS_PER_PAGE = parseInt(process.env.COMICS_PER_PAGE);
const CACHE_NUM_COMICS_TTL_SECONDS = parseInt(process.env.CACHE_NUM_COMICS_TTL_SECONDS);

async function timTruyenMoi(page, token = null) {
    try {
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let numberOfComics = getFromCache(`SoTruyenMoi:${showR18 ? '1' : '0'}`);
        if (!numberOfComics) {
            let criteria = { DaDuyet: 1 };
            if (!showR18) {
                criteria.GioiHan18Tuoi = 0;
            }
            numberOfComics = await Truyen.count({
                distinct: true,
                where: criteria,
                include: {
                    model: ChuongTruyen,
                    required: true
                }
            });
            saveToCache(`SoTruyenMoi:${showR18 ? '1' : '0'}`, numberOfComics, CACHE_NUM_COMICS_TTL_SECONDS);
        }
        let maxPage = Math.max(1, Math.floor(numberOfComics / COMICS_PER_PAGE));
        page = page > maxPage ? maxPage : page;
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit OFFSET :offset;
        `;
        let result = await database.query(sql, {
            replacements: {
                limit: COMICS_PER_PAGE,
                offset: (page - 1) * COMICS_PER_PAGE
            },
            type: QueryTypes.SELECT
        });
        return {
            ok: true,
            data: {
                page: page,
                maxPage: maxPage,
                result: result
            }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện mới', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenHot(token = null) {
    try {
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(LuotXem) AS MaxLuotXem
                FROM ChuongTruyen
                WHERE NgayDang >= CURDATE() - INTERVAL 7 DAY
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${r18Condition}
            ORDER BY MaxLuotXem DESC
            LIMIT ${HOT_COMICS};
        `;
        let result = await database.query(sql, {
            replacements: { limit: HOT_COMICS },
            type: QueryTypes.SELECT
        });
        if (result.length >= HOT_COMICS) {
            return {
                ok: true,
                data: result
            };
        }
        let newLimit = HOT_COMICS - result.length;
        let TIDs = result.map(item => item.TID);
        let TIDCondition = TIDs.length > 0 ? `AND Truyen.TID NOT IN (${TIDs.join(',')})` : '';
        let newSql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${TIDCondition} ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit
        `;
        let newResult = await database.query(newSql, {
            replacements: { limit: newLimit },
            type: QueryTypes.SELECT
        });
        result.push(...newResult);
    } catch (error) {
        logger.error('Lỗi khi tìm truyện hot', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenTheoTheLoai(tlid, page, token = null) {
    try {
        let theLoai = await TheLoai.findOne({
            attributes: ['TLID'],
            where: { TLID: tlid }
        });
        if (!theLoai) {
            return {
                ok: false,
                status: 400,
                error: 'Thể loại không tồn tại'
            };
        }
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let numberOfComics = getFromCache(`SoTruyenTheoTheLoai:${showR18 ? '1' : '0'}:${tlid}`);
        if (!numberOfComics) {
            let criteria = { DaDuyet: 1 };
            if (!showR18) {
                criteria.GioiHan18Tuoi = 0;
            }
            numberOfComics = await Truyen.count({
                distinct: true,
                where: criteria,
                include: [{
                    model: ChuongTruyen,
                    required: true
                }, {
                    model: TheLoaiTruyen,
                    where: { TLID: tlid },
                    required: true
                }]
            });
            saveToCache(`SoTruyenTheoTheLoai:${showR18 ? '1' : '0'}:${tlid}`, numberOfComics, CACHE_NUM_COMICS_TTL_SECONDS);
        }
        let maxPage = Math.max(1, Math.floor(numberOfComics / COMICS_PER_PAGE));
        page = page > maxPage ? maxPage : page;
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            JOIN TheLoaiTruyen
            ON Truyen.TID = TheLoaiTruyen.TID AND TheLoaiTruyen.TLID = :tlid
            WHERE Truyen.DaDuyet = 1 ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit OFFSET :offset;
        `;
        let result = await database.query(sql, {
            replacements: {
                tlid: tlid,
                limit: COMICS_PER_PAGE,
                offset: (page - 1) * COMICS_PER_PAGE
            },
            type: QueryTypes.SELECT
        });
        return {
            ok: true,
            data: {
                page: page,
                maxPage: maxPage,
                result: result
            }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện theo thể loại', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenTheoTuKhoa(keyword, page, token = null) {
    try {
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let likeCriteria = { [Op.substring]: keyword };
        let criteria = {
            DaDuyet: 1,
            [Op.or]: [{
                TenTruyen: likeCriteria,
                MoTa: likeCriteria,
                TacGia: likeCriteria
            }]
        };
        if (!showR18) {
            criteria.GioiHan18Tuoi = 0;
        }
        let numberOfComics = await Truyen.count({
            distinct: true,
            where: criteria,
            include: {
                model: ChuongTruyen,
                required: true
            }
        });
        let maxPage = Math.max(1, Math.floor(numberOfComics / COMICS_PER_PAGE));
        page = page > maxPage ? maxPage : page;
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 AND TenTruyen LIKE :likeCriteria AND MoTa LIKE :likeCriteria AND TacGia LIKE :likeCriteria ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit OFFSET :offset;
        `;
        let result = await database.query(sql, {
            replacements: {
                likeCriteria: `%${keyword}%`,
                limit: COMICS_PER_PAGE,
                offset: (page - 1) * COMICS_PER_PAGE
            },
            type: QueryTypes.SELECT,
            logging: true
        });
        return {
            ok: true,
            data: {
                page: page,
                maxPage: maxPage,
                result: result
            }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện theo từ khóa', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinTruyen(tid, token = null) {
    try {
        let showR18 = false;
        let ndid = null;
        if (token) {
            let payload = verifyToken(token);
            if (!payload) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
            ndid = payload.NDID;
        }
        let searchCriteria = {
            TID: tid,
            DaDuyet: 1
        };
        if (!showR18) {
            criteria.GioiHan18Tuoi = 0;
        }
        let truyen = await Truyen.findOne({
            where: searchCriteria,
            include: [{
                model: NguoiDung,
                attributes: ['TenTaiKhoan']
            }, {
                model: ChuongTruyen,
                attributes: [],
                required: true
            }]
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            };
        }
        let chuongTruyens;
        if (ndid) {
            chuongTruyens = await ChuongTruyen.findAll({
                where: { TID: tid },
                include: {
                    model: ChuongDaMoKhoa,
                    attributes: ['CTID'],
                    where: { NDID: ndid },
                    required: false
                },
            });
        } else {
            chuongTruyens = await ChuongTruyen.find({
                where: { TID: tid }
            });
        }
        return {
            ok: true,
            data: {
                truyen: truyen,
                chuongTruyens: chuongTruyens
            }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy thông tin truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinChuongTruyen(ctid, token = null) {
    try {
        let showR18 = false;
        let ndid = null;
        let bought = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
            ndid = payload.NDID;
            let chuongDaMoKhoa = await ChuongDaMoKhoa.findOne({
                attributes: ['CTID'],
                where: {
                    CTID: ctid,
                    NDID: ndid
                }
            });
            if (chuongDaMoKhoa) {
                bought = true;
            }
        }
        let includeCriteria = [{
            model: HinhAnh,
            attributes: ['HinhAnh']
        }];
        if (!showR18) {
            includeCriteria.append({
                model: Truyen,
                attributes: [],
                where: { GioiHan18Tuoi: 0 },
                required: true
            });
        }
        let criteria = { CTID: ctid };
        if (!bought) {
            criteria.GiaChuong = 0;
        }
        let chuongTruyen = await ChuongTruyen.findOne({
            where: criteria,
            include: includeCriteria
        });
        if (!chuongTruyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy chương truyện được yêu cầu'
            };
        }
        chuongTruyen.LuotXem += 1;
        let lichSuDoc = new LichSuDoc();
        lichSuDoc.NDID = ndid;
        lichSuDoc.CTID = ctid;
        lichSuDoc.NgayDoc = new Date();
        await database.transaction(async (transaction) => {
            await chuongTruyen.save({ transaction: transaction });
            await lichSuDoc.save({ transaction: transaction });
        })
        return {
            ok: true,
            data: { chuongTruyen: chuongTruyen }
        };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        logger.error('Lỗi khi lấy thông tin chương truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { timTruyenMoi, timTruyenHot, timTruyenTheoTheLoai, timTruyenTheoTuKhoa, layThongTinTruyen, layThongTinChuongTruyen };