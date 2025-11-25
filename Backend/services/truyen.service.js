const { Op, QueryTypes } = require('sequelize');
const { getFromCache, saveToCache } = require('./cache.service');
const { askGemini } = require('../utils/googleapi');
const { verifyToken } = require('../utils/token');
const BaoCaoTruyen = require('../models/baocaotruyen.model');
const BinhLuan = require('../models/binhluan.model');
const ChuongDaMoKhoa = require('../models/chuongdamokhoa.model');
const ChuongTruyen = require('../models/chuongtruyen.model');
const database = require('../database/database');
const fs = require('fs/promises');
const HinhAnh = require('../models/hinhanh.model');
const LichSuDiem = require('../models/lichsudiem.model');
const LichSuDoc = require('../models/lichsudoc.model');
const logger = require('../utils/logger');
const NguoiDung = require('../models/nguoidung.model');
const TheLoai = require('../models/theloai.model');
const TheLoaiTruyen = require('../models/theloaitruyen.model');
const Truyen = require('../models/truyen.model');
const YeuThich = require('../models/yeuthich.model');

const HOT_COMICS = parseInt(process.env.HOT_COMICS);
const COMICS_PER_PAGE = parseInt(process.env.COMICS_PER_PAGE);
const CACHE_NUM_COMICS_TTL_SECONDS = parseInt(process.env.CACHE_NUM_COMICS_TTL_SECONDS);
const GOOGLE_API_RESULT_CACHE_TTL_SECONDS = parseInt(process.env.GOOGLE_API_RESULT_CACHE_TTL_SECONDS);
const PROFIT_RATIO = parseFloat(process.env.PROFIT_RATIO);

const comicFindingContext = `
    Bạn sẽ chatbot hỗ trợ việc tìm kiếm truyện trong cơ sở dữ liệu.
    Khi người dùng gửi yêu cầu tìm truyện, hệ thống sẽ chuyển tới bạn và bạn sẽ tạo ra câu truy vấn SQL Select để tìm thông tin truyện, trả lời "Không thể tạo truy vấn." nếu bạn không thể tạo được câu truy vấn phù hợp khi được yêu cầu hoặc yêu cầu vi phạm các nguyên tắc được liệt ra ở đây.
    Khi trả lời SQL, đảm bảo là câu trả lời có thể được thực thi SQL ngay mà không có các ký tự không cần thiết.
    Sau đó hệ thống sẽ chuyển dữ liệu tìm được và bạn sẽ chuyển nó thành văn bản không định dạng để hệ thống chuyển tới người dùng.
    Chỉ tạo các câu lệnh select, không tạo các câu lệnh khác. Chỉ tìm các truyện đã được duyệt và có ít nhất 1 chương truyện, không tìm kiếm dựa trên thông tin nhạy cảm hoặc không quan trọng với người đọc ví dụ như các ID, lý do từ chối truyện hay các yêu cầu liên quan tới tài khoản người dùng
    Nếu truyện có giới hạn độ tuổi, hãy báo với người dùng là họ sẽ cần phải đăng nhập với tài khoản có độ tuổi phù hợp để tìm được truyện đó.
    
    Cở sở dự liệu mà bạn tạo câu truy vấn là cơ sở dữ liệu MySQL với cấu trúc các bảng có thể truy vấn như sau:
    CREATE TABLE truyen (
        TID int(11) NOT NULL, (đây là ID truyện)
        NDID int(11) NOT NULL, (khóa ngoại ID người đăng)
        TenTruyen varchar(200) NOT NULL, (tên truyện)
        MoTa varchar(1000) DEFAULT NULL, (mô tả truyện)
        AnhBia varchar(100) DEFAULT NULL, (tên file ảnh bìa)
        TacGia varchar(100) DEFAULT NULL, (tên tác giả)
        LuotThich int(11) NOT NULL DEFAULT 0 CHECK (LuotThich >= 0), (lượt thích)
        DaDuyet int(11) NOT NULL DEFAULT 0 CHECK (DaDuyet in (-1,0,1)), (tình trạng đã duyệt của truyện, 1 là đã duyệt)
        LyDoTuChoi varchar(500) DEFAULT NULL, (lý do từ chối truyện)
        TrangThai int(11) NOT NULL DEFAULT 1 CHECK (TrangThai in (0,1)), (trạng thái hiện tại của truyện 0 là đã kết thúc, 1 là còn tiếp)
        GioiHan18Tuoi int(11) NOT NULL DEFAULT 0 CHECK (GioiHan18Tuoi in (0,1)) (giới hạn độ tuổi, 0 là không giới hạn, 1 là có yêu cầu 18 tuổi)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE chuongtruyen (
        CTID int(11) NOT NULL, (ID chương truyện)
        TID int(11) NOT NULL, (khóa ngoại ID truyện)
        TenChuongTruyen varchar(200) NOT NULL, (tên chương truyện)
        LuotXem int(11) NOT NULL DEFAULT 0 CHECK (LuotXem >= 0), (lượt xem)
        NgayDang datetime NOT NULL, (ngày đăng)
        GiaChuong int(11) NOT NULL DEFAULT 0 CHECK (GiaChuong >= 0) (giá để mở khóa chương)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE theloaitruyen (
        TLID int(11) NOT NULL, (ID thể loại)
        TID int(11) NOT NULL (ID truyện)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

const comicSummaryContext = `
    Bạn là 1 chatbot chuyên trả lời vấn đề yêu cầu tóm tắt nội dung truyện tranh.
    Hãy trả lời bằng văn bản không định dạng ngắn gọn trong vòng 500 chữ.
    Nếu bạn tìm thấy nhiều truyện khớp hãy cung cấp tóm tắt ngắn gọn của tất cả.
    Hãy từ chối các câu hỏi không liên quan và hãy cảnh báo người dùng nếu truyện đó có các thể không phù hợp với một số người về vấn đề nội dung nhạy cảm hoặc chính trị
`;

const comicValidationContext = `
    Bạn là 1 chatbot hỗ trợ kiểm tra duyệt truyện của 1 trang web truyện tranh.
    Người dùng sẽ gửi thông tin về truyện được yêu cầu và bạn sẽ tìm xem liệu truyện đó có nguy cơ gây ra vấn đề bản quyền hoặc các vấn đề nhạy cảm khi được đăng lên trang web mà có thể thu phí khi người đọc muốn đọc truyện.
    Hãy trả lời ngắn gọn và không trả lời các câu hỏi không liên quan.
`;

async function layDanhSachTheLoai() {
    try {
        let cached = getFromCache('TheLoai');
        if (cached) {
            return {
                ok: true,
                data: { theLoais: cached }
            };
        }
        let result = await TheLoai.findAll();
        saveToCache('TheLoai', result, 600);
        return {
            ok: true,
            data: { theLoais: result }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy danh sách thể loại', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenMoi(page, token = null) {
    try {
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload || !payload.isUser) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let numberOfComics = getFromCache(`SoTruyenMoi:${showR18 ? '1' : '0'}`);
        if (!numberOfComics) {
            let criteria = { DaDuyet: 1 };
            if (!showR18) {
                criteria.GioiHan18Tuoi = 0;
            }
            numberOfComics = await Truyen.count({
                distinct: true,
                where: criteria,
                include: {
                    model: ChuongTruyen,
                    required: true
                }
            });
            saveToCache(`SoTruyenMoi:${showR18 ? '1' : '0'}`, numberOfComics, CACHE_NUM_COMICS_TTL_SECONDS);
        }
        let maxPage = Math.max(1, Math.floor(numberOfComics / COMICS_PER_PAGE));
        page = page > maxPage ? maxPage : page;
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit OFFSET :offset;
        `;
        let result = await database.query(sql, {
            replacements: {
                limit: COMICS_PER_PAGE,
                offset: (page - 1) * COMICS_PER_PAGE
            },
            type: QueryTypes.SELECT
        });
        return {
            ok: true,
            data: {
                page: page,
                maxPage: maxPage,
                truyenMoi: result
            }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện mới', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenHot(token = null) {
    try {
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload || !payload.isUser) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(LuotXem) AS MaxLuotXem
                FROM ChuongTruyen
                WHERE NgayDang >= CURDATE() - INTERVAL 7 DAY
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${r18Condition}
            ORDER BY MaxLuotXem DESC
            LIMIT ${HOT_COMICS};
        `;
        let result = await database.query(sql, {
            replacements: { limit: HOT_COMICS },
            type: QueryTypes.SELECT
        });
        if (result.length >= HOT_COMICS) {
            return {
                ok: true,
                data: result
            };
        }
        let newLimit = HOT_COMICS - result.length;
        let TIDs = result.map(item => item.TID);
        let TIDCondition = TIDs.length > 0 ? `AND Truyen.TID NOT IN (${TIDs.join(',')})` : '';
        let newSql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 ${TIDCondition} ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit
        `;
        let newResult = await database.query(newSql, {
            replacements: { limit: newLimit },
            type: QueryTypes.SELECT
        });
        result.push(...newResult);
        return {
            ok: true,
            data: { truyenHot: result }
        }
    } catch (error) {
        logger.error('Lỗi khi tìm truyện hot', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenTheoTheLoai(tlid, page, token = null) {
    try {
        let theLoai = await TheLoai.findOne({
            attributes: ['TLID'],
            where: { TLID: tlid }
        });
        if (!theLoai) {
            return {
                ok: false,
                status: 400,
                error: 'Thể loại không tồn tại'
            };
        }
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload || !payload.isUser) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let numberOfComics = getFromCache(`SoTruyenTheoTheLoai:${showR18 ? '1' : '0'}:${tlid}`);
        if (!numberOfComics) {
            let criteria = { DaDuyet: 1 };
            if (!showR18) {
                criteria.GioiHan18Tuoi = 0;
            }
            numberOfComics = await Truyen.count({
                distinct: true,
                where: criteria,
                include: [{
                    model: ChuongTruyen,
                    required: true
                }, {
                    model: TheLoaiTruyen,
                    where: { TLID: tlid },
                    required: true
                }]
            });
            saveToCache(`SoTruyenTheoTheLoai:${showR18 ? '1' : '0'}:${tlid}`, numberOfComics, CACHE_NUM_COMICS_TTL_SECONDS);
        }
        let maxPage = Math.max(1, Math.floor(numberOfComics / COMICS_PER_PAGE));
        page = page > maxPage ? maxPage : page;
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            JOIN TheLoaiTruyen
            ON Truyen.TID = TheLoaiTruyen.TID AND TheLoaiTruyen.TLID = :tlid
            WHERE Truyen.DaDuyet = 1 ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit OFFSET :offset;
        `;
        let result = await database.query(sql, {
            replacements: {
                tlid: tlid,
                limit: COMICS_PER_PAGE,
                offset: (page - 1) * COMICS_PER_PAGE
            },
            type: QueryTypes.SELECT
        });
        return {
            ok: true,
            data: {
                page: page,
                maxPage: maxPage,
                truyenTheoTheLoai: result
            }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện theo thể loại', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenTheoTuKhoa(keyword, page, token = null) {
    try {
        let showR18 = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload || !payload.isUser) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
        }
        let likeCriteria = { [Op.substring]: keyword };
        let criteria = {
            DaDuyet: 1,
            [Op.or]: [{
                TenTruyen: likeCriteria,
                MoTa: likeCriteria,
                TacGia: likeCriteria
            }]
        };
        if (!showR18) {
            criteria.GioiHan18Tuoi = 0;
        }
        let numberOfComics = await Truyen.count({
            distinct: true,
            where: criteria,
            include: {
                model: ChuongTruyen,
                required: true
            }
        });
        let maxPage = Math.max(1, Math.floor(numberOfComics / COMICS_PER_PAGE));
        page = page > maxPage ? maxPage : page;
        let r18Condition = showR18 ? '' : 'AND Truyen.GioiHan18Tuoi = 0';
        let sql = `
            SELECT Truyen.*
            FROM Truyen
            JOIN(
                SELECT TID, MAX(NgayDang) AS NgayDang
                FROM ChuongTruyen
                GROUP BY TID
            ) AS a
            ON Truyen.TID = a.TID
            WHERE Truyen.DaDuyet = 1 AND TenTruyen LIKE :likeCriteria AND MoTa LIKE :likeCriteria AND TacGia LIKE :likeCriteria ${r18Condition}
            ORDER BY a.NgayDang DESC
            LIMIT :limit OFFSET :offset;
        `;
        let result = await database.query(sql, {
            replacements: {
                likeCriteria: `%${keyword}%`,
                limit: COMICS_PER_PAGE,
                offset: (page - 1) * COMICS_PER_PAGE
            },
            type: QueryTypes.SELECT,
            logging: true
        });
        return {
            ok: true,
            data: {
                page: page,
                maxPage: maxPage,
                truyenTheoTuKhoa: result
            }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện theo từ khóa', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinTruyen(tid, token = null) {
    try {
        let showR18 = false;
        let ndid = null;
        if (token) {
            let payload = verifyToken(token);
            if (!payload || !payload.isUser) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
            ndid = payload.NDID;
        }
        let searchCriteria = {
            TID: tid,
            DaDuyet: 1
        };
        if (!showR18) {
            criteria.GioiHan18Tuoi = 0;
        }
        let truyen = await Truyen.findOne({
            where: searchCriteria,
            include: [{
                model: NguoiDung,
                attributes: ['TenTaiKhoan']
            }, {
                model: ChuongTruyen,
                attributes: [],
                required: true
            }, {
                model: TheLoaiTruyen,
                include: {
                    model: TheLoai,
                    attributes: ['TenTheLoai']
                }
            }]
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            };
        }
        let chuongTruyens;
        if (ndid) {
            chuongTruyens = await ChuongTruyen.findAll({
                where: { TID: tid },
                include: {
                    model: ChuongDaMoKhoa,
                    attributes: ['CTID'],
                    where: { NDID: ndid },
                    required: false
                },
            });
        } else {
            chuongTruyens = await ChuongTruyen.find({
                where: { TID: tid }
            });
        }
        return {
            ok: true,
            data: {
                truyen: truyen,
                chuongTruyens: chuongTruyens
            }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy thông tin truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinChuongTruyen(ctid, token = null) {
    try {
        let showR18 = false;
        let ndid = null;
        let bought = false;
        if (token) {
            let payload = verifyToken(token);
            if (!payload || !payload.isUser) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Access token không hợp lệ'
                };
            }
            let currentDate = new Date();
            if (currentDate.getFullYear() - payload.NamSinh >= 18) {
                showR18 = true;
            }
            ndid = payload.NDID;
            let chuongDaMoKhoa = await ChuongDaMoKhoa.findOne({
                attributes: ['CTID'],
                where: {
                    CTID: ctid,
                    NDID: ndid
                }
            });
            if (chuongDaMoKhoa) {
                bought = true;
            }
        }
        let includeCriteria = [{
            model: HinhAnh,
            attributes: ['HinhAnh']
        }];
        if (!showR18) {
            includeCriteria.append({
                model: Truyen,
                attributes: [],
                where: { GioiHan18Tuoi: 0 },
                required: true
            });
        }
        let criteria = { CTID: ctid };
        if (!bought) {
            criteria.GiaChuong = 0;
        }
        let chuongTruyen = await ChuongTruyen.findOne({
            where: criteria,
            include: includeCriteria
        });
        if (!chuongTruyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy chương truyện được yêu cầu'
            };
        }
        chuongTruyen.LuotXem += 1;
        let lichSuDoc = new LichSuDoc();
        lichSuDoc.NDID = ndid;
        lichSuDoc.CTID = ctid;
        await database.transaction(async (transaction) => {
            await chuongTruyen.save({ transaction: transaction });
            await lichSuDoc.save({ transaction: transaction });
        })
        return {
            ok: true,
            data: { chuongTruyen: chuongTruyen }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy thông tin chương truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function themTruyen(ndid, tenTruyen, moTa, coverFileName, tacGia, gioiHan18Tuoi, theLoais) {
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
                error: 'Người dùng không có quyền đăng truyện'
            };
        }
        let countTheLoai = await TheLoai.count({
            where: {
                TLID: { [Op.in]: theLoais }
            }
        });
        if (countTheLoai != theLoais.length) {
            return {
                ok: false,
                status: 400,
                error: 'Có thể loại không tồn tại'
            };
        }
        await database.transaction(async (transaction) => {
            let truyen = await Truyen.create({
                NDID: ndid,
                TenTruyen: tenTruyen,
                MoTa: moTa,
                TacGia: tacGia,
                AnhBia: coverFileName,
                GioiHan18Tuoi: gioiHan18Tuoi
            }, { transaction: transaction });
            let theLoaiTruyens = [];
            theLoais.forEach(item => {
                theLoaiTruyens.push({
                    TID: truyen.TID,
                    TLID: item
                });
            });
            await TheLoaiTruyen.bulkCreate(theLoaiTruyens, {
                validate: true,
                transaction: transaction
            });
        })
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi lấy thêm truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenChuaDuyet() {
    try {
        let result = await Truyen.findAll({
            where: { DaDuyet: 0 }
        });
        return ({
            ok: true,
            data: { truyens: result }
        })
    } catch (error) {
        logger.error('Lỗi khi tìm truyện chưa duyệt', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function thamKhaoYKienAIDuyetTruyen(tid) {
    try {
        let truyen = await Truyen.findOne({
            where: {
                TID: tid,
                DaDuyet: 0
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            };
        }
        let question = `Hãy giúp tôi kiểm tra truyện ${truyen.TenTruyen} của tác giả ${truyen.TacGia ? truyen.TacGia : 'chưa biết'}`
        let result = await askGemini(comicValidationContext, question);
        return {
            ok: true,
            data: { result: result }
        };
    } catch (error) {
        logger.error('Lỗi khi tham khảo ý kiến AI để duyệt truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function duyetTruyen(tid, daDuyet, lyDoTuChoi = null) {
    try {
        let truyen = await Truyen.findOne({
            where: {
                TID: tid,
                DaDuyet: 0
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            };
        }
        if (!daDuyet) {
            truyen.DaDuyet = -1;
            truyen.LyDoTuChoi = lyDoTuChoi;
        } else {
            truyen.DaDuyet = 1;
        }
        await truyen.save();
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi duyệt truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinTruyenAdmin(tid) {
    try {
        let truyen = await Truyen.findOne({
            where: { TID: tid },
            include: { model: ChuongTruyen }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            };
        }
        return {
            ok: true,
            data: { truyen: truyen }
        }
    } catch (error) {
        logger.error('Lỗi khi lấy thông tin truyện cho Admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layThongTinChuongTruyenAdmin(ctid) {
    try {
        let chuongTruyen = await ChuongTruyen.findOne({
            where: { CTID: ctid },
            include: { model: HinhAnh }
        });
        if (!chuongTruyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy chương truyện được yêu cầu'
            };
        }
        return {
            ok: true,
            data: { chuongTruyen: chuongTruyen }
        }
    } catch (error) {
        logger.error('Lỗi khi lấy thông tin chương truyện cho Admin', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenDaDang(ndid) {
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
                status: 404,
                error: 'Người dùng không tồn tại hoặc đã bị chặn'
            };
        }
        let truyens = await Truyen.findAll({
            where: { NDID: nguoiDung.NDID }
        });
        return {
            ok: true,
            data: { truyens: truyens }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện đã đăng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function tinhSoDiemCanDeXoaTruyen(tid) {
    try {
        let truyen = await Truyen.findByPk(tid);
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện'
            };
        }
        if (truyen.DaDuyet == 0 || truyen.DaDuyet == -1) {
            return {
                ok: true,
                data: { diem: 0 }
            };
        }
        let chuongTruyens = await ChuongTruyen.findAll({
            attributes: [],
            where: { TID: truyen.TID },
            include: {
                model: ChuongDaMoKhoa,
                attributes: ['Diem'],
                required: true
            }
        });
        let diem = 0;
        chuongTruyens.forEach(item => {
            item.ChuongDaMoKhoas.forEach(chuongDaMoKhoa => {
                diem += chuongDaMoKhoa.Diem;
            });
        });
        return {
            ok: true,
            data: { diem: diem }
        };
    } catch (error) {
        logger.error('Lỗi khi tính số điểm cần để xóa truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function xoaTruyenDaDang(ndid, tid) {
    try {
        let truyen = await Truyen.findOne({
            where: {
                NDID: ndid,
                TID: tid
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu của người dùng'
            };
        }
        if (truyen.DaDuyet == 0 || truyen.DaDuyet == -1) {
            await truyen.destroy();
            return { ok: true };
        }
        let fileHinhAnhs = [];
        let fileAnhBia = truyen.AnhBia;
        await database.transaction(async (transaction) => {
            let nguoiDung = await NguoiDung.findOne({
                where: { NDID: truyen.NDID }
            }, { transaction: transaction });
            let chuongTruyens = await ChuongTruyen.findAll({
                where: { TID: truyen.TID },
                include: { model: HinhAnh }
            }, { transaction: transaction });
            let ctids = [];
            chuongTruyens.forEach(item => {
                ctids.push(item.CTID);
                item.HinhAnhs.forEach(hinhAnh => {
                    fileHinhAnhs.push(hinhAnh.HinhAnh);
                });
            });
            await YeuThich.destroy({
                where: { TID: truyen.TID }
            }, { transaction: transaction });
            await TheLoaiTruyen.destroy({
                where: { TID: truyen.TID }
            }, { transaction: transaction });
            await BinhLuan.destroy({
                where: { TID: truyen.TID }
            }, { transaction: transaction });
            await BaoCaoTruyen.destroy({
                where: { TID: truyen.TID }
            }, { transaction: transaction });
            await HinhAnh.destroy({
                where: {
                    CTID: { [Op.in]: ctids }
                }
            }, { transaction: transaction });
            let chuongDaMoKhoas = await ChuongDaMoKhoa.findAll({
                where: {
                    CTID: { [Op.in]: ctids }
                }
            }, { transaction: transaction });
            let lichSuDiems = [];
            let today = new Date();
            for (let index = 0; index < chuongDaMoKhoas.length; index++) {
                lichSuDiems.push({
                    NDID: chuongDaMoKhoas[index].NDID,
                    LGDID: 3,
                    DiemThayDoi: chuongDaMoKhoas[index].Diem,
                    GhiChu: `Điểm hoàn từ việc xóa truyện ${truyen.TenTruyen}`,
                    NgayDoi: today
                });
                await NguoiDung.increment({ Diem: chuongDaMoKhoas[index].Diem }, {
                    where: { NDID: chuongDaMoKhoas[index].NDID },
                    transaction: transaction
                });
                nguoiDung.Diem -= chuongDaMoKhoas[index].Diem;
                if (nguoiDung.Diem < 0) {
                    throw new Error('Không đủ điểm');
                }
            }
            await LichSuDiem.bulkCreate(lichSuDiems, {
                validate: true,
                transaction: transaction
            });
            await nguoiDung.save({ transaction: transaction });
            await ChuongDaMoKhoa.destroy({
                where: {
                    CTID: { [Op.in]: ctids }
                }
            }, { transaction: transaction });
            await LichSuDoc.destroy({
                where: {
                    CTID: { [Op.in]: ctids }
                }
            }, { transaction: transaction });
            await ChuongTruyen.destroy({
                where: { TID: truyen.TID }
            }, { transaction: transaction });
            await truyen.destroy({ transaction: transaction });
        });
        fileHinhAnhs.forEach(async (item) => {
            try {
                await fs.unlink(`./assets/images/${item}`);
            } catch (error) {
                logger.error('Lỗi khi xóa file hình ảnh', error);
            }
        });
        if (fileAnhBia) {
            try {
                await fs.unlink(`./assets/covers/${fileAnhBia}`);
            } catch (error) {
                logger.error('Lỗi khi xóa file ảnh bìa', error);
            }
        }
        return { ok: true };
    } catch (error) {
        if (error.message == 'Không đủ điểm') {
            return {
                ok: false,
                status: 400,
                error: 'Không đủ điểm để xóa truyện'
            };
        }
        logger.error('Lỗi khi xóa truyện đã đăng', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function capNhatTruyen(tid, ndid, trangThai, theLoais) {
    try {
        let truyen = await Truyen.findOne({
            where: {
                TID: tid,
                NDID: ndid
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu của người dùng'
            }
        }
        let countTheLoai = await TheLoai.count({
            where: {
                TLID: { [Op.in]: theLoais }
            }
        });
        if (countTheLoai != theLoais.length) {
            return {
                ok: false,
                status: 400,
                error: 'Có thể loại không tồn tại'
            };
        }
        truyen.TrangThai = trangThai;
        await database.transaction(async (transaction) => {
            await truyen.save({ transaction: transaction });
            await TheLoaiTruyen.destroy({
                where: { TID: truyen.TID }
            }, { transaction: transaction });
            let theLoaiTruyens = [];
            theLoais.forEach(item => {
                theLoaiTruyens.push({
                    TID: truyen.TID,
                    TLID: item
                });
            });
            await TheLoaiTruyen.bulkCreate(theLoaiTruyens, {
                validate: true,
                transaction: transaction
            });
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi cập nhật truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function themChuongTruyen(ndid, tid, tenChuongTruyen, giaChuong, fileHinhAnhs) {
    try {
        let truyen = await Truyen.findOne({
            attributes: ['TID'],
            where: {
                TID: tid,
                NDID: ndid
            }
        });
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu của người dùng'
            };
        }
        await database.transaction(async (transaction) => {
            let chuongTruyen = await ChuongTruyen.create({
                TID: truyen.TID,
                TenChuongTruyen: tenChuongTruyen,
                GiaChuong: giaChuong
            }, { transaction: transaction });
            let hinhAnhs = [];
            fileHinhAnhs.forEach(item => {
                hinhAnhs.push({
                    CTID: chuongTruyen.CTID,
                    HinhAnh: item
                });
            });
            await HinhAnh.bulkCreate(hinhAnhs, {
                validate: true,
                transaction: transaction
            });
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi thêm chương truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function capNhatGiaChuongTruyen(ndid, ctid, giaChuong) {
    try {
        let chuongTruyen = await ChuongTruyen.findOne({
            where: {
                CTID: ctid
            },
            include: {
                model: Truyen,
                attributes: [],
                where: { NDID: ndid }
            }
        });
        if (!chuongTruyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy chương truyện được yêu cầu của người dùng'
            };
        }
        chuongTruyen.GiaChuong = giaChuong;
        await chuongTruyen.save();
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi thêm chương truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function xoaChuongTruyen(ndid, ctid) {
    try {
        let chuongTruyen = await ChuongTruyen.findOne({
            where: {
                CTID: ctid
            },
            include: [{
                model: Truyen,
                attributes: [],
                where: { NDID: ndid }
            }, {
                model: HinhAnh
            }]
        });
        if (!chuongTruyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy chương truyện được yêu cầu của người dùng'
            };
        }
        await database.transaction(async (transaction) => {
            let nguoiDung = await NguoiDung.findByPk(ndid);
            await HinhAnh.destroy({
                where: { CTID: chuongTruyen.CTID }
            }, { transaction: transaction });
            let chuongDaMoKhoas = await ChuongDaMoKhoa.findAll({
                where: { CTID: chuongTruyen.CTID }
            }, { transaction: transaction });
            let lichSuDiems = [];
            let today = new Date();
            for (let index = 0; index < chuongDaMoKhoas.length; index++) {
                lichSuDiems.push({
                    NDID: chuongDaMoKhoas[index].NDID,
                    LGDID: 3,
                    DiemThayDoi: chuongDaMoKhoas[index].Diem,
                    GhiChu: `Điểm hoàn từ việc xóa chương ${chuongTruyen.TenChuongTruyen}`,
                    NgayDoi: today
                });
                await NguoiDung.increment({ Diem: chuongDaMoKhoas[index].Diem }, {
                    where: { NDID: chuongDaMoKhoas[index].NDID },
                    transaction: transaction
                });
                nguoiDung.Diem -= chuongDaMoKhoas[index].Diem;
                if (nguoiDung.Diem < 0) {
                    throw new Error('Không đủ điểm');
                }
            }
            await LichSuDiem.bulkCreate(lichSuDiems, {
                validate: true,
                transaction: transaction
            });
            await nguoiDung.save({ transaction: transaction });
            await ChuongDaMoKhoa.destroy({
                where: { CTID: chuongTruyen.CTID }
            }, { transaction: transaction });
            await LichSuDoc.destroy({
                where: { CTID: chuongTruyen.CTID }
            }, { transaction: transaction });
            await chuongTruyen.destroy({ transaction: transaction });
        });
        chuongTruyen.HinhAnhs.forEach(async (item) => {
            try {
                await fs.unlink(`./assets/images/${item.HinhAnh}`);
            } catch (error) {
                logger.error('Lỗi khi xóa file hình ảnh', error);
            }
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi xóa chương truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function moKhoaChuongTruyen(ndid, ctid) {
    try {
        let chuongTruyen = await ChuongTruyen.findOne({
            where: { CTID: ctid },
            include: {
                model: Truyen,
                attributes: ['NDID']
            }
        });
        if (!chuongTruyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy chương truyện được yêu cầu'
            };
        }
        let reader = await NguoiDung.findOne({
            where: {
                NDID: ndid,
                TrangThai: 1
            }
        });
        if (!reader) {
            return {
                ok: false,
                status: 401,
                error: 'Người dùng không có quyền mở khóa chương truyện'
            };
        }
        if (reader.Diem < chuongTruyen.GiaChuong) {
            return {
                ok: false,
                status: 400,
                error: 'Người dùng không có quyền đủ diểm để mở khóa chương'
            };
        }
        await database.transaction(async (transaction) => {
            await NguoiDung.decrement({ Diem: chuongTruyen.GiaChuong }, {
                where: { NDID: reader.NDID },
                transaction: transaction
            });
            await NguoiDung.increment({
                Diem: chuongTruyen.GiaChuong * (1 - PROFIT_RATIO)
            }, {
                where: { NDID: chuongTruyen.Truyen.NDID },
                transaction: transaction
            });
            await LichSuDiem.bulkCreate([{
                NDID: reader.NDID,
                LGDID: 2,
                DiemThayDoi: chuongTruyen.GiaChuong,
                GhiChu: `Mở khóa chương ${chuongTruyen.TenChuongTruyen}`
            }, {
                NDID: chuongTruyen.Truyen.NDID,
                LGDID: 1,
                DiemThayDoi: chuongTruyen.GiaChuong * (1 - PROFIT_RATIO),
                GhiChu: `Điểm người đọc mở khóa chương ${chuongTruyen.TenChuongTruyen}`
            }], {
                validate: true,
                transaction: transaction
            });
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi mở khóa chương truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layTomTatTruyen(tid) {
    try {
        let cached = getFromCache(`Summary:${tid}`);
        if (cached) {
            return {
                ok: true,
                data: { summary: cached }
            };
        }
        let truyen = await Truyen.findByPk(tid);
        if (!truyen) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy truyện được yêu cầu'
            }
        }
        let question = `Hãy tóm tắt truyện ${truyen.TenTruyen} của tác giả ${truyen.TacGia ? truyen.TacGia : 'chưa biết'}`;
        let response = await askGemini(comicSummaryContext, question);
        if (!response) {
            response = 'Tôi không tìm thấy thông tin về truyện này';
        }
        saveToCache(`Summary:${tid}`, response, GOOGLE_API_RESULT_CACHE_TTL_SECONDS);
        return {
            ok: true,
            data: { summary: response }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy tóm tắt truyện', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function timTruyenBangAI(question) {
    try {
        let theLoais = getFromCache('TheLoai');
        if (!theLoais) {
            theLoais = await TheLoai.findAll();
            saveToCache('TheLoai', theLoais, 600);
        }
        let askContext = comicFindingContext + `\nĐây là dữ liệu về thể loại: ${JSON.stringify(theLoais)}`;
        let sql = await askGemini(askContext, `Hãy tạo câu SQL truy vấn cho yêu cầu: ${question}`);
        let lowerSQL = sql.toLowerCase();
        if (lowerSQL.includes('update') || lowerSQL.includes('delete') || !lowerSQL.includes('select')) {
            return {
                ok: false,
                status: 400,
                error: 'Không thể tìm truyện được yêu cầu'
            };
        }
        let data = await database.query(sql, { type: QueryTypes.SELECT });
        if (data.length == 0) {
            return {
                ok: true,
                data: { result: 'Không tìm được truyện nào khớp với yêu cầu' }
            };
        }
        let result = await askGemini(comicFindingContext, `Đây là dữ liệu về truyện được trả về bởi câu lệnh SQL: ${JSON.stringify(data)}`);
        return {
            ok: true,
            data: { result: result }
        };
    } catch (error) {
        logger.error('Lỗi khi tìm truyện bằng AI', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function layBinhLuan(tid) {
    try {
        let binhLuans = await BinhLuan.findAll({
            where: { TID: tid },
            include: {
                model: NguoiDung,
                attributes: ['TenTaiKhoan']
            },
            order: [
                ['ThoiGianBinhLuan', 'DESC']
            ]
        });
        return {
            ok: true,
            data: { binhLuans: binhLuans }
        };
    } catch (error) {
        logger.error('Lỗi khi lấy bình luận', error);
        throw new Error('Lỗi hệ thống');
    }
}

async function themBinhLuan(ndid, tid, noiDung) {
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
        await BinhLuan.create({
            NDID: nguoiDung.NDID,
            TID: truyen.TID,
            NoiDung: noiDung
        });
        return { ok: true };
    } catch (error) {
        logger.error('Lỗi khi thêm bình luận', error);
        throw new Error('Lỗi hệ thống');
    }
}

module.exports = {
    layDanhSachTheLoai,
    timTruyenMoi,
    timTruyenHot,
    timTruyenTheoTheLoai,
    timTruyenTheoTuKhoa,
    layThongTinTruyen,
    layThongTinChuongTruyen,
    themTruyen,
    timTruyenChuaDuyet,
    thamKhaoYKienAIDuyetTruyen,
    duyetTruyen,
    layThongTinTruyenAdmin,
    layThongTinChuongTruyenAdmin,
    timTruyenDaDang,
    tinhSoDiemCanDeXoaTruyen,
    xoaTruyenDaDang,
    capNhatTruyen,
    themChuongTruyen,
    capNhatGiaChuongTruyen,
    xoaChuongTruyen,
    moKhoaChuongTruyen,
    layTomTatTruyen,
    timTruyenBangAI,
    layBinhLuan,
    themBinhLuan
};