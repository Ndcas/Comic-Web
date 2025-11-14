const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const controller = require("../controllers/truyen.controller");

const router = express.Router();

// ⚙️ Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";
    if (req.originalUrl.includes("themChuong")) folder = "uploads/chuong/";

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype))
      return cb(new Error("❌ Chỉ chấp nhận file .jpg hoặc .png!"));
    cb(null, true);
  },
});

// ⚡ Route
router.get("/theloai/all", controller.danhSachTheLoai);
router.get("/truyenMoi", controller.truyenMoi);
router.get("/truyenHot", controller.truyenHot);
router.get("/truyenTheoTheLoai", controller.truyenTheoTheLoai);
router.get("/truyenTheoTuKhoa", controller.truyenTheoTuKhoa);
router.get("/chuong/:cid", controller.noiDungChuong);
router.get("/:id", controller.chiTietTruyen);

// 🆕 Upload truyện và chương
router.post("/themTruyen", upload.single("AnhBia"), controller.themTruyen);
router.post("/themChuong", upload.array("AnhChuong", 20), controller.themChuong);

module.exports = router;
