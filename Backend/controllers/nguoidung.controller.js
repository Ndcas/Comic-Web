const nguoiDungService = require('../services/nguoidung.service');
const validator = require('validator');

const COOKIE_MAX_AGE_MS = parseInt(process.env.COOKIE_MAX_AGE_MS);

async function yeuCauOTPDangKy(req, res) {
    let { Email } = req.body;
    Email = Email?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    try {
        let result = await nguoiDungService.guiOTPDangKy(Email);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã gửi OTP' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangKy(req, res) {
    let { Email, TenTaiKhoan, MatKhau, NamSinh, OTP } = req.body;
    Email = Email?.trim();
    TenTaiKhoan = TenTaiKhoan?.trim();
    NamSinh = parseInt(NamSinh);
    OTP = OTP?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    if (!TenTaiKhoan || TenTaiKhoan.length > 50 || TenTaiKhoan.length < 3) {
        return res.status(400).json({ error: 'Thiếu tên tài khoản hoặc tên tài khoản không đúng định dạng' });
    }
    if (!MatKhau?.trim() || MatKhau.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    let year = (new Date()).getFullYear();
    if (!NamSinh || NamSinh < year - 150 || NamSinh > year - 5) {
        return res.status(400).json({ error: 'Năm sinh không hợp lệ' });
    }
    if (!OTP) {
        return res.status(400).json({ error: 'Thiếu OTP' });
    }
    try {
        let result = await nguoiDungService.dangKy(TenTaiKhoan, Email, MatKhau, NamSinh, OTP);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đăng ký thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangNhap(req, res) {
    let { Email, MatKhau, ghiNho } = req.body;
    Email = Email?.trim();
    if (!Email || !MatKhau) {
        return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
    }
    try {
        let result = await nguoiDungService.dangNhap(Email, MatKhau);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });

        }
        let cookieOptions = {
            httpOnly: true,
            signed: true,
            secure: true,
            sameSite: 'None'
        };
        if (ghiNho) {
            cookieOptions.maxAge = COOKIE_MAX_AGE_MS;
            res.cookie('ghiNho', '1', cookieOptions);
        }
        res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
        return res.json({
            token: result.data.accessToken,
            hanDung: result.data.hanDung
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function lamMoiAccessToken(req, res) {
    let refreshToken = req.signedCookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Thiếu refresh token' });
    }
    try {
        let result = await nguoiDungService.lamMoiAccessToken(refreshToken);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({
            accessToken: result.data.accessToken,
            hanDung: result.data.hanDung
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function yeuCauOTPQuenMatKhau(req, res) {
    let { Email } = req.body;
    Email = Email?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    try {
        let result = await nguoiDungService.guiOTPQuenMatKhau(Email);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đã gửi OTP' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function datLaiMatKhau(req, res) {
    let { Email, oldPassword, newPassword, OTP } = req.body;
    Email = Email?.trim();
    OTP = OTP?.trim();
    if (!Email || !validator.isEmail(Email) || Email.length > 200) {
        return res.status(400).json({ error: 'Thiếu email hoặc email không đúng định dạng' });
    }
    if (!oldPassword || !newPassword || oldPassword.length < 8 || newPassword.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    if (!OTP) {
        return res.status(400).json({ error: 'Thiếu OTP' });
    }
    try {
        let result = await nguoiDungService.datLaiMatKhau(Email, oldPassword, newPassword, OTP);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function doiMatKhau(req, res) {
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || oldPassword.length < 8 || newPassword.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    try {
        let result = await nguoiDungService.doiMatKhau(req.authorization.NDID, oldPassword, newPassword);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        let cookieOptions = {
            httpOnly: true,
            signed: true,
            secure: true,
            sameSite: 'None'
        };
        if (req.signedCookies.ghiNho == '1') {
            cookieOptions.maxAge = COOKIE_MAX_AGE_MS;
            res.cookie('ghiNho', '1', cookieOptions);
        }
        res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
        return res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function dangXuat(req, res) {
    try {
        let refreshToken = req.signedCookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Thiếu refresh token' });
        }
        let result = await nguoiDungService.dangXuat(req.authorization.NDID, refreshToken);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        res.clearCookie('refreshToken');
        res.clearCookie('ghiNho');
        return res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function tatCaNguoiDung(req, res) {
    try {
        let result = await nguoiDungService.timTatCaNguoiDung();
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ nguoiDungs: result.data.nguoiDungs });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function capNhatNguoiDung(req, res) {
    let { NDID, Diem, TrangThai } = req.body;
    NDID = parseInt(NDID);
    Diem = parseInt(Diem);
    TrangThai = parseInt(TrangThai);
    if (!NDID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    if (!Diem || Diem < 0) {
        return res.status(400).json({ error: 'Điểm không hợp lệ' });
    }
    if (!TrangThai || (TrangThai != 1 && TrangThai != 0)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    try {
        let result = await nguoiDungService.capNhatNguoiDung(NDID, Diem, TrangThai);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Cập nhật người dùng thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function thongTinTaiKhoan(req, res) {
    try {
        let result = await nguoiDungService.layThongTinNguoiDung(req.authorization.NDID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ nguoiDung: result.data.nguoiDung });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function doiTenTaiKhoan(req, res) {
    let TenTaiKhoan = req.body.TenTaiKhoan?.trim();
    if (!TenTaiKhoan || TenTaiKhoan.length > 50 || TenTaiKhoan.length < 3) {
        return res.status(400).json({ error: 'Thiếu tên tài khoản hoặc tên tài khoản không đúng định dạng' });
    }
    try {
        let result = await nguoiDungService.doiTenTaiKhoan(req.authorization.NDID, TenTaiKhoan);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        let cookieOptions = {
            httpOnly: true,
            signed: true,
            secure: true,
            sameSite: 'None'
        };
        if (req.signedCookies.ghiNho == '1') {
            cookieOptions.maxAge = COOKIE_MAX_AGE_MS;
            res.cookie('ghiNho', '1', cookieOptions);
        }
        res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
        return res.json({
            token: result.data.accessToken,
            hanDung: result.data.hanDung
        });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function napDiem(req, res) {
    let diem = parseInt(req.query.diem);
    if (!diem || diem < 10) {
        return res.status(400).json({ error: 'Thiếu điểm hoặc điểm nạp ít hơn 10' });
    }
    try {
        let result = await nguoiDungService.napDiem(req.authorization.NDID, diem);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ url: result.data.url });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function xuLyKetQuaNapDiem(req, res) {
    let NDID = parseInt(req.params.NDID);
    if (!NDID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await nguoiDungService.xuLyKetQuaNapDiem(NDID, req.query);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Nạp điểm thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function rutDiem(req, res) {
    let diem = parseInt(req.body.diem);
    if (!diem || diem < 10) {
        return res.status(400).json({ error: 'Thiếu điểm hoặc điểm rút ít hơn 10' });
    }
    try {
        let result = await nguoiDungService.rutDiem(req.authorization.NDID, diem);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Rút điểm thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function lichSuDoc(req, res) {
    try {
        let result = await nguoiDungService.layLichSuDoc(req.authorization.NDID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ lichSuDoc: result.data.lichSuDoc });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function danhSachYeuThich(req, res) {
    try {
        let result = await nguoiDungService.layDanhSachYeuThich(req.authorization.NDID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ truyens: result.data.truyens });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function themVaoDanhSachYeuThich(req, res) {
    let TID = parseInt(req.body.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await nguoiDungService.themVaoDanhSachYeuThich(req.authorization.NDID, TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Thêm truyện vào danh sách yêu thích thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function xoaKhoiDanhSachYeuThich(req, res) {
    let TID = parseInt(req.body.TID);
    if (!TID) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    try {
        let result = await nguoiDungService.xoaKhoiDanhSachYeuThich(req.authorization.NDID, TID);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.json({ message: 'Xóa truyện khỏi danh sách yêu thích thành công' });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = {
    yeuCauOTPDangKy,
    dangKy,
    dangNhap,
    lamMoiAccessToken,
    yeuCauOTPQuenMatKhau,
    datLaiMatKhau,
    doiMatKhau,
    dangXuat,
    tatCaNguoiDung,
    capNhatNguoiDung,
    thongTinTaiKhoan,
    doiTenTaiKhoan,
    napDiem,
    xuLyKetQuaNapDiem,
    rutDiem,
    lichSuDoc,
    danhSachYeuThich,
    themVaoDanhSachYeuThich,
    xoaKhoiDanhSachYeuThich
};