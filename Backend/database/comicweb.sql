-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 27, 2025 lúc 10:01 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `comicweb`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `Email` varchar(200) NOT NULL,
  `MatKhau` char(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin`
--

INSERT INTO `admin` (`Email`, `MatKhau`) VALUES
('wordlinkctu@gmail.com', '$2b$10$BBXQYRkRkXhbCuwjm6jWce4OF9fFESNK46.aZ2637zwYZ5PGpNjlS');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baocaobinhluan`
--

CREATE TABLE `baocaobinhluan` (
  `BCBLID` int(11) NOT NULL,
  `BLID` int(11) NOT NULL,
  `LyDo` varchar(300) NOT NULL,
  `DaXuLy` int(11) NOT NULL DEFAULT 0 CHECK (`DaXuLy` in (0,1)),
  `NgayBaoCao` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baocaotruyen`
--

CREATE TABLE `baocaotruyen` (
  `BCTID` int(11) NOT NULL,
  `TID` int(11) NOT NULL,
  `LyDo` varchar(300) NOT NULL,
  `DaXuLy` int(11) NOT NULL DEFAULT 0 CHECK (`DaXuLy` in (0,1)),
  `NgayBaoCao` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `binhluan`
--

CREATE TABLE `binhluan` (
  `BLID` int(11) NOT NULL,
  `NDID` int(11) NOT NULL,
  `TID` int(11) NOT NULL,
  `NoiDung` varchar(300) NOT NULL,
  `ThoiGianBinhLuan` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chuongdamokhoa`
--

CREATE TABLE `chuongdamokhoa` (
  `NDID` int(11) NOT NULL,
  `CTID` int(11) NOT NULL,
  `Diem` int(11) NOT NULL CHECK (`Diem` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chuongtruyen`
--

CREATE TABLE `chuongtruyen` (
  `CTID` int(11) NOT NULL,
  `TID` int(11) NOT NULL,
  `TenChuongTruyen` varchar(200) NOT NULL,
  `LuotXem` int(11) NOT NULL DEFAULT 0 CHECK (`LuotXem` >= 0),
  `NgayDang` datetime NOT NULL,
  `GiaChuong` int(11) NOT NULL DEFAULT 0 CHECK (`GiaChuong` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hinhanh`
--

CREATE TABLE `hinhanh` (
  `HAID` int(11) NOT NULL,
  `CTID` int(11) NOT NULL,
  `HinhAnh` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsudiem`
--

CREATE TABLE `lichsudiem` (
  `LSDID` int(11) NOT NULL,
  `LGDID` int(11) NOT NULL,
  `NDID` int(11) NOT NULL,
  `DiemThayDoi` float NOT NULL,
  `GhiChu` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsudoc`
--

CREATE TABLE `lichsudoc` (
  `LSDID` int(11) NOT NULL,
  `NDID` int(11) DEFAULT NULL,
  `CTID` int(11) NOT NULL,
  `NgayDoc` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loaigiaodich`
--

CREATE TABLE `loaigiaodich` (
  `LGDID` int(11) NOT NULL,
  `TenLGD` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `NDID` int(11) NOT NULL,
  `TenTaiKhoan` varchar(50) NOT NULL,
  `Email` varchar(200) NOT NULL,
  `MatKhau` char(60) NOT NULL,
  `Diem` float NOT NULL DEFAULT 0 CHECK (`Diem` >= 0),
  `NgayThamGia` date NOT NULL,
  `TrangThai` int(11) NOT NULL DEFAULT 1 CHECK (`TrangThai` in (0,1)),
  `NamSinh` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `theloai`
--

CREATE TABLE `theloai` (
  `TLID` int(11) NOT NULL,
  `TenTheLoai` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `theloai`
--

INSERT INTO `theloai` (`TLID`, `TenTheLoai`) VALUES
(7, 'Bi kịch'),
(20, 'Comics'),
(9, 'Giả tưởng'),
(4, 'Hài hước'),
(1, 'Hành động'),
(10, 'Học đường'),
(15, 'Isekai'),
(8, 'Khoa học viễn tưởng'),
(6, 'Kinh dị'),
(12, 'Lịch sử'),
(17, 'Manga'),
(19, 'Manhua'),
(18, 'Manhwa'),
(14, 'Mecha'),
(3, 'Phiêu lưu'),
(11, 'Thể thao'),
(5, 'Tình cảm'),
(13, 'Trinh thám'),
(16, 'Đời thường');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `theloaitruyen`
--

CREATE TABLE `theloaitruyen` (
  `TLID` int(11) NOT NULL,
  `TID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `truyen`
--

CREATE TABLE `truyen` (
  `TID` int(11) NOT NULL,
  `NDID` int(11) NOT NULL,
  `TenTruyen` varchar(200) NOT NULL,
  `MoTa` varchar(1000) DEFAULT NULL,
  `AnhBia` varchar(100) DEFAULT NULL,
  `TacGia` varchar(100) DEFAULT NULL,
  `LuotThich` int(11) NOT NULL DEFAULT 0 CHECK (`LuotThich` >= 0),
  `DaDuyet` int(11) NOT NULL DEFAULT 0 CHECK (`DaDuyet` in (-1,0,1)),
  `LyDoTuChoi` varchar(500) DEFAULT NULL,
  `TrangThai` int(11) NOT NULL DEFAULT 1 CHECK (`TrangThai` in (0,1)),
  `GioiHan18Tuoi` int(11) NOT NULL DEFAULT 0 CHECK (`GioiHan18Tuoi` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeuthich`
--

CREATE TABLE `yeuthich` (
  `TID` int(11) NOT NULL,
  `NDID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`Email`);

--
-- Chỉ mục cho bảng `baocaobinhluan`
--
ALTER TABLE `baocaobinhluan`
  ADD PRIMARY KEY (`BCBLID`),
  ADD KEY `BLID` (`BLID`);

--
-- Chỉ mục cho bảng `baocaotruyen`
--
ALTER TABLE `baocaotruyen`
  ADD PRIMARY KEY (`BCTID`),
  ADD KEY `TID` (`TID`);

--
-- Chỉ mục cho bảng `binhluan`
--
ALTER TABLE `binhluan`
  ADD PRIMARY KEY (`BLID`),
  ADD KEY `NDID` (`NDID`),
  ADD KEY `TID` (`TID`);

--
-- Chỉ mục cho bảng `chuongdamokhoa`
--
ALTER TABLE `chuongdamokhoa`
  ADD PRIMARY KEY (`NDID`,`CTID`),
  ADD KEY `CTID` (`CTID`);

--
-- Chỉ mục cho bảng `chuongtruyen`
--
ALTER TABLE `chuongtruyen`
  ADD PRIMARY KEY (`CTID`),
  ADD KEY `TID` (`TID`);

--
-- Chỉ mục cho bảng `hinhanh`
--
ALTER TABLE `hinhanh`
  ADD PRIMARY KEY (`HAID`),
  ADD KEY `CTID` (`CTID`);

--
-- Chỉ mục cho bảng `lichsudiem`
--
ALTER TABLE `lichsudiem`
  ADD PRIMARY KEY (`LSDID`),
  ADD KEY `LGDID` (`LGDID`),
  ADD KEY `NDID` (`NDID`);

--
-- Chỉ mục cho bảng `lichsudoc`
--
ALTER TABLE `lichsudoc`
  ADD PRIMARY KEY (`LSDID`),
  ADD KEY `NDID` (`NDID`),
  ADD KEY `CTID` (`CTID`);

--
-- Chỉ mục cho bảng `loaigiaodich`
--
ALTER TABLE `loaigiaodich`
  ADD PRIMARY KEY (`LGDID`),
  ADD UNIQUE KEY `TenLGD` (`TenLGD`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`NDID`),
  ADD UNIQUE KEY `TenTaiKhoan` (`TenTaiKhoan`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Chỉ mục cho bảng `theloai`
--
ALTER TABLE `theloai`
  ADD PRIMARY KEY (`TLID`),
  ADD UNIQUE KEY `TenTheLoai` (`TenTheLoai`);

--
-- Chỉ mục cho bảng `theloaitruyen`
--
ALTER TABLE `theloaitruyen`
  ADD PRIMARY KEY (`TLID`,`TID`),
  ADD KEY `TID` (`TID`);

--
-- Chỉ mục cho bảng `truyen`
--
ALTER TABLE `truyen`
  ADD PRIMARY KEY (`TID`),
  ADD KEY `NDID` (`NDID`);

--
-- Chỉ mục cho bảng `yeuthich`
--
ALTER TABLE `yeuthich`
  ADD KEY `TID` (`TID`),
  ADD KEY `NDID` (`NDID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `baocaobinhluan`
--
ALTER TABLE `baocaobinhluan`
  MODIFY `BCBLID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `baocaotruyen`
--
ALTER TABLE `baocaotruyen`
  MODIFY `BCTID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `binhluan`
--
ALTER TABLE `binhluan`
  MODIFY `BLID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chuongtruyen`
--
ALTER TABLE `chuongtruyen`
  MODIFY `CTID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hinhanh`
--
ALTER TABLE `hinhanh`
  MODIFY `HAID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lichsudiem`
--
ALTER TABLE `lichsudiem`
  MODIFY `LSDID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lichsudoc`
--
ALTER TABLE `lichsudoc`
  MODIFY `LSDID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `loaigiaodich`
--
ALTER TABLE `loaigiaodich`
  MODIFY `LGDID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `NDID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `theloai`
--
ALTER TABLE `theloai`
  MODIFY `TLID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `truyen`
--
ALTER TABLE `truyen`
  MODIFY `TID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `baocaobinhluan`
--
ALTER TABLE `baocaobinhluan`
  ADD CONSTRAINT `baocaobinhluan_ibfk_1` FOREIGN KEY (`BLID`) REFERENCES `binhluan` (`BLID`);

--
-- Các ràng buộc cho bảng `baocaotruyen`
--
ALTER TABLE `baocaotruyen`
  ADD CONSTRAINT `baocaotruyen_ibfk_1` FOREIGN KEY (`TID`) REFERENCES `truyen` (`TID`);

--
-- Các ràng buộc cho bảng `binhluan`
--
ALTER TABLE `binhluan`
  ADD CONSTRAINT `binhluan_ibfk_1` FOREIGN KEY (`NDID`) REFERENCES `nguoidung` (`NDID`),
  ADD CONSTRAINT `binhluan_ibfk_2` FOREIGN KEY (`TID`) REFERENCES `truyen` (`TID`);

--
-- Các ràng buộc cho bảng `chuongdamokhoa`
--
ALTER TABLE `chuongdamokhoa`
  ADD CONSTRAINT `chuongdamokhoa_ibfk_1` FOREIGN KEY (`NDID`) REFERENCES `nguoidung` (`NDID`),
  ADD CONSTRAINT `chuongdamokhoa_ibfk_2` FOREIGN KEY (`CTID`) REFERENCES `chuongtruyen` (`CTID`);

--
-- Các ràng buộc cho bảng `chuongtruyen`
--
ALTER TABLE `chuongtruyen`
  ADD CONSTRAINT `chuongtruyen_ibfk_1` FOREIGN KEY (`TID`) REFERENCES `truyen` (`TID`);

--
-- Các ràng buộc cho bảng `hinhanh`
--
ALTER TABLE `hinhanh`
  ADD CONSTRAINT `hinhanh_ibfk_1` FOREIGN KEY (`CTID`) REFERENCES `chuongtruyen` (`CTID`);

--
-- Các ràng buộc cho bảng `lichsudiem`
--
ALTER TABLE `lichsudiem`
  ADD CONSTRAINT `lichsudiem_ibfk_1` FOREIGN KEY (`LGDID`) REFERENCES `loaigiaodich` (`LGDID`),
  ADD CONSTRAINT `lichsudiem_ibfk_2` FOREIGN KEY (`NDID`) REFERENCES `nguoidung` (`NDID`);

--
-- Các ràng buộc cho bảng `lichsudoc`
--
ALTER TABLE `lichsudoc`
  ADD CONSTRAINT `lichsudoc_ibfk_1` FOREIGN KEY (`NDID`) REFERENCES `nguoidung` (`NDID`),
  ADD CONSTRAINT `lichsudoc_ibfk_2` FOREIGN KEY (`CTID`) REFERENCES `chuongtruyen` (`CTID`);

--
-- Các ràng buộc cho bảng `theloaitruyen`
--
ALTER TABLE `theloaitruyen`
  ADD CONSTRAINT `theloaitruyen_ibfk_1` FOREIGN KEY (`TLID`) REFERENCES `theloai` (`TLID`),
  ADD CONSTRAINT `theloaitruyen_ibfk_2` FOREIGN KEY (`TID`) REFERENCES `truyen` (`TID`);

--
-- Các ràng buộc cho bảng `truyen`
--
ALTER TABLE `truyen`
  ADD CONSTRAINT `truyen_ibfk_1` FOREIGN KEY (`NDID`) REFERENCES `nguoidung` (`NDID`);

--
-- Các ràng buộc cho bảng `yeuthich`
--
ALTER TABLE `yeuthich`
  ADD CONSTRAINT `yeuthich_ibfk_1` FOREIGN KEY (`TID`) REFERENCES `truyen` (`TID`),
  ADD CONSTRAINT `yeuthich_ibfk_2` FOREIGN KEY (`NDID`) REFERENCES `nguoidung` (`NDID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
