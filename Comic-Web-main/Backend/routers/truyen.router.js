const express = require('express');
const controller = require('../controllers/truyen.controller');

const router = express.Router();

// Cần limit (số truyện cần tìm), offset (số truyện bỏ qua) trong query, có thể kèm theo access token trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyenMoi (mảng Truyen)
router.get('/truyenMoi', controller.truyenMoi);

module.exports = router;