const truyenService = require('../services/truyen.service');

async function truyenMoi(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let limit = parseInt(req.query.limit);
    let offset = parseInt(req.query.offset);
    if (!limit || !offset) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (limit < 1 || offset < 0) {
        return res.status(400).json({ error: 'Yêu cầu không phù hợp' });
    }
    try {
        let result = await truyenService.timTruyenMoi(offset, limit, token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            truyenMoi: result.data
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = { truyenMoi };