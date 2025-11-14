const database = require("../database/database");
const { verifyToken } = require("../utils/token");
const { QueryTypes } = require("sequelize");

const LIMIT = 8; // số truyện mỗi trang

// 🧩 Lấy danh sách truyện mới
async function timTruyenMoi(page, token = null) {
  try {
    let showR18 = false;
    const currentDate = new Date();

    // ✅ Nếu có token thì kiểm tra tuổi
    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
        showR18 = true;
      }
    }

    const offset = (page - 1) * LIMIT;

    // ✅ Tổng số truyện đã duyệt
    const countSql = `
      SELECT COUNT(*) AS total
      FROM Truyen
      WHERE DaDuyet = 1 ${showR18 ? "" : "AND GioiHan18Tuoi = 0"};
    `;
    const [{ total }] = await database.query(countSql, { type: QueryTypes.SELECT });

    // ✅ Lấy truyện mới nhất dựa theo ngày đăng chương mới nhất
    const sql = `
      SELECT T.TID, T.TenTruyen, T.MoTa, T.AnhBia, T.TacGia, T.GioiHan18Tuoi, MAX(C.NgayDang) AS NgayDangMoiNhat
      FROM Truyen AS T
      LEFT JOIN ChuongTruyen AS C ON T.TID = C.TID
      WHERE T.DaDuyet = 1 ${showR18 ? "" : "AND T.GioiHan18Tuoi = 0"}
      GROUP BY T.TID
      ORDER BY NgayDangMoiNhat DESC
      LIMIT :limit OFFSET :offset;
    `;

    const result = await database.query(sql, {
      replacements: { limit: LIMIT, offset },
      type: QueryTypes.SELECT,
    });

    const maxPage = Math.max(1, Math.ceil(total / LIMIT));

    return { ok: true, data: { result, page, maxPage } };
  } catch (error) {
    console.error("❌ Lỗi khi tìm truyện mới:", error);
    return { ok: false, status: 500, error: error.message };
  }
}

// 🔥 Lấy danh sách truyện hot (nhiều lượt xem nhất)
async function timTruyenHot(token = null) {
  try {
    let showR18 = false;
    const currentDate = new Date();

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
        showR18 = true;
      }
    }

    const sql = `
      SELECT T.TID, T.TenTruyen, T.MoTa, T.AnhBia, T.TacGia, SUM(C.LuotXem) AS TongLuotXem
      FROM Truyen AS T
      LEFT JOIN ChuongTruyen AS C ON T.TID = C.TID
      WHERE T.DaDuyet = 1 ${showR18 ? "" : "AND T.GioiHan18Tuoi = 0"}
      GROUP BY T.TID
      ORDER BY TongLuotXem DESC
      LIMIT 10;
    `;

    const data = await database.query(sql, { type: QueryTypes.SELECT });
    return { ok: true, data };
  } catch (error) {
    console.error("❌ Lỗi khi tìm truyện hot:", error);
    return { ok: false, status: 500, error: error.message };
  }
}

// 📚 Lấy truyện theo thể loại
async function timTruyenTheoTheLoai(TLID, page, token = null) {
  try {
    let showR18 = false;
    const currentDate = new Date();

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
        showR18 = true;
      }
    }

    const offset = (page - 1) * LIMIT;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM TruyenTheLoai
      JOIN Truyen ON TruyenTheLoai.TID = Truyen.TID
      WHERE TruyenTheLoai.TLID = :TLID
        AND Truyen.DaDuyet = 1
        ${showR18 ? "" : "AND Truyen.GioiHan18Tuoi = 0"};
    `;
    const [{ total }] = await database.query(countSql, {
      replacements: { TLID },
      type: QueryTypes.SELECT,
    });

    const sql = `
      SELECT T.TID, T.TenTruyen, T.MoTa, T.AnhBia, T.TacGia
      FROM Truyen AS T
      JOIN TruyenTheLoai AS TL ON T.TID = TL.TID
      WHERE TL.TLID = :TLID
        AND T.DaDuyet = 1
        ${showR18 ? "" : "AND T.GioiHan18Tuoi = 0"}
      ORDER BY T.TID DESC
      LIMIT :limit OFFSET :offset;
    `;

    const data = await database.query(sql, {
      replacements: { TLID, limit: LIMIT, offset },
      type: QueryTypes.SELECT,
    });

    const maxPage = Math.max(1, Math.ceil(total / LIMIT));
    return { ok: true, data: { result: data, page, maxPage } };
  } catch (error) {
    console.error("❌ Lỗi khi tìm truyện theo thể loại:", error);
    return { ok: false, status: 500, error: error.message };
  }
}

// 🔍 Tìm truyện theo từ khóa
async function timTruyenTheoTuKhoa(keyword, page, token = null) {
  try {
    let showR18 = false;
    const currentDate = new Date();

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.NamSinh && currentDate.getFullYear() - payload.NamSinh >= 18) {
        showR18 = true;
      }
    }

    const offset = (page - 1) * LIMIT;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM Truyen
      WHERE DaDuyet = 1
        ${showR18 ? "" : "AND GioiHan18Tuoi = 0"}
        AND TenTruyen LIKE :keyword;
    `;
    const [{ total }] = await database.query(countSql, {
      replacements: { keyword: `%${keyword}%` },
      type: QueryTypes.SELECT,
    });

    const sql = `
      SELECT TID, TenTruyen, MoTa, AnhBia, TacGia
      FROM Truyen
      WHERE DaDuyet = 1
        ${showR18 ? "" : "AND GioiHan18Tuoi = 0"}
        AND TenTruyen LIKE :keyword
      ORDER BY TID DESC
      LIMIT :limit OFFSET :offset;
    `;

    const data = await database.query(sql, {
      replacements: { keyword: `%${keyword}%`, limit: LIMIT, offset },
      type: QueryTypes.SELECT,
    });

    const maxPage = Math.max(1, Math.ceil(total / LIMIT));
    return { ok: true, data: { result: data, page, maxPage } };
  } catch (error) {
    console.error("❌ Lỗi khi tìm truyện theo từ khóa:", error);
    return { ok: false, status: 500, error: error.message };
  }
}

// 📘 Lấy chi tiết truyện
async function layChiTietTruyen(TID) {
  try {
    const truyenSql = `
      SELECT TID, TenTruyen, MoTa, AnhBia, TacGia, GioiHan18Tuoi
      FROM Truyen
      WHERE TID = :TID AND DaDuyet = 1
      LIMIT 1;
    `;
    const truyen = await database.query(truyenSql, {
      replacements: { TID },
      type: QueryTypes.SELECT,
    });

    if (!truyen.length)
      return { ok: false, status: 404, error: "Không tìm thấy truyện" };

    const chuongSql = `
      SELECT CTID, TenChuongTruyen AS TieuDe, LuotXem, GiaChuong, NgayDang
      FROM ChuongTruyen
      WHERE TID = :TID
      ORDER BY NgayDang ASC;
    `;
    const chuongs = await database.query(chuongSql, {
      replacements: { TID },
      type: QueryTypes.SELECT,
    });

    return {
      ok: true,
      data: { ...truyen[0], ChuongTruyens: chuongs },
    };
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết truyện:", error);
    return { ok: false, status: 500, error: "Lỗi hệ thống khi lấy chi tiết truyện" };
  }
}

async function danhSachTheLoai() {
  try {
    const sql = `
      SELECT TLID, TenTheLoai, MoTa
      FROM TheLoai
      ORDER BY TenTheLoai ASC;
    `;
    const data = await database.query(sql, { type: QueryTypes.SELECT });

    if (!data.length)
      return { ok: true, data: [], message: "Chưa có thể loại nào" };

    return { ok: true, data };
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách thể loại:", error);
    return { ok: false, status: 500, error: "Lỗi hệ thống khi lấy danh sách thể loại" };
  }
}
module.exports = {
  timTruyenMoi,
  timTruyenHot,
  timTruyenTheoTheLoai,
  timTruyenTheoTuKhoa,
  layChiTietTruyen,
  danhSachTheLoai,
};
