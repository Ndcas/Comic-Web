const { verifyAccessToken } = require('../middlewares/adminfilter.middleware');
const controller = require('../controllers/admin.controller');
const express = require('express');

const router = express.Router();

// Yêu cầu Email, MatKhau trong body 
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken, refeshToken (trong cookie)
router.post('/dangNhap', controller.dangNhap);

// Yêu cầu có refreshToken trong cookie
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken
router.get('/lamMoiAccessToken', controller.lamMoiAccessToken);

// Yêu cầu Email trong body
// => Gửi email chứa OTP đến email
router.post('/yeuCauOTPQuenMatKhau', controller.yeuCauOTPQuenMatKhau);

// Yêu cầu Email, oldPassword (mật khẩu cũ), newPassword (mật khẩu mới), OTP (mã gửi đến email) trong body
router.post('/datLaiMatKhau', controller.datLaiMatKhau);

// Yêu cầu access token trong header Authorization dạng 'Bearer [access token]', oldPassword (mật khẩu cũ), newPassword (mật khẩu mới) trong body
// => refreshToken (trong cookie)
router.post('/doiMatKhau', verifyAccessToken, controller.doiMatKhau);

// Yêu cầu access token trong header Authorization dạng 'Bearer [access token]'
router.get('/dangXuat', verifyAccessToken, controller.dangXuat);

module.exports = router;