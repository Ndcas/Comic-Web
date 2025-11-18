const truyenService = require('../services/truyen.service');

async function theLoai(req, res) {
    try {
        let result = await truyenService.layDanhSachTheLoai();
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ theLoais: result.data.theLoais });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

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
    let { TenTruyen, MoTa, TacGia, GioiHan18Tuoi, TLIDs } = req.body;
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
    GioiHan18Tuoi = GioiHan18Tuoi ? 1 : 0;
    let coverFileName = null;
    if (req.file) {
        coverFileName = req.file.filename;
    }
    let validTheLoai = true;
    let theLoais = [];
    if (TLIDs instanceof Array) {
        for (let index = 0; index < TLIDs.length; index++) {
            let tlid = parseInt(TLIDs[index]);
            if (!tlid) {
                validTheLoai = false;
                break;
            }
            theLoais.push(tlid);
        }
    } else if (!TLIDs) {
        let tlid = parseInt(TLIDs);
        if (!tlid) {
            validTheLoai = false;
        }
        theLoais.push(tlid);
    }
    if (!validTheLoai) {
        return res.status(400).json({ error: 'Có thể loại không đúng định dạng' });
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
        let result = await truyenService.themTruyen(req.authorization.NDID, TenTruyen, MoTa, coverFileName, TacGia, GioiHan18Tuoi, theLoais);
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

async function thamKhaoYKienAIDuyetTruyen(req, res) {
    let TID = parseInt(req.query.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.thamKhaoYKienAIDuyetTruyen(TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ result: result.data.result });
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

async function xoaTruyenDaDang(req, res) {
    let TID = parseInt(req.body.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.xoaTruyenDaDang(req.authorization.NDID, TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã xóa truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function capNhatTruyen(req, res) {
    let { TID, TrangThai, TLIDs } = req.body;
    TID = parseInt(TID);
    TrangThai = parseInt(TrangThai);
    if (!TID || !TrangThai) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    let theLoais = [];
    let validTheLoai = true;
    if (TLIDs instanceof Array) {
        for (let index = 0; index < TLIDs.length; index++) {
            let tlid = parseInt(TLIDs[index]);
            if (!tlid) {
                validTheLoai = false;
                break;
            }
            theLoais.push(tlid);
        }
    } else if (TLIDs) {
        let tlid = parseInt(TLIDs);
        if (!tlid) {
            validTheLoai = false;
        }
        theLoais.push(tlid);
    }
    if (!validTheLoai) {
        return res.status(400).json({ error: 'Có thể loại không đúng định dạng' });
    }
    try {
        let result = await truyenService.capNhatTruyen(TID, req.authorization.NDID, TrangThai, theLoais);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Cập nhật truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function themChuongTruyen(req, res) {
    let { TID, TenChuongTruyen, GiaChuong } = req.body;
    TID = parseInt(TID);
    TenChuongTruyen = TenChuongTruyen?.trim();
    GiaChuong = parseInt(GiaChuong);
    if (!TID || !TenChuongTruyen || !GiaChuong || req.files.length < 0) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (TenChuongTruyen.length > 200) {
        return res.status(400).json({ error: 'Tên chương truyện vượt quá 200 ký tự' });
    }
    if (GiaChuong < 0) {
        return res.status(400).json({ error: 'Giá chương truyện không hợp lệ' });
    }
    let fileNames = req.files.map(item => item.filename);
    try {
        let result = await truyenService.themChuongTruyen(req.authorization.NDID, TID, TenChuongTruyen, GiaChuong, fileNames);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Thêm chương truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function capNhatGiaChuongTruyen(req, res) {
    let { CTID, GiaChuong } = req.body;
    CTID = parseInt(CTID);
    GiaChuong = parseInt(GiaChuong);
    if (!CTID || !GiaChuong) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (GiaChuong < 0) {
        return res.status(400).json({ error: 'Giá chương truyện không hợp lệ' });
    }
    try {
        let result = await truyenService.capNhatGiaChuongTruyen(req.authorization.NDID, CTID, GiaChuong);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Cập nhật giá chương truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function xoaChuongTruyen(req, res) {
    let CTID = parseInt(req.body.CTID);
    if (!CTID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.xoaChuongTruyen(req.authorization.NDID, CTID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Xóa chương truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function moKhoaChuongTruyen(req, res) {
    let CTID = parseInt(req.body.CTID);
    if (!CTID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.moKhoaChuongTruyen(req.authorization.NDID, CTID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Mở khóa chương truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function tomTatTruyen(req, res) {
    let TID = parseInt(req.query.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.layTomTatTruyen(TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ summary: result.data.summary });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function timTruyenBangAI(req, res) {
    let question = req.query.question?.trim();
    if (!question) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.timTruyenBangAI(question);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ result: result.data.result });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function danhSachBinhLuan(req, res) {
    let TID = parseInt(req.query.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await truyenService.layBinhLuan(TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ binhLuans: result.data.binhLuans });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function binhLuan(req, res) {
    let { TID, NoiDung } = req.body;
    TID = parseInt(TID);
    NoiDung = NoiDung?.trim();
    if (!TID || !NoiDung || NoiDung.length > 300) {
        return res.status(400).json({ error: 'Thiếu thông tin hoặc thông tin không đúng định dạng' });
    }
    try {
        let result = await truyenService.themBinhLuan(req.authorization.NDID, TID, NoiDung);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Thêm bình luận thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = {
    theLoai,
    truyenMoi,
    truyenHot,
    truyenTheoTheLoai,
    truyenTheoTuKhoa,
    thongTinTruyen,
    thongTinChuongTruyen,
    themTruyen,
    truyenChuaDuyet,
    thamKhaoYKienAIDuyetTruyen,
    duyetTruyen,
    thongTinTruyenAdmin,
    thongTinChuongTruyenAdmin,
    xoaTruyenDaDang,
    capNhatTruyen,
    themChuongTruyen,
    capNhatGiaChuongTruyen,
    xoaChuongTruyen,
    moKhoaChuongTruyen,
    tomTatTruyen,
    timTruyenBangAI,
    danhSachBinhLuan,
    binhLuan
};