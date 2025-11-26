import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import HeaderBar from '../components/HeaderBar';
import {
    FaArrowLeft,
    FaArrowRight,
    FaList,
    FaCog,
    FaExclamationCircle,
    FaHome
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8080/truyen';

// Cấu trúc dữ liệu giả định cho Chương truyện
// { CID: 1, TenChuongTruyen: "Chương 1: Khởi đầu", NoiDung: "<html>...</html>", TID: 101, TenTruyen: "Tên Truyện", ChuongTiepTheoCID: 2, ChuongTruocCID: null }

function StoryReader() {
    const { CID } = useParams(); // Lấy Chapter ID từ URL
    const navigate = useNavigate();

    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Fetch Chi Tiết Chương Truyện ---
    const fetchChapterDetails = useCallback(async (chapterId) => {
        setLoading(true);
        setError(null);
        setChapter(null); // Reset nội dung chương cũ

        if (!chapterId) {
            setLoading(false);
            setError("Không tìm thấy ID chương (CID) trên URL.");
            return;
        }

        try {
            // Giả định API chi tiết chương là /truyen/chapter/:CID
            const response = await axios.get(`${API_BASE_URL}/chapter/${chapterId}`);
            const data = response.data.data || response.data;

            if (data && data.CID) {
                setChapter(data);
                // Cập nhật URL trình duyệt mà không reload trang (sử dụng navigate)
                // Điều này giúp cố định URL khi người dùng chuyển chương bằng nút
                // Mặc dù đã sử dụng useParams, nhưng vẫn đảm bảo tính nhất quán
                if (parseInt(CID) !== parseInt(chapterId)) {
                    navigate(`/read/${chapterId}`, { replace: true });
                }
            } else {
                throw new Error("Chương truyện không tồn tại hoặc dữ liệu trả về rỗng.");
            }

        } catch (err) {
            console.error(`Lỗi tải chương truyện CID ${chapterId}:`, err);
            setError(`Không thể tải chương truyện ID ${chapterId}. Lỗi: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [CID, navigate]);

    // 3. Effect Tải Dữ Liệu
    useEffect(() => {
        if (CID) {
            fetchChapterDetails(CID);
            window.scrollTo(0, 0); // Đảm bảo cuộn lên đầu trang khi đọc chương mới
        }
    }, [CID, fetchChapterDetails]);

    // --- Xử lý Chuyển Chương ---
    const handleNavigation = (nextChapterCID) => {
        if (nextChapterCID) {
            navigate(`/read/${nextChapterCID}`);
        } else {
            // Hiển thị thông báo thân thiện (hoặc dùng modal tùy chỉnh)
            alert("Đây là chương đầu tiên/cuối cùng của truyện.");
        }
    };

    // --- Render Loading/Error ---
    if (loading) return (
        <>
            <HeaderBar />
            <div className="flex justify-center items-center h-48 mt-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <p className="ml-4 text-xl text-gray-600">Đang tải nội dung chương...</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <HeaderBar />
            <div className="text-center p-8 text-xl text-red-600 flex flex-col items-center justify-center bg-red-50 border border-red-200 m-4 rounded-lg shadow-md">
                <FaExclamationCircle className="mr-2 text-4xl mb-3" />
                <p className="font-bold">LỖI TẢI CHƯƠNG TRUYỆN:</p>
                <p className="text-base mt-1 break-all">{error}</p>
            </div>
        </>
    );

    if (!chapter) return null; // Không tải và không lỗi

    // --- Render Chính ---
    return (
        <div className="min-h-screen bg-gray-100">
            <HeaderBar />

            {/* Thanh Điều Hướng Chương (Cố định ở đầu) */}
            <div className="sticky top-[106px] lg:top-[124px] z-40 bg-white shadow-md border-b border-gray-200">
                <div className="container mx-auto max-w-4xl p-2 flex justify-between items-center text-sm font-semibold">

                    {/* Tên truyện */}
                    <div className="truncate text-gray-600 hidden sm:block">
                        <Link to="/" className="text-red-500 hover:text-red-700 mr-2"><FaHome className="inline mb-0.5" /></Link>
                        / <Link to={`/story/${chapter.TID}`} className="hover:text-red-600 mx-1">{chapter.TenTruyen}</Link>
                        / <span className="text-gray-900 mx-1">{chapter.TenChuongTruyen}</span>
                    </div>

                    {/* Các nút điều hướng và chức năng */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">

                        {/* Chương Trước */}
                        <button
                            onClick={() => handleNavigation(chapter.ChuongTruocCID)}
                            disabled={!chapter.ChuongTruocCID}
                            className={`p-2 rounded-full transition duration-150 flex items-center 
                                        ${chapter.ChuongTruocCID ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            title="Chương Trước"
                        >
                            <FaArrowLeft className="mr-1" /> <span className="hidden sm:inline">Chương Trước</span>
                        </button>

                        {/* Danh Sách Chương */}
                        <Link
                            to={`/story/${chapter.TID}`}
                            className="p-2 px-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition shadow-md flex items-center"
                            title="Danh Sách Chương"
                        >
                            <FaList className="mr-1" /> <span className="hidden sm:inline">Danh Sách</span>
                        </Link>

                        {/* Chương Sau */}
                        <button
                            onClick={() => handleNavigation(chapter.ChuongTiepTheoCID)}
                            disabled={!chapter.ChuongTiepTheoCID}
                            className={`p-2 rounded-full transition duration-150 flex items-center 
                                        ${chapter.ChuongTiepTheoCID ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            title="Chương Tiếp"
                        >
                            <span className="hidden sm:inline">Chương Tiếp</span> <FaArrowRight className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Khu vực Nội dung Đọc */}
            <div className="container mx-auto max-w-4xl p-4 sm:p-8">

                {/* Tiêu đề Chương */}
                <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                    {chapter.TenChuongTruyen}
                </h1>

                {/* Nội dung Chương */}
                <div
                    className="reader-content text-lg leading-relaxed text-gray-800 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                    // Sử dụng dangerouslySetInnerHTML để render nội dung HTML/text từ API
                    // Lưu ý: Đảm bảo nội dung từ API là đáng tin cậy để tránh XSS.
                    dangerouslySetInnerHTML={{ __html: chapter.NoiDung || "<p class='text-center text-gray-500'>Nội dung chương này đang được cập nhật.</p>" }}
                />

                {/* Thanh Điều Hướng Chương (Lặp lại ở cuối) */}
                <div className="mt-10 flex justify-center items-center space-x-4">
                    <button
                        onClick={() => handleNavigation(chapter.ChuongTruocCID)}
                        disabled={!chapter.ChuongTruocCID}
                        className={`px-4 py-2 rounded-full transition duration-150 font-semibold flex items-center 
                                    ${chapter.ChuongTruocCID ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        <FaArrowLeft className="mr-2" /> Chương Trước
                    </button>
                    <Link
                        to={`/story/${chapter.TID}`}
                        className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-semibold flex items-center shadow-md"
                    >
                        <FaList className="mr-2" /> Mục Lục
                    </Link>
                    <button
                        onClick={() => handleNavigation(chapter.ChuongTiepTheoCID)}
                        disabled={!chapter.ChuongTiepTheoCID}
                        className={`px-4 py-2 rounded-full transition duration-150 font-semibold flex items-center 
                                    ${chapter.ChuongTiepTheoCID ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Chương Sau <FaArrowRight className="ml-2" />
                    </button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-6">
                    --- Hết Chương {chapter.TenChuongTruyen} ---
                </div>

            </div>
        </div>
    );
}

export default StoryReader;