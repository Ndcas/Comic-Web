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

module.exports = { baoCaoBinhLuanChuaXuLy, baoCaoTruyenChuaXuLy };