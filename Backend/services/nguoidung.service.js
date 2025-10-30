const { Op } = require('sequelize');
const { delFromCache, getFromCache, saveToCache } = require('./cache.service');
const { compare, hash } = require('../utils/hashing');
const { sendEmail } = require('../utils/mail');
const { signToken, verifyToken } = require('../utils/token');
const Admin = require('../models/admin.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/admin.model');

const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS);

async function guiOTPDangKy(email) {
    try {
        let existedNguoiDung = await NguoiDung.findOne({
            where: { Email: email }
        });
        if (existedNguoiDung) {
            return {
                ok: false,
                status: 400,
                error: 'Email đã được đăng kí'
            };
        }
        let existedAdmin = await Admin.findOne({
            where: { Email: email }
        });
        if (existedAdmin) {
            return {
                ok: false,
                status: 400,
                error: 'Email đã được đăng kí'
            };
        }
        let otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        let html = `<p>Mã xác thực của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong vòng 5 phút, vui lòng không chia sẻ mã này với bất kỳ ai khác.</p>`;
        await sendEmail(email, 'Mã OTP đăng kí tài khoản', html);
        saveToCache(`OTPDK:${email}`, otp);
        return {
            ok: true
        };
    } catch (error) {
        logger.error('Lỗi khi gửi OTP đăng ký cho người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function dangKy(tenTaiKhoan, email, matKhau, namSinh, otp) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: {
                [Op.or]: [{
                    TenTaiKhoan: tenTaiKhoan
                }, {
                    Email: email
                }]
            }
        });
        if (nguoiDung) {
            let error = 'Email đã được sử dụng';
            if (tenTaiKhoan.toLowerCase() == nguoiDung.TenTaiKhoan.toLowerCase()) {
                error = 'Tên tài khoản đã được sử dụng';
            }
            return {
                ok: false,
                status: 400,
                error: error
            };
        }
        if (otp != getFromCache(`OTPDK:${email}`)) {
            return {
                ok: false,
                status: 400,
                error: 'Mã OTP không đúng'
            };
        }
        delFromCache(`OTPDK:${email}`);
        let matKhauHash = hash(matKhau);
        let nguoiDungMoi = new NguoiDung();
        nguoiDungMoi.Diem = 0;
        nguoiDungMoi.Email = email;
        nguoiDungMoi.MatKhau = matKhauHash;
        nguoiDungMoi.NamSinh = namSinh;
        nguoiDungMoi.NgayThamGia = new Date();
        nguoiDungMoi.TenTaiKhoan = tenTaiKhoan;
        nguoiDungMoi.TrangThai = 1;
        let nguoiDungDaThem = await nguoiDungMoi.save();
        return {
            ok: true,
            data: {
                NDID: nguoiDungDaThem.NDID
            }
        };
    } catch (error) {
        logger.error('Lỗi khi đăng ký tài khoản người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

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
        logger.error('Lỗi khi đăng nhập người dùng', error);
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
        logger.error('Lỗi khi cấp lại access token cho người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = { guiOTPDangKy, dangKy, dangNhap, lamMoiAccessToken };