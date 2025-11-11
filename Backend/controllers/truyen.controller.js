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
            truyens: result.data.truyenMoi
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
            truyens: result.data.truyenHot
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
            truyens: result.data.truyenTheoTheLoai
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
            truyens: result.data.truyenTheoTuKhoa
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
        return res.json({ chuongTruyen: result.data.chuongTruyen });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function themTruyen(req, res) {
    let { TenTruyen, MoTa, TacGia, GioiHan18Tuoi } = req.body;
    TenTruyen = TenTruyen?.trim();
    if (!TenTruyen) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    MoTa = MoTa?.trim();
    if (!MoTa) {
        MoTa = null;
    }
    TacGia = TacGia?.trim();
    if (!TacGia) {
        TacGia = null;
    }
    GioiHan18Tuoi = GioiHan18Tuoi ? true : false;
    let coverFileName = null;
    if (req.file) {
        coverFileName = req.file.filename;
    }
    if (TenTruyen.length > 200) {
        return res.status(400).json({ error: 'Tên truyện vượt quá 200 ký tự' });
    }
    if (MoTa && MoTa.length > 1000) {
        return res.status(400).json({ error: 'Mô tả vượt quá 1000 ký tự' });
    }
    if (TacGia && TacGia.length > 100) {
        return res.status(400).json({ error: 'Tên tác giả vượt quá 100 ký tự' });
    }
    try {
        let result = await truyenService.themTruyen(req.authorization.NDID, TenTruyen, MoTa, coverFileName, TacGia, GioiHan18Tuoi);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã thêm truyện và đang chờ được duyệt' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function truyenChuaDuyet(req, res) {
    try {
        let result = await truyenService.timTruyenChuaDuyet();
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ truyens: result.data.truyens });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function duyetTruyen(req, res) {
    let { TID, DaDuyet, LyDoTuChoi } = req.body;
    TID = parseInt(TID);
    DaDuyet = (parseInt(DaDuyet) == 1) ? true : false;
    LyDoTuChoi = LyDoTuChoi?.trim() || null;
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (LyDoTuChoi && LyDoTuChoi.length > 500) {
        return res.status(400).json({ error: 'Lý do từ chối vượt quá 500 ký tự' });
    }
    try {
        let result = await truyenService.duyetTruyen(TID, DaDuyet, LyDoTuChoi);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã xử lý duyệt truyện' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function thongTinTruyenAdmin(req, res) {
    let TID = parseInt(req.query.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.layThongTinTruyenAdmin(TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ truyen: result.data.truyen });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function thongTinChuongTruyenAdmin(req, res) {
    let CTID = parseInt(req.query.CTID);
    if (!CTID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.layThongTinChuongTruyenAdmin(CTID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ chuongTruyen: result.data.chuongTruyen });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = {
    truyenMoi,
    truyenHot,
    truyenTheoTheLoai,
    truyenTheoTuKhoa,
    thongTinTruyen,
    thongTinChuongTruyen,
    themTruyen,
    truyenChuaDuyet,
    duyetTruyen,
    thongTinTruyenAdmin,
    thongTinChuongTruyenAdmin
};