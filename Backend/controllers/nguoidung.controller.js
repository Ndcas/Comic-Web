const nguoiDungService = require('../services/nguoidung.service');
const validator = require('validator');

const COOKIE_MAX_AGE_MS = parseInt(process.env.COOKIE_MAX_AGE_MS);

async function yeuCauOTPDangKy(req, res) {
    let { Email } = req.body;
    Email = Email?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    try {
        let result = await nguoiDungService.guiOTPDangKy(Email);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã gửi OTP' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangKy(req, res) {
    let { Email, TenTaiKhoan, MatKhau, NamSinh, OTP } = req.body;
    Email = Email?.trim();
    TenTaiKhoan = TenTaiKhoan?.trim();
    NamSinh = parseInt(NamSinh);
    OTP = OTP?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    if (!TenTaiKhoan || TenTaiKhoan.length > 50 || TenTaiKhoan.length < 3) {
        return res.status(400).json({ error: 'Thiếu tên tài khoản hoặc tên tài khoản không đúng định dạng' });
    }
    if (!MatKhau?.trim() || MatKhau.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    let year = (new Date()).getFullYear();
    if (!NamSinh || NamSinh < year - 150 || NamSinh > year - 5) {
        return res.status(400).json({ error: 'Năm sinh không hợp lệ' });
    }
    if (!OTP) {
        return res.status(400).json({ error: 'Thiếu OTP' });
    }
    try {
        let result = await nguoiDungService.dangKy(TenTaiKhoan, Email, MatKhau, NamSinh, OTP);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đăng ký thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangNhap(req, res) {
    let { Email, MatKhau, ghiNho } = req.body;
    Email = Email?.trim();
    if (!Email || !MatKhau) {
        return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
    }
    try {
        let result = await nguoiDungService.dangNhap(Email, MatKhau);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });

        }
        let cookieOptions = {
            httpOnly: true,
            signed: true
        };
        if (ghiNho) {
            cookieOptions.maxAge = COOKIE_MAX_AGE_MS;
            res.cookie('ghiNho', '1', cookieOptions);
        }
        res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
        return res.json({
            token: result.data.accessToken,
            hanDung: result.data.hanDung
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function lamMoiAccessToken(req, res) {
    let refreshToken = req.signedCookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Thiếu refresh token' });
    }
    try {
        let result = await nguoiDungService.lamMoiAccessToken(refreshToken);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            accessToken: result.data.accessToken,
            hanDung: result.data.hanDung
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function yeuCauOTPQuenMatKhau(req, res) {
    let { Email } = req.body;
    Email = Email?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    try {
        let result = await nguoiDungService.guiOTPQuenMatKhau(Email);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã gửi OTP' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function datLaiMatKhau(req, res) {
    let { Email, oldPassword, newPassword, OTP } = req.body;
    Email = Email?.trim();
    OTP = OTP?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    if (!oldPassword || !newPassword || oldPassword.length < 8 || newPassword.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    if (!OTP) {
        return res.status(400).json({ error: 'Thiếu OTP' });
    }
    try {
        let result = await nguoiDungService.datLaiMatKhau(Email, oldPassword, newPassword, OTP);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function doiMatKhau(req, res) {
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || oldPassword.length < 8 || newPassword.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    try {
        let result = await nguoiDungService.doiMatKhau(req.authorization.NDID, oldPassword, newPassword);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        let cookieOptions = {
            httpOnly: true,
            signed: true
        };
        if (req.signedCookies.ghiNho == '1') {
            cookieOptions.maxAge = COOKIE_MAX_AGE_MS;
            res.cookie('ghiNho', '1', cookieOptions);
        }
        res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
        return res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangXuat(req, res) {
    try {
        let refreshToken = req.signedCookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Thiếu refresh token' });
        }
        let result = await nguoiDungService.dangXuat(req.authorization.NDID, refreshToken);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        res.clearCookie('refreshToken');
        res.clearCookie('ghiNho');
        return res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = { yeuCauOTPDangKy, dangKy, dangNhap, lamMoiAccessToken, yeuCauOTPQuenMatKhau, datLaiMatKhau, doiMatKhau, dangXuat };