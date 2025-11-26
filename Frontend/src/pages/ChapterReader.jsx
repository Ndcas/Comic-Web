import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaAngleLeft, FaAngleRight, FaList, FaHome, FaHeart } from 'react-icons/fa';
import { IoIosWarning } from "react-icons/io";


const API_BASE_URL = 'http://localhost:8080/truyen';
const ASSET_BASE_URL = 'http://localhost:8080';

function ChapterReader() {
    const { TID, CTID } = useParams();
    const [chapterDetail, setChapterDetail] = useState(null); // Chi tiết chương hiện tại
    const [chapterImages, setChapterImages] = useState([]); // Danh sách ảnh của chương
    const [relatedChapters, setRelatedChapters] = useState([]); // Danh sách tất cả chương để điều hướng
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChapterData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Giả định API /truyen/:TID/chuong/:CTID trả về chi tiết chương và danh sách ảnh
            // Bạn cần điều chỉnh API này để nó trả về cả danh sách các chương liên quan
            const response = await axios.get(`${API_BASE_URL}/${TID}/chuong/${CTID}`);

            const data = response.data.data || response.data;

            // Lấy thông tin chương, danh sách ảnh, và danh sách tất cả các chương khác
            setChapterDetail(data.chapterDetail || data.chiTietChuong);
            setChapterImages(data.images || data.anhChuong || []);
            setRelatedChapters(data.allChapters || data.danhSachChuong || []); // Quan trọng cho điều hướng

        } catch (err) {
            console.error("Lỗi tải chương truyện:", err);
            setError("Không thể tải nội dung chương truyện. Vui lòng kiểm tra lại ID chương.");
        } finally {
            setLoading(false);
        }
    }, [TID, CTID]);

    useEffect(() => {
        fetchChapterData();
        window.scrollTo(0, 0); // Bắt đầu đọc từ đầu trang
    }, [fetchChapterData]);

    const currentIndex = relatedChapters.findIndex(c => String(c.CTID) === String(CTID));
    const prevChapter = currentIndex > 0 ? relatedChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < relatedChapters.length - 1 ? relatedChapters[currentIndex + 1] : null;

    if (loading) return <div className="text-center p-8 text-xl">Đang tải chương truyện...</div>;
    if (error) return <div className="text-center p-8 text-xl text-red-600 flex items-center justify-center"><IoIosWarning className="mr-2" /> {error}</div>;
    if (!chapterDetail) return <div className="text-center p-8 text-gray-500">Chương truyện không tồn tại hoặc đã bị gỡ.</div>;

    // --- Component Phụ: Thanh Điều Hướng (Dùng cho Header và Footer) ---
    const NavigationBar = ({ placement }) => (
        <div className={`flex items-center justify-between p-3 sm:p-4 bg-gray-800 text-white shadow-md ${placement === 'header' ? 'sticky top-0 z-20' : ''}`}>

            {/* 1. Nút Quay Lại Trang Chi Tiết */}
            <Link
                to={`/story/${TID}`}
                className="flex items-center px-2 py-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-sm font-semibold"
                title="Quay lại Trang Chi Tiết Truyện"
            >
                <FaList className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Mục Lục</span>
            </Link>

            {/* 2. Tiêu Đề Chương */}
            <h2 className="text-sm sm:text-lg font-bold text-center truncate mx-4 flex-1">
                {chapterDetail.TenTruyen} - {chapterDetail.TenChuongTruyen}
            </h2>

            {/* 3. Nút Điều Hướng Chương Trước/Sau */}
            <div className="flex space-x-2">

                {/* Chương Trước */}
                <Link
                    to={prevChapter ? `/read/${TID}/${prevChapter.CTID}` : '#'}
                    onClick={(e) => !prevChapter && e.preventDefault()}
                    className={`p-2 rounded-full transition-colors ${prevChapter ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }`}
                    title="Chương Trước"
                >
                    <FaAngleLeft className="w-4 h-4" />
                </Link>

                {/* Chương Sau */}
                <Link
                    to={nextChapter ? `/read/${TID}/${nextChapter.CTID}` : '#'}
                    onClick={(e) => !nextChapter && e.preventDefault()}
                    className={`p-2 rounded-full transition-colors ${nextChapter ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }`}
                    title="Chương Sau"
                >
                    <FaAngleRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
    // --- Kết thúc NavigationBar ---

    return (
        <div className="bg-gray-100 min-h-screen">

            {/* Thanh Điều Hướng Header Cố Định */}
            <NavigationBar placement="header" />

            {/* Vùng Nội Dung Đọc (Ảnh Truyện) */}
            <div className="mx-auto max-w-full lg:max-w-4xl xl:max-w-5xl px-0 lg:px-2 py-4">
                {chapterImages.length > 0 ? (
                    chapterImages.map((imageName, index) => (
                        <div key={index} className="mb-1 w-full flex justify-center">
                            <img
                                // Giả định ảnh chương nằm trong thư mục 'chapters/:TID/:CTID/'
                                src={`${ASSET_BASE_URL}/assets/chapters/${TID}/${CTID}/${imageName}`}
                                alt={`Trang ${index + 1} - ${chapterDetail.TenChuongTruyen}`}
                                className="w-full h-auto object-contain shadow-lg"
                                loading="lazy"
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow-md text-gray-500">
                        Chương truyện chưa có hình ảnh nào được đăng.
                    </div>
                )}
            </div>

            {/* Thanh Điều Hướng Footer */}
            <div className="mt-8 mb-4">
                <NavigationBar placement="footer" />
            </div>

            {/* Khu vực Tương Tác/Bình Luận (Footer Mở Rộng) */}
            <div className="container mx-auto max-w-3xl p-4 flex justify-center space-x-6 text-gray-600">
                <button className="flex items-center text-red-600 hover:text-red-700 transition-colors font-semibold">
                    <FaHeart className="mr-2" /> Thích Chương Này
                </button>
                <Link to="/" className="flex items-center hover:text-red-600 transition-colors font-semibold">
                    <FaHome className="mr-2" /> Về Trang Chủ
                </Link>
            </div>
        </div>
    );
}

export default ChapterReader;