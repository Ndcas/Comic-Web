const controller = require('../controllers/truyen.controller');
const express = require('express');

const router = express.Router();

// Cần limit (số truyện cần tìm), offset (số truyện bỏ qua) trong query, có thể kèm theo access token trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyenMoi (mảng Truyen)
router.get('/truyenMoi', controller.truyenMoi);

// Có thể kèm theo access token trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyenHot (mảng Truyen gồm các truyện có chương được đăng trong 7 ngày gần nhất, nếu không đủ số lượng sẽ bù thêm vào bằng truyện mới)
router.get('/truyenHot', controller.truyenHot);

module.exports = router;