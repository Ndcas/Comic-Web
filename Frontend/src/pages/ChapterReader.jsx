import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight, FaList, FaHome, FaHeart } from 'react-icons/fa';
import { IoIosWarning } from "react-icons/io";
import { get } from '../utils/request';
import { themVaoDanhSachYeuThich, ghiNhanLichSuDoc } from '../utils/nguoiDungApi';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function ChapterReader() {
    const { TID, CTID } = useParams();
    const token = localStorage.getItem('token');

    const [chapter, setChapter] = useState(null);
    const [relatedChapters, setRelatedChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);

    async function fetchChapterDetails() {
        setLoading(true);
        setError(null);
        try {
            let chuongTruyenResponse = null;
            let danhSachChuongResponse = null;

            if (token && localStorage.getItem('role') === 'NguoiDung') {
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinChuongTruyen?CTID=${CTID}`, false, true);
                danhSachChuongResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`, false, true);
            } else {
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinChuongTruyen?CTID=${CTID}`);
                danhSachChuongResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`);
            }

            const chuongTruyenData = await chuongTruyenResponse.json();
            if (!chuongTruyenResponse.ok) throw new Error(chuongTruyenData.error);

            const danhSachChuongData = await danhSachChuongResponse.json();
            if (!danhSachChuongResponse.ok) throw new Error(danhSachChuongData.error);

            setChapter(chuongTruyenData.chuongTruyen);
            setRelatedChapters(danhSachChuongData.chuongTruyens);
        } catch (err) {
            setError(err.message || "Lỗi hệ thống");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchChapterDetails();
        window.scrollTo(0, 0);
    }, [CTID]);

    useEffect(() => {
        if (token && TID && CTID) {
            ghiNhanLichSuDoc(token, TID, CTID)
                .then(() => console.log(`[History] Saved: TID=${TID}, CTID=${CTID}`))
                .catch(err => console.error("[History] Error:", err.message));
        }
    }, [TID, CTID, token]);

    const handleAddFavorite = async () => {
        if (!token) {
            alert("Bạn cần đăng nhập để thêm truyện vào yêu thích.");
            return;
        }
        setLoadingFavorite(true);
        try {
            await themVaoDanhSachYeuThich(token, chapter.Truyen.TID);
            setIsFavorite(true);
            alert("Đã thêm truyện vào danh sách yêu thích.");
        } catch (err) {
            alert("Lỗi khi thêm truyện: " + err.message);
        } finally {
            setLoadingFavorite(false);
        }
    };

    const currentIndex = relatedChapters.findIndex(item => item.CTID == CTID);
    const prevChapter = currentIndex > 0 ? relatedChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < relatedChapters.length - 1 ? relatedChapters[currentIndex + 1] : null;

    if (loading) return <div className="text-center p-8 text-xl text-white bg-black h-screen">Đang tải chương truyện...</div>;
    if (error) return <div className="text-center p-8 text-xl text-red-600 bg-black h-screen flex items-center justify-center"><IoIosWarning className="mr-2" /> {error}</div>;
    if (!chapter) return <div className="text-center p-8 text-gray-500 bg-black h-screen">Chương truyện không tồn tại.</div>;

    const NavigationBar = ({ placement }) => (
        <div className={`flex items-center justify-between p-3 sm:p-4 bg-gray-900 text-white shadow-md w-full ${placement === 'header' ? 'sticky top-0 z-20' : ''}`}>
            <Link to={`/story/${TID}`} className="flex items-center px-3 py-1 bg-red-600 rounded-full hover:bg-red-700 text-xs sm:text-sm font-semibold">
                <FaList className="mr-2" /> <span className="hidden sm:inline">Mục Lục</span>
            </Link>
            <h2 className="text-xs sm:text-base font-bold text-center truncate mx-2 flex-1">
                {chapter.Truyen.TenTruyen} - {chapter.TenChuongTruyen}
            </h2>
            <div className="flex space-x-2">
                <Link to={prevChapter ? `/read/${TID}/${prevChapter.CTID}` : '#'} className={`p-2 rounded-full ${prevChapter ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-800 opacity-30 cursor-not-allowed"}`}><FaAngleLeft /></Link>
                <Link to={nextChapter ? `/read/${TID}/${nextChapter.CTID}` : '#'} className={`p-2 rounded-full ${nextChapter ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-800 opacity-30 cursor-not-allowed"}`}><FaAngleRight /></Link>
            </div>
        </div>
    );

    return (
        <div className="bg-black min-h-screen w-full flex flex-col items-center">
            <NavigationBar placement="header" />

            {/* Vùng ảnh truyện: Tràn viền hoàn toàn */}
            <div className="w-full max-w-none p-0 m-0">
                {chapter.HinhAnhs.length > 0 ? (
                    chapter.HinhAnhs.map((imageName, index) => (
                        <div key={index} className="w-full bg-black">
                            <img
                                src={`${VITE_BACKEND_URL}/assets/images/${imageName.HinhAnh}`}
                                alt={`Trang ${index + 1}`}
                                className="w-full h-auto block p-0 m-0 border-none" 
                                style={{ display: 'block' }} // Khử khoảng cách dòng của thẻ img
                                loading="lazy"
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center p-20 text-gray-500 w-full">Chương truyện chưa có hình ảnh.</div>
                )}
            </div>

            <NavigationBar placement="footer" />

            {/* Chân trang */}
            <div className="w-full py-12 flex flex-col items-center space-y-4 bg-black border-t border-gray-800">
                <div className="flex space-x-6">
                    <button
                        onClick={handleAddFavorite}
                        disabled={isFavorite || loadingFavorite}
                        className={`flex items-center px-6 py-2 rounded-full text-white font-semibold transition-all ${isFavorite ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        <FaHeart className="mr-2" />
                        {isFavorite ? 'Đã Yêu Thích' : 'Thêm vào Yêu Thích'}
                    </button>
                    <Link to="/" className="flex items-center text-gray-300 hover:text-white font-semibold transition-colors">
                        <FaHome className="mr-2" /> Về Trang Chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ChapterReader;