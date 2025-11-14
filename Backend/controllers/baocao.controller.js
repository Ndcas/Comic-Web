const baoCaoService = require('../services/baocao.service');

async function baoCaoBinhLuanChuaXuLy(req, res) {
    try {
        let result = await baoCaoService.timBaoCaoBinhLuanChuaXuLy();
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ baoCaoBinhLuans: result.data.baoCaoBinhLuans });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function baoCaoTruyenChuaXuLy(req, res) {
    try {
        let result = await baoCaoService.timBaoCaoTruyenChuaXuLy();
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ baoCaoTruyens: result.data.baoCaoTruyens });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function xuLyBaoCaoBinhLuan(req, res) {
    let { BCBLID, mode } = req.body;
    BCBLID = parseInt(BCBLID);
    mode = parseInt(mode);
    if (!BCBLID || ![0, 1, 2].includes(mode)) {
        return res.status(400).json({ error: 'Thiếu hoặc sai thông tin' })
    }
    try {
        let result = await baoCaoService.xuLyBaoCaoBinhLuan(BCBLID, mode);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Xử lý báo cáo bình luận thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function xuLyBaoCaoTruyen(req, res) {
    let { BCTID, mode } = req.body;
    BCTID = parseInt(BCTID);
    mode = parseInt(mode);
    if (!BCTID || ![0, 1, 2].includes(mode)) {
        return res.status(400).json({ error: 'Thiếu hoặc sai thông tin' })
    }
    try {
        let result = await baoCaoService.xuLyBaoCaoTruyen(BCTID, mode);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Xử lý báo cáo truyện thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = { baoCaoBinhLuanChuaXuLy, baoCaoTruyenChuaXuLy, xuLyBaoCaoBinhLuan, xuLyBaoCaoTruyen };