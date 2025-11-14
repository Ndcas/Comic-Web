const { compare } = require('../utils/hashing');
const { signToken } = require('../utils/token');
const { saveToCache, deleteFromCache, getFromCache } = require('./cache.service');
const Admin = require('../models/admin.model');
const logger = require('../utils/logger');

const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS);
const CACHE_OTP_TTL_SECONDS = parseInt(process.env.CACHE_OTP_TTL_SECONDS);

async function dangNhap(email, matKhau) {
    try {
        
    } catch (error) {
        logger.error('Lỗi khi đăng nhập admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

function lamMoiAccessToken(refreshToken) {
    
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
        await saveToCache(`OTPQMKAdmin:${admin.Email}`, otp, CACHE_OTP_TTL_SECONDS);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi gửi OTP quên mật khẩu cho admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function datLaiMatKhau(email, newPassword, otp) {
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
        
        const cachedOTP = await getFromCache(`OTPQMKAdmin:${admin.Email}`);
        if (cachedOTP != otp) { 
            return {
                ok: false,
                status: 400,
                error: 'OTP đã hết hạn hoặc không đúng'
            };
        }
        
        await deleteFromCache(`OTPQMKAdmin:${admin.Email}`);
        admin.MatKhau = hash(newPassword);
        await admin.save();
        await deleteFromCache(`RTAdmin:${admin.Email}`);
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
        await deleteFromCache(`RTAdmin:${admin.Email}`);
        let payload = {
            Email: admin.Email,
            isAdmin: true
        };
        let refreshToken = signToken(payload, true);
        await saveToCache(`RTAdmin:${admin.Email}`, refreshToken);
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
        await deleteFromCache(`RTAdmin:${email}`);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi đổi đăng xuất admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { dangNhap, lamMoiAccessToken, guiOTPQuenMatKhau, datLaiMatKhau, doiMatKhau, dangXuat };