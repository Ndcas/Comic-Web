import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, AlertTriangle, List, Star } from 'lucide-react';
import { get } from '../utils/request';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const StoryCard = ({ story }) => (
    
    <Link to={`/truyen/${story.TID}`} className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"> 
        <div className="relative overflow-hidden">
            <img
                src={`${VITE_BACKEND_URL}/assets/covers/${story.AnhBia || 'default.jpg'}`}
                alt={story.TenTruyen}
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x560/500000/ffffff?text=NO+COVER"; }}
            />
            {/* Tag trạng thái nổi bật hơn */}
            <span className={`absolute top-0 left-0 p-1 text-xs font-bold text-white ${story.TrangThai == 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                {story.TrangThai == 0 ? 'Hoàn thành' : 'Còn tiếp'}
            </span>
        </div>
        <div className="p-3">
            <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-red-600 transition duration-200" title={story.TenTruyen}>
                {story.TenTruyen}
            </h3>
        </div>
    </Link>
);

// --- COMPONENT: BẢNG XẾP HẠNG (MỚI) ---
const RankingSidebar = ({ rankingList }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <Star className="text-yellow-500 mr-2" size={20} fill="currentColor" /> Bảng Xếp Hạng Tuần
        </h3>
        <ul className="space-y-3">
            {rankingList.map((item, index) => (
                <li key={item.id} className="flex items-center space-x-3">
                    <span className={`text-xl font-extrabold w-6 text-center ${item.color}`}>
                        {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        {/* SỬA ĐƯỜNG DẪN TẠI ĐÂY: /story/ thành /truyen/ */}
                        <Link to={`/truyen/${item.id}`} className="font-semibold text-gray-800 hover:text-red-600 transition duration-200 truncate block">
                            {item.title}
                        </Link>
                        <p className="text-xs text-gray-500">Lượt đọc: {item.views}</p>
                    </div>
                </li>
            ))}
        </ul>
        <div className="mt-4 text-center">
            <Link to="/ranking" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-center">
                Xem Full Bảng Xếp Hạng <ChevronRight size={16} />
            </Link>
        </div>
    </div>
);


// --- COMPONENT: DANH SÁCH CHƯƠNG MỚI CẬP NHẬT (Đã tối ưu hóa) ---
const NewChapterList = ({ list }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <List className="text-blue-600 mr-2" size={20} /> Truyện Mới Cập Nhật
        </h3>
        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"> {/* Thêm scrollbar */}
            {list.map((item, index) => (
                <li key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                    {/* SỬA ĐƯỜNG DẪN TẠI ĐÂY: /story/ thành /truyen/ */}
                    <Link to={`/truyen/${item.TID}`} className="flex justify-between items-start hover:bg-gray-50 p-2 rounded-lg transition duration-200">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="font-semibold text-gray-800 hover:text-red-600 truncate text-base" title={item.TenTruyen}>
                                {item.TenTruyen}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium text-blue-600 hover:text-blue-800">{item.TenChuongTruyen}</span>
                            </p>
                        </div>
                        <span className="text-xs text-gray-400 ml-4 whitespace-nowrap text-right pt-1">
                            {(new Date(item.NgayDang)).toLocaleDateString('vi-VN')}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
        <div className="mt-4 text-right">
            <Link to="/new" className="text-red-600 hover:text-red-700 font-semibold flex items-center justify-end">
                Xem Toàn Bộ <ChevronRight size={18} />
            </Link>
        </div>
    </div>
);


// --- HOME PAGE MAIN COMPONENT ---
function Home() {
    const [hotStories, setHotStories] = useState([]);
    const [newChapters, setNewChapters] = useState([]);
    const [ranking] = useState([]); // Đã bỏ setRanking để tránh lỗi lint
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let truyenHotRequest = null;
            let truyenMoiRequest = null;
            if (localStorage.getItem('role') === 'NguoiDung' && localStorage.getItem('token')) { // <--- Cải tiến so sánh
                truyenHotRequest = await get(`${VITE_BACKEND_URL}/truyen/truyenHot`, false, true);
                truyenMoiRequest = await get(`${VITE_BACKEND_URL}/truyen/truyenMoiCapNhat`, false, true);
            } else {
                truyenHotRequest = await get(`${VITE_BACKEND_URL}/truyen/truyenHot`);
                truyenMoiRequest = await get(`${VITE_BACKEND_URL}/truyen/truyenMoiCapNhat`);
            }
            
            let truyenHot = await truyenHotRequest.json();
            if (!truyenHotRequest.ok) {
                throw new Error(truyenHot.error);
            }
            let truyenMoi = await truyenMoiRequest.json();
            if (!truyenMoiRequest.ok) {
                throw new Error(truyenMoi.error);
            }
            setHotStories(truyenHot.truyens);
            setNewChapters(truyenMoi.truyens);
            setIsLoading(false);
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống');
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
            <h1 className="sr-only">Trang Chủ ComicWeb - Nền tảng đọc truyện chuyên nghiệp</h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500"></div>
                    <p className="ml-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertTriangle className="mr-3" /> {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-3 space-y-8">

                        {/* Block: TRUYỆN HOT */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-6 border-b border-red-500 pb-3">
                                <h2 className="text-2xl font-extrabold text-gray-800 flex items-center">
                                    <TrendingUp className="text-red-600 mr-2" size={24} /> TRUYỆN HOT ĐỀ CỬ
                                </h2>
                            </div>

                            {/* Danh sách Truyện Hot dạng Card */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {hotStories.map((story, index) => (
                                    <StoryCard key={index} story={story} />
                                ))}
                            </div>
                        </div>

                        {/* Block: TRUYỆN MỚI CẬP NHẬT */}
                        <NewChapterList list={newChapters} />

                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;