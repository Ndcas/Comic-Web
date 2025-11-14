const express = require('express');
const router = express.Router(); 
const { verifyAccessToken } = require('../middlewares/adminfilter.middleware');
const controller = require('../controllers/admin.controller');

// Đăng nhập admin
router.post('/dangNhap', controller.dangNhap);

// Làm mới token
router.get('/lamMoiAccessToken', controller.lamMoiAccessToken);

// Yêu cầu OTP để đặt lại mật khẩu
router.post('/yeuCauOTPQuenMatKhau', controller.yeuCauOTPQuenMatKhau);

// Đặt lại mật khẩu bằng OTP
router.post('/datLaiMatKhau', controller.datLaiMatKhau);

// Đổi mật khẩu (yêu cầu token)
router.post('/doiMatKhau', verifyAccessToken, controller.doiMatKhau);

// Đăng xuất (yêu cầu token)
router.get('/dangXuat', verifyAccessToken, controller.dangXuat);

module.exports = router;
