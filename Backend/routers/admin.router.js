const { verifyAccessToken } = require('../middlewares/adminfilter.middleware');
const controller = require('../controllers/admin.controller');
const express = require('express');

const router = express.Router();

// Yêu cầu Email, MatKhau trong body 
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), token (access token), refeshToken (trong cookie)
router.post('/dangNhap', controller.dangNhap);

// Yêu cầu có refreshToken của Admin trong cookie
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken
router.get('/lamMoiAccessToken', controller.lamMoiAccessToken);

// Yêu cầu Email trong body
// => Gửi email chứa OTP đến email
router.post('/yeuCauOTPQuenMatKhau', controller.yeuCauOTPQuenMatKhau);

// Yêu cầu Email, oldPassword (mật khẩu cũ), newPassword (mật khẩu mới), OTP (mã gửi đến email) trong body
router.post('/datLaiMatKhau', controller.datLaiMatKhau);

// Yêu cầu access token của Admin trong header Authorization dạng 'Bearer [access token]', oldPassword (mật khẩu cũ), newPassword (mật khẩu mới) trong body
// => refreshToken (trong cookie)
router.post('/doiMatKhau', verifyAccessToken, controller.doiMatKhau);

// Yêu cầu access token của Admin trong header Authorization dạng 'Bearer [access token]'
router.get('/dangXuat', verifyAccessToken, controller.dangXuat);

// Yêu cầu access token của Admin trong header Authorization dạng 'Bearer [access token]', có thể truyền giá trị khác falsy tên force trong query để bắt buộc làm mới báo cáo
// => reportTime (thời gian tạo báo cáo),
// numOfUsers (số tài khoản người dùng còn hoạt động),
// verifiedComics (số truyện được duyệt),
// unverifiedComics (số truyện chờ duyệt),
// rejectedComics (số truyện bị từ chối),
// numOfChapters (số chương truyện),
// unprocessedComicReports (số báo cáo truyện chưa xử lý),
// unprocessedCommentReports (số báo cáo bình luận chưa xử lý),
// profitPointsByDays (mảng object {date (ngày), points (số điểm lời)})
// viewsByDays (mảng object {date (ngày), views (số lượt xem)})
router.get('/baoCaoHeThong', verifyAccessToken, controller.baoCaoHeThong);

module.exports = router;