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

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]', BCBLID, mode (0: bỏ qua, 1: xóa bình luận, 2: xóa bình luận và chặn người dùng)
router.post('/xuLyBaoCaoBinhLuan', adminFilter.verifyAccessToken, controller.xuLyBaoCaoBinhLuan);

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]', BCTID, mode (0: bỏ qua, 1: xóa truyện, 2: xóa truyện và chặn người dùng)
router.post('/xuLyBaoCaoTruyen', adminFilter.verifyAccessToken, controller.xuLyBaoCaoTruyen);

// Cần BLID, LyDo trong body
router.post('/baoCaoBinhLuan', controller.baoCaoBinhLuan);

// Cần TID, LyDo trong body
router.post('/baoCaoTruyen', controller.baoCaoTruyen);

module.exports = router;