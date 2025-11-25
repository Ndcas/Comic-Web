const { saveToCache, deleteFromCache, getFromCache } = require('./cache.service');
const { compare } = require('../utils/hashing');
const { signToken } = require('../utils/token');
const Admin = require('../models/admin.model');
const BaoCaoBinhLuan = require('../models/baocaobinhluan.model');
const BaoCaoTruyen = require('../models/baocaotruyen.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const LichSuDiem = require('../models/lichsudiem.model');
const LichSuDoc = require('../models/lichsudoc.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/nguoidung.model');
const Truyen = require('../models/truyen.model');

const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS);
const CACHE_OTP_TTL_SECONDS = parseInt(process.env.CACHE_OTP_TTL_SECONDS);
const PROFIT_RATIO = parseFloat(process.env.PROFIT_RATIO);

async function dangNhap(email, matKhau) {
    try {
        const admin = await Admin.findOne({
            where: { Email: email }
        });
        if (!admin || !compare(matKhau, admin.MatKhau)) {
            return {
                ok: false,
                status: 401,
                error: 'Tài khoản hoặc mật khẩu không đúng'
            };
        }
        let payload = {
            Email: admin.Email,
            isAdmin: true
        };
        let hanDung = Date.now() + ACCESS_TOKEN_TTL_MS;
        let accessToken = signToken(payload);
        let refreshToken = signToken(payload, true);
        saveToCache(`RTAdmin:${admin.Email}`, refreshToken);
        return {
            ok: true,
            data: {
                accessToken: accessToken,
                hanDung: hanDung,
                refreshToken: refreshToken
            }
        };
    } catch (error) {
        logger.error('Lỗi khi đăng nhập quản trị viên', error);
        throw new Error('Lỗi hệ thống');
    }
}

function lamMoiAccessToken(refreshToken) {
    try {
        let payload = verifyToken(refreshToken, true);
        if (!payload) {
            return {
                ok: false,
                status: 401,
                error: 'Token không hợp lệ'
            };
        }
        if (!getFromCache(`RTAdmin:${payload.Email}`)) {
            return {
                ok: false,
                status: 403,
                error: 'Token đã bị thu hồi'
            };
        }
        payload = {
            Email: payload.Email,
            isAdmin: true
        };
        let hanDung = Date.now() + ACCESS_TOKEN_TTL_MS;
        let accessToken = signToken(payload);
        return {
            ok: true,
            data: {
                accessToken: accessToken,
                hanDung: hanDung
            }
        };
    } catch (error) {
        logger.error('Lỗi khi cấp lại access token cho admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function guiOTPQuenMatKhau(email) {
    try {
        let admin = await Admin.findOne({
            where: { Email: email }
        });
        if (!admin) {
            return {
                ok: false,
                status: 400,
                error: 'Tài khoản không tồn tại'
            };
        }
        let otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        let html = `<p>Mã xác thực của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong vòng ${CACHE_OTP_TTL_SECONDS / 60} phút, vui lòng không chia sẻ mã này với bất kỳ ai khác.</p>`;
        await sendEmail(email, 'Mã OTP đặt lại mật khẩu', html);
        saveToCache(`OTPQMKAdmin:${admin.Email}`, otp, CACHE_OTP_TTL_SECONDS);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi gửi OTP quên mật khẩu cho admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function datLaiMatKhau(email, oldPassword, newPassword, otp) {
    try {
        let admin = await Admin.findOne({
            where: { Email: email }
        });
        if (!admin) {
            return {
                ok: false,
                status: 400,
                error: 'Tài khoản không tồn tại'
            };
        }
        if (!compare(oldPassword, admin.MatKhau)) {
            return {
                ok: false,
                status: 400,
                error: 'Mật khẩu cũ không đúng'
            };
        }
        if (getFromCache(`OTPQMKAdmin:${admin.Email}`) != otp) {
            return {
                ok: false,
                status: 400,
                error: 'OTP đã hết hạn hoặc không đúng'
            };
        }
        deleteFromCache(`OTPQMKAdmin:${admin.Email}`);
        admin.MatKhau = hash(newPassword);
        await admin.save();
        deleteFromCache(`RTAdmin:${admin.Email}`);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi đặt lại mật khẩu admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function doiMatKhau(email, oldPassword, newPassword) {
    try {
        let admin = await Admin.findOne({
            where: { Email: email }
        });
        if (!admin) {
            return {
                ok: false,
                status: 401,
                error: 'Tài khoản không tồn tại'
            };
        }
        if (!compare(oldPassword, admin.MatKhau)) {
            return {
                ok: false,
                status: 400,
                error: 'Mật khẩu cũ không đúng'
            };
        }
        admin.MatKhau = hash(newPassword);
        await admin.save();
        deleteFromCache(`RTAdmin:${admin.Email}`);
        let payload = {
            Email: admin.Email,
            isAdmin: true
        };
        let refreshToken = signToken(payload, true);
        saveToCache(`RTAdmin:${admin.Email}`, refreshToken);
        return {
            ok: true,
            data: { refreshToken: refreshToken }
        };
    } catch (error) {
        logger.error('Lỗi khi đổi mật khẩu admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function dangXuat(email) {
    try {
        deleteFromCache(`RTAdmin:${email}`);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi đổi đăng xuất admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layBaoCaoHeThong(force = false) {
    if (!force) {
        let cached = getFromCache('AnalyticReport');
        if (cached) {
            return {
                ok: true,
                data: { report: cached }
            };
        }
    }
    try {
        let numOfUsers = await NguoiDung.count({
            where: { TrangThai: 1 }
        });
        let numOfComics = await Truyen.findAll({
            attributes: [
                'DaDuyet',
                [database.fn('COUNT', database.col('TID')), 'SoTruyen']
            ],
            group: 'TID',
            logging: true
        });
        let verifiedComics = 0;
        let unverifiedComics = 0;
        let rejectedComics = 0;
        numOfComics.forEach(item => {
            if (item.DaDuyet == 1) {
                verifiedComics = item.get('SoTruyen');
            } else if (item.DaDuyet == 0) {
                unverifiedComics = item.get('SoTruyen');
            } else if (item.DaDuyet == -1) {
                rejectedComics = item.get('SoTruyen');
            }
        });
        let numOfChapters = await ChuongTruyen.count();
        let unprocessedCommentReports = await BaoCaoBinhLuan.count({
            where: { DaXuLy: 0 }
        });
        let unprocessedComicReports = await BaoCaoTruyen.count({
            where: { DaXuLy: 0 }
        });
        let toppedUpPointsByDays = await database.query(`
            WITH RECURSIVE Days AS (
                SELECT CURDATE() d
                UNION ALL
                SELECT d - INTERVAL 1 DAY
                FROM Days
                WHERE d > CURDATE() - INTERVAL 29 DAY
            ) SELECT DATE(d) Ngay, COALESCE(SUM(DiemThayDoi), 0) Diem
            FROM Days LEFT JOIN LichSuDiem ON DATE(d) = DATE(NgayDoi) AND LGDID = 2 AND GhiChu LIKE 'Mở khóa chương%'
            GROUP BY Ngay
            ORDER BY Ngay ASC
        `, { type: database.QueryTypes.SELECT });
        let profitPointsByDays = toppedUpPointsByDays.map(item => {
            return {
                date: new Date(item.Ngay),
                points: item.Diem * PROFIT_RATIO
            };
        });
        let viewsByDays = await database.query(`
            WITH RECURSIVE Days AS (
                SELECT CURDATE() d
                UNION ALL
                SELECT d - INTERVAL 1 DAY
                FROM Days
                WHERE d > CURDATE() - INTERVAL 29 DAY
            ) SELECT DATE(d) Ngay, COUNT(NgayDoc) LuotDoc
            FROM Days LEFT JOIN LichSuDoc ON DATE(d) = DATE(NgayDoc)
            GROUP BY Ngay
            ORDER BY Ngay ASC
        `, { type: database.QueryTypes.SELECT });
        viewsByDays = viewsByDays.map(item => {
            return {
                date: new Date(item.Ngay),
                views: item.LuotDoc
            };
        });
        let result = {
            reportTime: new Date(),
            numOfUsers: numOfUsers,
            verifiedComics: verifiedComics,
            unverifiedComics: unverifiedComics,
            rejectedComics: rejectedComics,
            numOfChapters: numOfChapters,
            unprocessedComicReports: unprocessedComicReports,
            unprocessedCommentReports: unprocessedCommentReports,
            profitPointsByDays: profitPointsByDays,
            viewsByDays: viewsByDays
        };
        saveToCache('AnalyticReport', result, 300);
        return {
            ok: true,
            data: result
        };
    } catch (error) {
        logger.error('Lỗi khi lấy báo cáo hệ thống', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { dangNhap, lamMoiAccessToken, guiOTPQuenMatKhau, datLaiMatKhau, doiMatKhau, dangXuat, layBaoCaoHeThong };