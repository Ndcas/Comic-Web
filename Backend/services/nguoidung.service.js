const { Op } = require('sequelize');
const { deleteFromCache, deleteFromCachePrefix, getFromCache, saveToCache } = require('./cache.service');
const { compare, hash } = require('../utils/hashing');
const { sendEmail } = require('../utils/mail');
const { getURL, verify } = require('../utils/payment');
const { signToken, verifyToken } = require('../utils/token');
const Admin = require('../models/admin.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const LichSuDiem = require('../models/lichsudiem.model');
const LichSuDoc = require('../models/lichsudoc.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/nguoidung.model');
const Truyen = require('../models/truyen.model');
const YeuThich = require('../models/yeuthich.model');

const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS);
const CACHE_OTP_TTL_SECONDS = parseInt(process.env.CACHE_OTP_TTL_SECONDS);
const BASE_URL = process.env.BASE_URL;

async function guiOTPDangKy(email) {
    try {
        let existedNguoiDung = await NguoiDung.findOne({
            where: { Email: email }
        });
        if (existedNguoiDung) {
            return {
                ok: false,
                status: 400,
                error: 'Email đã được đăng kí'
            };
        }
        let existedAdmin = await Admin.findOne({
            where: { Email: email }
        });
        if (existedAdmin) {
            return {
                ok: false,
                status: 400,
                error: 'Email đã được đăng kí'
            };
        }
        let otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        let html = `<p>Mã xác thực của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong vòng ${CACHE_OTP_TTL_SECONDS / 60} phút, vui lòng không chia sẻ mã này với bất kỳ ai khác.</p>`;
        await sendEmail(email, 'Mã OTP đăng kí tài khoản', html);
        saveToCache(`OTPDK:${email}`, otp, CACHE_OTP_TTL_SECONDS);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi gửi OTP đăng ký cho người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function dangKy(tenTaiKhoan, email, matKhau, namSinh, otp) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: {
                [Op.or]: [{
                    TenTaiKhoan: tenTaiKhoan
                }, {
                    Email: email
                }]
            }
        });
        if (nguoiDung) {
            let error = 'Email đã được sử dụng';
            if (tenTaiKhoan.toLowerCase() == nguoiDung.TenTaiKhoan.toLowerCase()) {
                error = 'Tên tài khoản đã được sử dụng';
            }
            return {
                ok: false,
                status: 400,
                error: error
            };
        }
        if (otp != getFromCache(`OTPDK:${email}`)) {
            return {
                ok: false,
                status: 400,
                error: 'Mã OTP không đúng'
            };
        }
        deleteFromCache(`OTPDK:${email}`);
        let matKhauHash = hash(matKhau);
        let nguoiDungMoi = new NguoiDung();
        nguoiDungMoi.Email = email;
        nguoiDungMoi.MatKhau = matKhauHash;
        nguoiDungMoi.NamSinh = namSinh;
        nguoiDungMoi.TenTaiKhoan = tenTaiKhoan;
        let nguoiDungDaThem = await nguoiDungMoi.save();
        return {
            ok: true,
            data: { NDID: nguoiDungDaThem.NDID }
        };
    } catch (error) {
        logger.error('Lỗi khi đăng ký tài khoản người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function dangNhap(email, matKhau) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: { Email: email }
        });
        if (!nguoiDung || !compare(matKhau, nguoiDung.MatKhau)) {
            return {
                ok: false,
                status: 401,
                error: 'Tài khoản hoặc mật khẩu không đúng'
            };
        }
        if (nguoiDung.TrangThai == 0) {
            return {
                ok: false,
                status: 401,
                error: 'Tài khoản đã bị khóa'
            };
        }
        let payload = {
            NDID: nguoiDung.NDID,
            TenTaiKhoan: nguoiDung.TenTaiKhoan,
            Email: nguoiDung.Email,
            NgayThamGia: nguoiDung.NgayThamGia,
            NamSinh: nguoiDung.NamSinh,
            isUser: true,
            tokenID: Date.now()
        };
        let hanDung = Date.now() + ACCESS_TOKEN_TTL_MS;
        let accessToken = signToken(payload);
        let refreshToken = signToken(payload, true);
        saveToCache(`RTNguoiDung:${nguoiDung.NDID}:${payload.tokenID}`, refreshToken);
        return {
            ok: true,
            data: {
                accessToken: accessToken,
                hanDung: hanDung,
                refreshToken: refreshToken
            }
        };
    } catch (error) {
        logger.error('Lỗi khi đăng nhập người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function lamMoiAccessToken(refreshToken) {
    try {
        let payload = verifyToken(refreshToken, true);
        if (!payload) {
            return {
                ok: false,
                status: 401,
                error: 'Token không hợp lệ'
            };
        }
        if (getFromCache(`RTNguoiDung:${payload.NDID}:${payload.tokenID}`) != refreshToken) {
            return {
                ok: false,
                status: 403,
                error: 'Token đã bị thu hồi'
            };
        }
        payload = {
            NDID: payload.NDID,
            TenTaiKhoan: payload.TenTaiKhoan,
            Email: payload.Email,
            NgayThamGia: payload.NgayThamGia,
            NamSinh: payload.NamSinh,
            isUser: true,
            tokenID: payload.tokenID
        };
        let hanDung = Date.now() + ACCESS_TOKEN_TTL_MS;
        let accessToken = signToken(payload);
        return {
            ok: true,
            data: {
                accessToken: accessToken,
                hanDung: hanDung
            }
        };
    } catch (error) {
        logger.error('Lỗi khi cấp lại access token cho người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function guiOTPQuenMatKhau(email) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: {
                Email: email,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 400,
                error: 'Tài khoản không tồn tại hoặc đã bị khóa'
            };
        }
        let otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        let html = `<p>Mã xác thực của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong vòng ${CACHE_OTP_TTL_SECONDS / 60} phút, vui lòng không chia sẻ mã này với bất kỳ ai khác.</p>`;
        await sendEmail(email, 'Mã OTP đặt lại mật khẩu', html);
        saveToCache(`OTPQMK:${email}`, otp, CACHE_OTP_TTL_SECONDS);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi gửi OTP quên mật khẩu cho người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function datLaiMatKhau(email, oldPassword, newPassword, otp) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: {
                Email: email,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 400,
                error: 'Tài khoản không tồn tại hoặc đã bị khóa'
            };
        }
        if (!compare(oldPassword, nguoiDung.MatKhau)) {
            return {
                ok: false,
                status: 400,
                error: 'Mật khẩu cũ không đúng'
            };
        }
        if (getFromCache(`OTPQMK:${email}`) != otp) {
            return {
                ok: false,
                status: 400,
                error: 'OTP đã hết hạn hoặc không đúng'
            };
        }
        deleteFromCache(`OTPQMK:${email}`);
        nguoiDung.MatKhau = hash(newPassword);
        await nguoiDung.save();
        deleteFromCachePrefix(`RTNguoiDung:${nguoiDung.NDID}`);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi đặt lại mật khẩu người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function doiMatKhau(id, oldPassword, newPassword) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: {
                NDID: id,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Tài khoản không tồn tại hoặc đã bị khóa'
            };
        }
        if (!compare(oldPassword, nguoiDung.MatKhau)) {
            return {
                ok: false,
                status: 400,
                error: 'Mật khẩu cũ không đúng'
            };
        }
        nguoiDung.MatKhau = hash(newPassword);
        await nguoiDung.save();
        deleteFromCachePrefix(`RTNguoiDung:${nguoiDung.NDID}`);
        let payload = {
            NDID: nguoiDung.NDID,
            TenTaiKhoan: nguoiDung.TenTaiKhoan,
            Email: nguoiDung.Email,
            NgayThamGia: nguoiDung.NgayThamGia,
            NamSinh: nguoiDung.NamSinh,
            isUser: true,
            tokenID: Date.now()
        };
        let refreshToken = signToken(payload, true);
        saveToCache(`RTNguoiDung:${nguoiDung.NDID}:${payload.tokenID}`, refreshToken);
        return {
            ok: true,
            data: { refreshToken: refreshToken }
        };
    } catch (error) {
        logger.error('Lỗi khi đổi mật khẩu người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function dangXuat(id, refreshToken) {
    try {
        let payload = verifyToken(refreshToken, true);
        if (payload) {
            deleteFromCache(`RTNguoiDung:${id}:${payload.tokenID}`);
        }
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi đổi đăng xuất người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTatCaNguoiDung() {
    try {
        let result = await NguoiDung.findAll({
            attributes: {
                exclude: ['MatKhau']
            }
        });
        return {
            ok: true,
            data: { nguoiDungs: result }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm tất cả người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function capNhatNguoiDung(ndid, trangThai, diem = null) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: { NDID: ndid }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 404,
                error: 'Người dùng không tồn tại'
            };
        }
        if (diem != null) {
            nguoiDung.Diem = diem;
        }
        nguoiDung.TrangThai = trangThai;
        if (trangThai == 0) {
            deleteFromCachePrefix(`RTNguoiDung:${nguoiDung.NDID}`);
        }
        await nguoiDung.save();
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi cập nhật thông tin người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinNguoiDung(ndid) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: {
                exclude: ['TrangThai', 'MatKhau', 'NDID']
            },
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 404,
                error: 'Người dùng không tồn tại hoặc đã bị chặn'
            };
        }
        return {
            ok: true,
            data: { nguoiDung: nguoiDung }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy thông tin người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function doiTenTaiKhoan(ndid, tenTaiKhoan) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }
        nguoiDung.TenTaiKhoan = tenTaiKhoan;
        await nguoiDung.save();
        deleteFromCachePrefix(`RTNguoiDung:${nguoiDung.NDID}`);
        let payload = {
            NDID: nguoiDung.NDID,
            TenTaiKhoan: nguoiDung.TenTaiKhoan,
            Email: nguoiDung.Email,
            NgayThamGia: nguoiDung.NgayThamGia,
            NamSinh: nguoiDung.NamSinh,
            isUser: true,
            tokenID: Date.now()
        };
        let hanDung = Date.now() + ACCESS_TOKEN_TTL_MS;
        let accessToken = signToken(payload);
        let refreshToken = signToken(payload, true);
        saveToCache(`RTNguoiDung:${nguoiDung.NDID}:${payload.tokenID}`, refreshToken);
        return {
            ok: true,
            data: {
                accessToken: accessToken,
                hanDung: hanDung,
                refreshToken: refreshToken
            }
        };
    } catch (error) {
        logger.error('Lỗi khi đổi tên tài khoản người dùng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function napDiem(ndid, diem) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: ['NDID'],
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }
        let returnPath = BASE_URL + `/nguoiDung/xuLyKetQuaNapDiem/${nguoiDung.NDID}`;
        let url = getURL(diem * 1000, returnPath);
        logger.info(`Đã tạo URL nạp điểm ${url.transID}: ${url.url}`);
        saveToCache(`TransactionID:${url.transID}`, '1');
        return {
            ok: true,
            data: { url: url.url }
        };
    } catch (error) {
        logger.error('Lỗi khi tạo URL nạp điểm', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function xuLyKetQuaNapDiem(ndid, requestQuery) {
    let status = verify(requestQuery);
    if (!status.ok) {
        logger.info(`Từ chối xử lý kết quả giao dịch ${status.transID} do ${status.error}`);
        return {
            ok: false,
            status: 400,
            error: `${status.error}\nMã giao dịch: ${status.transID}`
        };
    }
    if (getFromCache(`TransactionID:${status.transID}`) != '1') {
        logger.info(`Từ chối xử lý kết quả giao dịch ${status.transID} do ID giao dịch không còn trong bộ nhớ đệm`);
        return {
            ok: false,
            status: 400,
            error: `Giao dịch đã được xử lý trước đó\nMã giao dịch: ${status.transID}`
        };
    } else {
        deleteFromCache(`TransactionID:${status.transID}`);
    }
    try {
        let diem = requestQuery.amount / 1000;
        await database.transaction(async (transaction) => {
            await NguoiDung.increment({ Diem: diem }, {
                where: { NDID: ndid },
                transaction: transaction
            });
            await LichSuDiem.create({
                NDID: ndid,
                LGDID: 1,
                DiemThayDoi: diem,
                GhiChu: `Nạp điểm mã giao dịch ${status.transID}`
            }, { transaction: transaction });
        });
        logger.info(`Xử lý thành công giao dịch ${status.transID}`);
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi xử lý kết quả nạp điểm', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function rutDiem(ndid, diem) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: ['NDID'],
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }
        if (nguoiDung.Diem < diem) {
            return {
                ok: false,
                status: 400,
                error: 'Người dùng không có đủ điểm để rút'
            };
        }
        throw new Error('Tính năng chưa được triển khai');
    } catch (error) {
        logger.error('Lỗi khi rút điểm', error);
        throw new Error('Lỗi hệ thống');
    }
}


async function layLichSuDoc(ndid) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: ['NDID'],
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }
        let lichSuDoc = await LichSuDoc.findAll({
            where: { NDID: nguoiDung.NDID },
            include: {
                model: ChuongTruyen,
                include: { model: Truyen }
            },
            order: [
                ['NgayDoc', 'DESC']
            ]
        });
        return {
            ok: true,
            data: { lichSuDoc: lichSuDoc }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy lịch sử đọc', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layDanhSachYeuThich(ndid) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: ['NDID'],
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }
        let truyens = await Truyen.findAll({
            include: {
                model: YeuThich,
                where: { NDID: nguoiDung.NDID },
                required: true
            }
        });
        return {
            ok: true,
            data: { truyens: truyens }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy danh sách yêu thích', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function themVaoDanhSachYeuThich(ndid, tid) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: ['NDID'],
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }

        let truyen = await Truyen.findOne({
            attributes: ['TID'],
            where: {
                TID: tid,
                DaDuyet: 1
            },
            include: {
                model: ChuongTruyen,
                attributes: [],
                required: true
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            }
        }

        let yeuThich = await YeuThich.findOne({
            where: {
                NDID: nguoiDung.NDID,
                TID: truyen.TID
            }
        });

        if (yeuThich) {
            return {
                ok: false,
                status: 400,
                error: 'Truyện đã có trong danh sách yêu thích'
            };
        }

        await database.transaction(async (transaction) => {
            await YeuThich.create({
                NDID: nguoiDung.NDID,
                TID: truyen.TID
            }, { transaction: transaction });
            await Truyen.increment({ LuotThich: 1 }, {
                where: { TID: truyen.TID },
                transaction: transaction
            });
        });

        return {
            ok: true
        };
    } catch (error) {
        logger.error('Lỗi khi thêm truyện vào danh sách yêu thích', error);
        throw new Error('Lỗi hệ thống');
    }
}



async function xoaKhoiDanhSachYeuThich(ndid, tid) {
    try {
        let nguoiDung = await NguoiDung.findOne({
            attributes: ['NDID'],
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!nguoiDung) {
            return {
                ok: false,
                status: 401,
                error: 'Không tìm thấy người dùng hoặc người dùng đã bị chặn'
            };
        }
        let yeuThich = await YeuThich.findOne({
            where: {
                NDID: nguoiDung.NDID,
                TID: tid
            }
        });
        if (!yeuThich) {
            return {
                ok: false,
                status: 400,
                error: 'Không có lượt thích khớp với yêu cầu'
            }
        }
        await database.transaction(async (transaction) => {
            await yeuThich.destroy({ transaction: transaction });
            await Truyen.decrement({ LuotThich: 1 }, {
                where: { TID: yeuThich.TID },
                transaction: transaction
            });
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi xóa truyện khỏi danh sách yêu thích', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = {
    guiOTPDangKy,
    dangKy,
    dangNhap,
    lamMoiAccessToken,
    guiOTPQuenMatKhau,
    datLaiMatKhau,
    doiMatKhau,
    dangXuat,
    timTatCaNguoiDung,
    capNhatNguoiDung,
    layThongTinNguoiDung,
    doiTenTaiKhoan,
    napDiem,
    xuLyKetQuaNapDiem,
    rutDiem,
    layLichSuDoc,
    layDanhSachYeuThich,
    themVaoDanhSachYeuThich,
    xoaKhoiDanhSachYeuThich
};