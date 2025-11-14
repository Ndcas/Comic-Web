const truyenService = require("../services/truyen.service");
const database = require("../database/database");
const { QueryTypes } = require("sequelize");

// 🧩 Lấy danh sách truyện mới
async function truyenMoi(req, res) {
  const token = req.header("Authorization")?.split(" ")[1] || null;
  const page = parseInt(req.query.page) || 1;

  if (page < 1) return res.status(400).json({ error: "Số trang không phù hợp" });

  try {
    const result = await truyenService.timTruyenMoi(page, token);
    if (!result.ok)
      return res.status(result.status || 500).json({ error: result.error });

    return res.json({
      trangHienTai: page,
      truyen: result.data.result,
      tongTrang: result.data.maxPage,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy truyện mới:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
}

// 🔥 Lấy danh sách truyện hot
async function truyenHot(req, res) {
  const token = req.header("Authorization")?.split(" ")[1] || null;
  try {
    const result = await truyenService.timTruyenHot(token);
    if (!result.ok)
      return res.status(result.status || 500).json({ error: result.error });

    res.json({ truyen: result.data });
  } catch (error) {
    console.error("❌ Lỗi khi lấy truyện hot:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
}

// 📚 Lấy truyện theo thể loại
async function truyenTheoTheLoai(req, res) {
  const token = req.header("Authorization")?.split(" ")[1] || null;
  const TLID = parseInt(req.query.TLID);
  const page = parseInt(req.query.page) || 1;

  if (!TLID) return res.status(400).json({ error: "Thiếu mã thể loại" });
  if (page < 1) return res.status(400).json({ error: "Số trang không phù hợp" });

  try {
    const result = await truyenService.timTruyenTheoTheLoai(TLID, page, token);
    if (!result.ok)
      return res.status(result.status || 500).json({ error: result.error });

    res.json({
      trangHienTai: page,
      truyen: result.data.result,
      tongTrang: result.data.maxPage,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy truyện theo thể loại:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
}

// 🔍 Tìm truyện theo từ khóa
async function truyenTheoTuKhoa(req, res) {
  const token = req.header("Authorization")?.split(" ")[1] || null;
  const keyword = req.query.keyword?.trim();
  const page = parseInt(req.query.page) || 1;

  if (!keyword) return res.status(400).json({ error: "Thiếu từ khóa" });
  if (page < 1) return res.status(400).json({ error: "Số trang không phù hợp" });

  try {
    const result = await truyenService.timTruyenTheoTuKhoa(keyword, page, token);
    if (!result.ok)
      return res.status(result.status || 500).json({ error: result.error });

    res.json({
      trangHienTai: page,
      truyen: result.data.result,
      tongTrang: result.data.maxPage,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tìm truyện theo từ khóa:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
}

// 📘 Lấy chi tiết truyện
async function chiTietTruyen(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Thiếu ID truyện" });

    const result = await truyenService.layChiTietTruyen(id);
    if (!result.ok)
      return res.status(result.status || 500).json({ error: result.error });

    res.json(result.data);
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết truyện:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy chi tiết truyện" });
  }
}

// 📖 Lấy nội dung chương
async function noiDungChuong(req, res) {
  try {
    const { cid } = req.params;
    if (!cid) return res.status(400).json({ error: "Thiếu ID chương" });

    const sql = `
      SELECT C.CTID, C.TieuDe, C.NoiDung, C.ThuTu, C.NgayDang, T.TID, T.TenTruyen
      FROM ChuongTruyen AS C
      JOIN Truyen AS T ON C.TID = T.TID
      WHERE C.CTID = :cid;
    `;
    const [chapter] = await database.query(sql, {
      replacements: { cid },
      type: QueryTypes.SELECT,
    });

    if (!chapter) return res.status(404).json({ error: "Không tìm thấy chương" });
    res.json(chapter);
  } catch (error) {
    console.error("❌ Lỗi khi lấy nội dung chương:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
}

// 🎭 Lấy danh sách thể loại
async function danhSachTheLoai(req, res) {
  try {
    const sql = `
      SELECT TLID, TenTheLoai
      FROM TheLoai
      ORDER BY TenTheLoai ASC;
    `;
    const theloai = await database.query(sql, { type: QueryTypes.SELECT });
    res.json(theloai);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách thể loại:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy thể loại" });
  }
}

// 🆕 Thêm truyện mới (có ảnh bìa)
async function themTruyen(req, res) {
  try {
    const { TenTruyen, MoTa, TacGia, GioiHan18Tuoi } = req.body;
    const file = req.file;

    if (!TenTruyen || !TacGia)
      return res.status(400).json({ error: "Thiếu thông tin truyện" });

    const AnhBia = file ? `/uploads/${file.filename}` : null;

    const sql = `
      INSERT INTO Truyen (TenTruyen, MoTa, TacGia, GioiHan18Tuoi, AnhBia, DaDuyet, NgayDang)
      VALUES (:TenTruyen, :MoTa, :TacGia, :GioiHan18Tuoi, :AnhBia, 1, NOW());
    `;
    await database.query(sql, {
      replacements: {
        TenTruyen,
        MoTa,
        TacGia,
        GioiHan18Tuoi: GioiHan18Tuoi ? 1 : 0,
        AnhBia,
      },
      type: QueryTypes.INSERT,
    });

    res.json({
      message: "✅ Thêm truyện thành công!",
      AnhBia: AnhBia ? `http://localhost:8080${AnhBia}` : null,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm truyện:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi thêm truyện" });
  }
}

// 🆕 Thêm chương mới
async function themChuong(req, res) {
  try {
    const { TID, TieuDe, NoiDung, ThuTu } = req.body;
    if (!TID || !TieuDe || !NoiDung)
      return res.status(400).json({ error: "Thiếu thông tin chương" });

    const sql = `
      INSERT INTO ChuongTruyen (TID, TieuDe, NoiDung, ThuTu, NgayDang, LuotXem)
      VALUES (:TID, :TieuDe, :NoiDung, :ThuTu, NOW(), 0);
    `;
    await database.query(sql, {
      replacements: { TID, TieuDe, NoiDung, ThuTu: ThuTu || 1 },
      type: QueryTypes.INSERT,
    });

    res.json({ message: "✅ Thêm chương mới thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm chương:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi thêm chương" });
  }
}

module.exports = {
  truyenMoi,
  truyenHot,
  truyenTheoTheLoai,
  truyenTheoTuKhoa,
  chiTietTruyen,
  noiDungChuong,
  danhSachTheLoai,
  themTruyen,
  themChuong,
};
