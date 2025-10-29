const nguoiDungService = require('../services/nguoidung.service');

const COOKIE_MAX_AGE_MS = parseInt(process.env.COOKIE_MAX_AGE_MS) || 604800000;

async function dangNhap(req, res) {
    let { Email, MatKhau, ghiNho } = req.body;
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
        let result = nguoiDungService.lamMoiAccessToken(refreshToken);
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