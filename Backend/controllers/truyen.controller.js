const truyenService = require('../services/truyen.service');

async function truyenMoi(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let page = parseInt(req.query.page);
    if (!page) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (page < 1) {
        return res.status(400).json({ error: 'Số trang không phù hợp' });
    }
    try {
        let result = await truyenService.timTruyenMoi(page, token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            trangHienTai: result.data.page,
            trangToiDa: result.data.maxPage,
            truyen: result.data.result
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function truyenHot(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    try {
        let result = await truyenService.timTruyenHot(token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            truyen: result.data
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function truyenTheoTheLoai(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let TLID = parseInt(req.query.TLID);
    let page = parseInt(req.query.page);
    if (!TLID || !page) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (page < 1) {
        return res.status(400).json({ error: 'Số trang không phù hợp' });
    }
    try {
        let result = await truyenService.timTruyenTheoTheLoai(TLID, page, token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            trangHienTai: result.data.page,
            trangToiDa: result.data.maxPage,
            truyen: result.data.result
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function truyenTheoTuKhoa(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let keyword = req.query.keyword?.trim();
    let page = parseInt(req.query.page);
    if (!keyword || !page) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (page < 1) {
        return res.status(400).json({ error: 'Số trang không phù hợp' });
    }
    try {
        let result = await truyenService.timTruyenTheoTuKhoa(keyword, page, token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            trangHienTai: result.data.page,
            trangToiDa: result.data.maxPage,
            truyen: result.data.result
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = { truyenMoi, truyenHot, truyenTheoTheLoai, truyenTheoTuKhoa };