const { QueryTypes } = require('sequelize');
const { verifyToken } = require('../utils/token');
const database = require('../database/database');
const logger = require('../utils/logger');

const SO_TRUYEN_HOT = parseInt(process.env.SO_TRUYEN_HOT);

async function timTruyenMoi(offset, limit, token = null) {
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
                limit: limit,
                offset: offset
            },
            type: QueryTypes.SELECT
        });
        return {
            ok: true,
            data: result
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
            LIMIT ${SO_TRUYEN_HOT};
        `;
        let result = await database.query(sql, {
            replacements: { limit: SO_TRUYEN_HOT },
            type: QueryTypes.SELECT
        });
        if (result.length >= SO_TRUYEN_HOT) {
            return {
                ok: true,
                data: result
            };
        }
        let newLimit = SO_TRUYEN_HOT - result.length;
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

module.exports = { timTruyenMoi, timTruyenHot };