const { Op, QueryTypes } = require('sequelize');
const { getFromCache, saveToCache } = require('./cache.service');
const { verifyToken } = require('../utils/token');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const logger = require('../utils/logger');
const TheLoai = require('../models/theloai.model');
const TheLoaiTruyen = require('../models/theloaitruyen.model');
const Truyen = require('../models/truyen.model');

const HOT_COMICS = parseInt(process.env.HOT_COMICS);
const COMICS_PER_PAGE = parseInt(process.env.COMICS_PER_PAGE);
const CACHE_NUM_COMICS_TTL_SECONDS = parseInt(process.env.CACHE_NUM_COMICS_TTL_SECONDS);

async function timTruyenMoi(page, token = null) {
    try {
        let showR18 = false;
        let currentDate = new Date();
        if (token) {
            let payload = verifyToken(token);
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
        let currentDate = new Date();
        if (token) {
            let payload = verifyToken(token);
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
        let currentDate = new Date();
        if (token) {
            let payload = verifyToken(token);
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
        let currentDate = new Date();
        if (token) {
            let payload = verifyToken(token);
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

module.exports = { timTruyenMoi, timTruyenHot, timTruyenTheoTheLoai, timTruyenTheoTuKhoa };