const Admin = require('../models/admin.model');
const { compare } = require('../utils/hashing');
const { signToken } = require('../utils/token');
const { saveToCache } = require('./cache.service');

const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS) || 300000;

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
        console.error('Lỗi khi đăng nhập quản trị viên', error);
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
        console.error('Lỗi khi cấp lại access token cho admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { dangNhap, lamMoiAccessToken };