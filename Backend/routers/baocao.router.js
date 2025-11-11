const adminFilter = require('../middlewares/adminfilter.middleware');
const controller = require('../controllers/baocao.controller');
const express = require('express');

const router = express.Router();

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]'
// => baoCaoBinhLuans (mảng BaoCaoBinhLuan có join với BinhLuan)
router.get('/baoCaoBinhLuanChuaXuLy', adminFilter.verifyAccessToken, controller.baoCaoBinhLuanChuaXuLy);

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]'
// => baoCaoTruyens (mảng BaoCaoTruyen)
router.get('/baoCaoTruyenChuaXuLy', adminFilter.verifyAccessToken, controller.baoCaoTruyenChuaXuLy);

module.exports = router;