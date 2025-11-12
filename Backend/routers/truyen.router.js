const { uploadAnhBia } = require('../middlewares/uploadimage.middleware');
const adminFilter = require('../middlewares/adminfilter.middleware');
const controller = require('../controllers/truyen.controller');
const express = require('express');
const nguoiDungFilter = require('../middlewares/nguoidungfiler.middleware');

const router = express.Router();

// Cần page (số thứ tự trang bắt đầu từ 1) trong query, có thể kèm theo access token của NguoiDung trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyens (mảng Truyen), trangHienTai (số thứ tự trang hiện tại), trangToiDa (số thứ tự trang cuối)
router.get('/truyenMoi', controller.truyenMoi);

// Có thể kèm theo access token của NguoiDung trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyens (mảng Truyen gồm các truyện có chương được đăng trong 7 ngày gần nhất, nếu không đủ số lượng sẽ bù thêm vào bằng truyện mới)
router.get('/truyenHot', controller.truyenHot);

// Cần TLID, page (số thứ tự trang bắt đầu từ 1) trong query, có thể kèm theo access token của NguoiDung trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyens (mảng Truyen), trangHienTai (số thứ tự trang hiện tại), trangToiDa (số thứ tự trang cuối)
router.get('/truyenTheoTheLoai', controller.truyenTheoTheLoai);

// Cần keyword (từ khóa), page (số thứ tự trang bắt đầu từ 1) trong query, có thể kèm theo access token của NguoiDung trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi
// => truyens (mảng Truyen), trangHienTai (số thứ tự trang hiện tại), trangToiDa (số thứ tự trang cuối)
router.get('/truyenTheoTuKhoa', controller.truyenTheoTuKhoa);

// Cần TID trong query, có thể kèm theo access token của NguoiDung trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi và các chương truyện đã mở khóa
// => truyen (Truyen), chuongTruyens (mảng ChuongTruyen có join với ChuongDaMoKhoa nếu truyền token, nếu GiaChuong = 0 hoặc mảng ChuongDaMoKhoas khác undefined và không rỗng thì là có thể xem)
router.get('/thongTinTruyen', controller.thongTinTruyen);

// Cần CTID trong query, có thể kèm theo access token của NguoiDung trong header Authorization dạng 'Bearer [access token]' để xem được các truyện giới hạn độ tuổi và các chương truyện tính phí đã mở khóa
// => chuongTruyen (ChuongTruyen có join với HinhAnh)
router.get('/thongTinChuongTruyen', controller.thongTinChuongTruyen);

// Cần access token của NguoiDung trong header Authorization dạng 'Bearer [access token]', TenTruyen, GioiHan18Tuoi, có thể truyền thêm MoTa, AnhBia (file ảnh bìa phù hợp với filter phía trong middleware), TacGia
router.post('/themTruyen', nguoiDungFilter.verifyAccessToken, uploadAnhBia, controller.themTruyen);

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]'
// => truyens (mảng Truyen)
router.get('/truyenChuaDuyet', adminFilter.verifyAccessToken, controller.truyenChuaDuyet);

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]', TID, DaDuyet (1 để duyệt, các giá trị khác để từ chối), có thể kèm theo LyDoTuChoi
router.post('/duyetTruyen', adminFilter.verifyAccessToken, controller.duyetTruyen);

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]', TID
// => truyen (Truyen có join với ChuongTruyen)
router.get('/thongTinTruyenAdmin', adminFilter.verifyAccessToken, controller.thongTinTruyenAdmin);

// Cần access token của Admin trong header Authorization dạng 'Bearer [access token]', CTID
// => chuongTruyen (ChuongTruyen có join với HinhAnh)
router.get('/thongTinChuongTruyenAdmin', adminFilter.verifyAccessToken, controller.thongTinChuongTruyenAdmin);

module.exports = router;