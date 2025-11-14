const adminService = require('../services/admin.service');

async function dangNhap(req, res) {
    let { Email, MatKhau } = req.body;
    if (!Email || !MatKhau) {
        return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
    }
    try {
        let result = await adminService.dangNhap(Email, MatKhau);
        if (result.ok) {
            return res.status(result.status).json({ error: result.error });

        }
        res.cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,
            signed: true
        });
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
        let result = adminService.lamMoiAccessToken(refreshToken);
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

module.exports = { dangNhap, lamMoiAccessToken };
async function yeuCauOTPQuenMatKhau(req, res) {
    let { Email } = req.body;
    Email = Email?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    try {
        let result = await adminService.guiOTPQuenMatKhau(Email);
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
        let result = await adminService.datLaiMatKhau(Email, oldPassword, newPassword, OTP);
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
        let result = await adminService.doiMatKhau(req.authorization.Email, oldPassword, newPassword);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        let cookieOptions = {
            httpOnly: true,
            signed: true
        };
        res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
        return res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangXuat(req, res) {
    try {
        let result = await adminService.dangXuat(req.authorization.Email);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        res.clearCookie('refreshToken');
        return res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = { dangNhap, lamMoiAccessToken, yeuCauOTPQuenMatKhau, datLaiMatKhau, doiMatKhau, dangXuat };