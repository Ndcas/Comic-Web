const NguoiDung = require('../models/admin.model');
const { compare } = require('../utils/hashing');
const { signToken, verifyToken } = require('../utils/token');
const { saveToCache, getFromCache } = require('./cache.service');

const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS) || 300000;

async function dangNhap(email, matKhau) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: { Email: email }
        });
        if (!nguoiDung || !compare(matKhau, nguoiDung.MatKhau)) {
            return {
                ok: false,
                status: 401,
                error: 'Tài khoản hoặc mật khẩu không đúng'
            };
        }
        let payload = {
            NDID: nguoiDung.NDID,
            TenTaiKhoan: nguoiDung.TenTaiKhoan,
            Email: nguoiDung.Email,
            NgayThamGia: nguoiDung.NgayThamGia,
            NamSinh: nguoiDung.NamSinh
        };
        let hanDung = Date.now() + ACCESS_TOKEN_TTL_MS;
        let accessToken = signToken(payload);
        let refreshToken = signToken(payload, true);
        saveToCache(`RTNguoiDung:${nguoiDung.NDID}:${refreshToken}`, "1");
        return {
            ok: true,
            data: {
                accessToken: accessToken,
                hanDung: hanDung,
                refreshToken: refreshToken
            }
        };
    } catch (error) {
        console.error('Lỗi khi đăng nhập người dùng', error);
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
        if (!getFromCache(`RTNguoiDung:${payload.NDID}:${refreshToken}`)) {
            return {
                ok: false,
                status: 403,
                error: 'Token đã bị thu hồi'
            };
        }
        payload = {
            NDID: payload.NDID,
            TenTaiKhoan: payload.TenTaiKhoan,
            Email: payload.Email,
            NgayThamGia: payload.NgayThamGia,
            NamSinh: payload.NamSinh
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
        console.error('Lỗi khi cấp lại access token cho người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { dangNhap, lamMoiAccessToken };