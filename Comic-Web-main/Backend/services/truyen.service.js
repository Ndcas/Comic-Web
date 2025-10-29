const database = require('../database/database');
const { verifyToken } = require('../utils/token');
const { QueryTypes } = require('sequelize');

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
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT
                    TID,
                    MAX(NgayDang) AS NgayDang
                FROM
                    ChuongTruyen
                GROUP BY
                    TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0'}
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
        console.error('Lỗi khi tìm truyện mới', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { timTruyenMoi };