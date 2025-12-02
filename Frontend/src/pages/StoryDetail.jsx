import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen, FaUserEdit, FaTag, FaCheckCircle, FaRunning, FaClock, FaHeart, FaEye, FaArrowRight } from 'react-icons/fa';
import { IoIosWarning } from "react-icons/io";
import { get } from '../utils/request';

// ĐÃ SỬA: Loại bỏ '/api'
// const API_BASE_URL = 'http://localhost:8080/truyen';
// const ASSET_BASE_URL = 'http://localhost:8080';
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function StoryDetail() {
    const { TID } = useParams();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStoryDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // // Giả định API /truyen/:TID
            // const response = await axios.get(`${API_BASE_URL}/${TID}`);

            // Điều chỉnh cách đọc dữ liệu
            let truyenResponse = null;
            let chuongTruyenResponse = null;
            if (localStorage.getItem('role') == 'NguoiDung' && localStorage.getItem('token')) {
                truyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinTruyen?TID=${TID}`, false, true);
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`, false, true);
            } else {
                truyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinTruyen?TID=${TID}`);
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`);
            }
            let dataTruyen = await truyenResponse.json();
            if (!truyenResponse.ok) {
                throw new Error(dataTruyen.error);
            }
            let dataChuongTruyen = await chuongTruyenResponse.json();
            if (!chuongTruyenResponse.ok) {
                throw new Error(dataChuongTruyen.error);
            }
            setStory(dataTruyen.truyen);
            setChapters(dataChuongTruyen.chuongTruyens);
        } catch (err) {
            console.error("Lỗi tải chi tiết truyện:", err);
            setError(err.message || "Không thể tải chi tiết truyện. Vui lòng kiểm tra ID hoặc kết nối Backend.");
        } finally {
            setLoading(false);
        }
    }, [TID]);

    useEffect(() => {
        fetchStoryDetail();
    }, [fetchStoryDetail]);

    if (loading) return <div className="text-center p-8 text-xl">Đang tải chi tiết truyện...</div>;
    if (error) return <div className="text-center p-8 text-xl text-red-600 flex items-center justify-center"><IoIosWarning className="mr-2" /> {error}</div>;
    if (!story) return <div className="text-center p-8 text-gray-500">Truyện không tồn tại.</div>;

    // Lấy chương đầu tiên và chương mới nhất để tạo nút đọc
    const firstChapter = chapters.length > 0 ? chapters[0] : null;
    const latestChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

    // Xác định trạng thái
    const statusText = story.TrangThai == 0 ? 'Hoàn Thành' : 'Đang Ra';
    const statusColor = story.TrangThai == 0 ? 'bg-blue-600' : 'bg-red-600';
    const statusIcon = story.TrangThai == 0 ? <FaCheckCircle /> : <FaRunning />;

    // Giả định một số giá trị mặc định cho dữ liệu Backend thiếu
    // const luotXem = story.LuotXem;
    const luotThich = story.LuotThich;
    // const ngayCapNhat = story.NgayCapNhat || 'Đang cập nhật';

    return (
        <div className="container mx-auto p-4 max-w-7xl">

            {/* Tiêu đề Truyện Lớn */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                {story.TenTruyen}
            </h1>

            {/* Khối Thông tin Chính: Bố cục 2 Cột trên Desktop (Flexbox) */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* 1. Cột Trái: Ảnh Bìa và Nút Đọc (Sticky trên desktop) */}
                <div className="w-full lg:w-1/3 flex flex-col items-center lg:sticky lg:top-4 h-full">

                    {/* Ảnh Bìa */}
                    <div className="w-2/3 sm:w-1/2 lg:w-full aspect-[3/4] rounded-lg shadow-xl overflow-hidden mb-5 border-4 border-gray-200">
                        <img
                            src={`${VITE_BACKEND_URL}/assets/covers/${story.AnhBia || 'default.jpg'}`}
                            alt={story.TenTruyen}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Nút Đọc */}
                    <div className="w-full sm:w-1/2 lg:w-full flex flex-col gap-3">
                        {firstChapter && (
                            <Link
                                to={`/read/${story.TID}/${firstChapter.CTID}`}
                                className="w-full py-3 bg-red-600 text-white font-bold text-lg 
                                           rounded-full flex items-center justify-center 
                                           hover:bg-red-700 transition-colors shadow-lg">
                                <FaBookOpen className="mr-2" /> Đọc Từ Chương Đầu
                            </Link>
                        )}
                        {latestChapter && (
                            <Link
                                to={`/read/${story.TID}/${latestChapter.CTID}`}
                                className="w-full py-3 bg-gray-200 text-gray-800 font-bold text-lg 
                                           rounded-full flex items-center justify-center 
                                           hover:bg-gray-300 transition-colors border border-gray-300">
                                <FaArrowRight className="mr-2" /> Chương Mới Nhất
                            </Link>
                        )}
                    </div>
                </div>

                {/* 2. Cột Phải: Thông tin và Chương */}
                <div className="w-full lg:w-2/3">

                    {/* A. Thông tin tóm tắt */}
                    <div className="p-4 bg-gray-50 rounded-xl shadow-inner mb-6">
                        <h2 className="text-xl font-bold mb-3 text-red-600 border-b pb-1">Tóm Tắt</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                            <p className="flex items-center"><FaUserEdit className="text-red-500 mr-2" /> Tác giả: {story.TacGia}</p>
                            <p className="flex items-center"><FaRunning className={`mr-2 ${statusColor}`} /> Trạng thái: <span className="font-semibold ml-1 text-red-600">{statusText}</span></p>
                            {/* <p className="flex items-center"><FaClock className="text-red-500 mr-2" /> **Cập nhật:** {ngayCapNhat}</p> */}
                            {/* <p className="flex items-center"><FaEye className="text-red-500 mr-2" /> Lượt xem: {luotXem}</p> */}
                            <p className="flex items-center"><FaHeart className="text-red-500 mr-2" /> Yêu thích: {luotThich}</p>
                            <p className="flex items-center"><FaTag className="text-red-500 mr-2" /> Giới hạn 18+: {story.GioiHan18Tuoi == 1 ? 'CÓ' : 'KHÔNG'}</p>
                        </div>

                        <div className="mt-3">
                            <span className="font-semibold text-gray-800 flex items-center mb-1"><FaTag className="text-red-500 mr-2" /> Thể loại:</span>
                            <div className="flex flex-wrap gap-2">
                                {story.TheLoaiTruyens.map((cat, index) => (
                                    <Link
                                        key={index}
                                        to={`/category/${cat.TLID}`}
                                        className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-full font-medium hover:bg-red-200 transition-colors"
                                    >
                                        {cat.TheLoai.TenTheLoai}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* B. Mô tả Truyện */}
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Mô Tả Truyện</h2>
                    <div className="text-gray-600 leading-relaxed bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-6">
                        <p className="whitespace-pre-wrap">{story.MoTa}</p>
                    </div>

                    {/* C. Danh sách Chương (Đầu tiên) */}
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Danh Sách Chương ({chapters.length})</h2>

                    {chapters && chapters.length > 0 ? (
                        // Hiển thị danh sách chương dưới dạng List/Card chuyên nghiệp
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md divide-y divide-gray-100">
                            {chapters
                                .slice(0, 10) // Chỉ hiển thị 10 chương đầu, khuyến khích dùng Pagination ở đây
                                .map(chapter => (
                                    <Link
                                        key={chapter.CTID}
                                        to={`/read/${story.TID}/${chapter.CTID}`}
                                        className="p-4 flex justify-between items-center bg-white hover:bg-red-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-800 group-hover:text-red-600">
                                            {chapter.TenChuongTruyen}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {(new Date(chapter.NgayDang)).toLocaleDateString()}
                                        </span>
                                    </Link>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center p-5 bg-gray-50 rounded-lg text-gray-500">
                            Hiện tại truyện chưa có chương nào được đăng.
                        </div>
                    )}

                    {story.chuongTruyens && story.chuongTruyens.length > 10 && (
                        <div className="mt-4 text-center">
                            <button className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                                Xem tất cả các chương khác...
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StoryDetail; 