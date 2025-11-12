const adminFilter = require('../middlewares/adminfilter.middleware');
const controller = require('../controllers/nguoidung.controller');
const express = require('express');
const nguoiDungFilter = require('../middlewares/nguoidungfiler.middleware');

const router = express.Router();

// Yêu cầu Email trong body
// => Gửi email chứa OTP đến email
router.post('/yeuCauOTPDangKy', controller.yeuCauOTPDangKy);

// Yêu cầu TenTaiKhoan, Email, MatKhau, NamSinh, OTP (mã gửi đến email) trong body
router.post('/dangKy', controller.dangKy);

// Yêu cầu Email, MatKhau, ghiNho (checkbox ghi nhớ đăng nhập hay không) trong body 
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken, refeshToken (trong cookie), ghiNho (trong cookie nếu người dùng chọn ghi nhớ đăng nhập)
router.post('/dangNhap', controller.dangNhap);

// Yêu cầu có refreshToken của NguoiDung trong cookie
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken
router.get('/lamMoiAccessToken', controller.lamMoiAccessToken);

// Yêu cầu Email trong body
// => Gửi email chứa OTP đến email
router.post('/yeuCauOTPQuenMatKhau', controller.yeuCauOTPQuenMatKhau);

// Yêu cầu Email, oldPassword (mật khẩu cũ), newPassword (mật khẩu mới), OTP (mã gửi đến email) trong body
router.post('/datLaiMatKhau', controller.datLaiMatKhau);

// Yêu cầu access token của NguoiDung trong header Authorization dạng 'Bearer [access token]', oldPassword (mật khẩu cũ), newPassword (mật khẩu mới) trong body
// => refreshToken (trong cookie), ghiNho (trong cookie nếu người dùng chọn ghi nhớ đăng nhập trước đó)
router.post('/doiMatKhau', nguoiDungFilter.verifyAccessToken, controller.doiMatKhau);

// Yêu cầu access token của NguoiDung trong header Authorization dạng 'Bearer [access token]', refreshToken trong cookie
router.get('/dangXuat', nguoiDungFilter.verifyAccessToken, controller.dangXuat);

// Yêu cầu access token của Admin trong header Authorization dạng 'Bearer [access token]'
// => nguoiDungs (mảng NguoiDung)
router.get('/tatCaNguoiDung', adminFilter.verifyAccessToken, controller.tatCaNguoiDung);

// Yêu cầu access token của Admin trong header Authorization, NDID, Diem, TrangThai trong body
router.post('/capNhatNguoiDung', adminFilter.verifyAccessToken, controller.capNhatNguoiDung);

module.exports = router;