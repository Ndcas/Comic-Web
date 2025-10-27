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