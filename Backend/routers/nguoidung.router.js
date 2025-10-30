const controller = require('../controllers/nguoidung.controller');
const express = require('express');

const router = express.Router();

// Yêu cầu Email trong body
// => Gửi email chứa OTP đến email
router.post('/yeuCauOTPDangKy', controller.yeuCauOTPDangKy);

// Yêu cầu TenTaiKhoan, Email, MatKhau, NamSinh, OTP (mã gửi đến email) trong body
router.post('/dangKy', controller.dangKy);

// Yêu cầu Email, MatKhau trong body 
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken, refeshToken (trong cookie)
router.post('/dangNhap', controller.dangNhap);

// Yêu cầu có refreshToken trong cookie
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken
router.get('/lamMoiAccessToken', controller.lamMoiAccessToken);

module.exports = router;