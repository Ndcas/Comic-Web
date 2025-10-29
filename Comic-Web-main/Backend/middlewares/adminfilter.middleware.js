const { verifyToken } = require('../utils/token');

function verifyAccessToken(req, res, next) {
    try {
        if (!req.header('Authorization')) {
            return res.status(400).json({ error: 'Thiếu token' });
        }
        let accessToken = req.header('Authorization').split(' ').length > 1 ? req.header('Authorization').split(' ')[1] : null;
        if (!accessToken) {
            return res.status(400).json({ error: 'Thiếu token' });
        }
        let payload = verifyToken(accessToken);
        if (!payload || !payload.isAdmin) {
            return res.status(401).json({ error: 'Token không hợp lệ' });
        }
        req.authorization = { Email: payload.Email };
        next();
    } catch (error) {
        console.error('Lỗi khi xác thực refresh token của admin', error);
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = { verifyAccessToken };