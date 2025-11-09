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
            truyens: result.data.result
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
            truyens: result.data
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
            truyens: result.data.result
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
            truyens: result.data.result
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function thongTinTruyen(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let TID = parseInt(req.query.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.layThongTinTruyen(TID, token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            truyen: result.data.truyen,
            chuongTruyens: result.data.chuongTruyens
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function thongTinChuongTruyen(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let CTID = parseInt(req.query.CTID);
    if (!CTID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.layThongTinChuongTruyen(CTID, token);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            truyen: result.data.truyen,
            chuongTruyen: result.data.chuongTruyen
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function themTruyen(req, res) {
    let token = req.header('Authorization')?.split(' ')[1];
    let { TenTruyen, MoTa, TacGia, GioiHan18Tuoi } = req.body;
    if (req.file) {
        console.log(req.file.filename);
    }
    return res.json({ message: 'ok' });
}

module.exports = { truyenMoi, truyenHot, truyenTheoTheLoai, truyenTheoTuKhoa, thongTinTruyen, thongTinChuongTruyen, themTruyen };