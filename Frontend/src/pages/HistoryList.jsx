import React, { useState, useEffect, useCallback } from 'react';
import { 
    layLichSuDoc, 
    themVaoDanhSachYeuThich, 
    layDanhSachYeuThich 
} from '../utils/nguoiDungApi'; 
import { IoIosWarning } from "react-icons/io";
import { FaHeart, FaClock, FaBookOpen } from 'react-icons/fa'; 
import { Link } from 'react-router-dom'; 

export default function HistoryList() {
    const [historyList, setHistoryList] = useState([]); 
    const [favoriteList, setFavoriteList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingFavoriteId, setAddingFavoriteId] = useState(null);

    const token = localStorage.getItem('token');
    const isProcessing = loading || addingFavoriteId !== null; 

    const fetchFavorites = useCallback(async () => {
        if (!token) return;
        try {
            const result = await layDanhSachYeuThich(token); 
            setFavoriteList(result.truyens || result || []); 
        } catch (err) {
            console.error("Lỗi khi tải danh sách yêu thích:", err);
        }
    }, [token]);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError("Bạn cần đăng nhập để xem lịch sử đọc.");
            setLoading(false);
            return;
        }
        try {
            const result = await layLichSuDoc(token); 
            setHistoryList(result.lichSuDoc || []); 
            await fetchFavorites();
        } catch (err) {
            setError(err.message || "Lỗi khi tải lịch sử đọc.");
        } finally {
            setLoading(false);
        }
    }, [token, fetchFavorites]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleAddFavorite = async (TID) => {
        setAddingFavoriteId(TID);
        try {
            await themVaoDanhSachYeuThich(token, TID);
            alert("Đã thêm truyện vào danh sách yêu thích!");
            await fetchFavorites();
        } catch (err) {
            alert("Lỗi khi thêm vào yêu thích: " + (err.message || "Lỗi không xác định"));
        } finally {
            setAddingFavoriteId(null);
        }
    };

    const isFavorite = (TID) => favoriteList.some(story => story.TID === TID);

    if (loading && historyList.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] dark:bg-gray-900 transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải lịch sử...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto py-20 px-4 text-center dark:bg-gray-900">
                <div className="inline-flex items-center p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                    <IoIosWarning className="mr-2 text-2xl" /> {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h1 className="text-3xl font-extrabold text-red-600 flex items-center">
                        <FaClock className="mr-3" size={28} /> 
                        Lịch Sử Đọc <span className="ml-2 text-gray-400 dark:text-gray-500 text-xl">({historyList.length})</span>
                    </h1>
                </div>

                {historyList.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-10 text-center border border-gray-100 dark:border-gray-700">
                        <FaBookOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={50} />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Danh sách lịch sử đọc của bạn đang trống.</p>
                        <Link to="/" className="mt-4 inline-block text-red-600 font-bold hover:underline">Khám phá truyện ngay</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyList.map((item, index) => {
                            const chuong = item.ChuongTruyen;
                            const truyen = chuong?.Truyen; 
                            
                            if (!truyen || !chuong || !truyen.TID) return null;

                            const readUrl = `/read/${truyen.TID}/${chuong.CTID}`; 
                            const storyUrl = `/truyen/${truyen.TID}`; 

                            return (
                                <div key={item.LSDID || `${truyen.TID}-${index}`} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
                                    <div className="flex-1 w-full">
                                        <Link to={storyUrl} className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-red-600 transition-colors">
                                            {truyen.TenTruyen}
                                        </Link>
                                        
                                        <div className="flex flex-wrap items-center mt-2 gap-y-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mr-4">
                                                <span className="font-medium mr-1">Đang đọc:</span> 
                                                <Link to={readUrl} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                    {/* Đã sửa thành TenChuongTruyen theo dữ liệu của bạn */}
                                                    {chuong.TenChuongTruyen || "Chương không xác định"}
                                                </Link>
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                                <FaClock className="mr-1" size={12} />
                                                {new Date(item.NgayDoc).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleAddFavorite(truyen.TID)} 
                                            disabled={isFavorite(truyen.TID) || isProcessing}
                                            className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm
                                                ${isFavorite(truyen.TID) 
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white border border-red-200 dark:border-red-800'}`}
                                        >
                                            <FaHeart className={`mr-2 ${isFavorite(truyen.TID) ? 'text-gray-400' : ''}`} />
                                            {isFavorite(truyen.TID) ? 'Đã yêu thích' :
                                             addingFavoriteId === truyen.TID ? 'Đang lưu...' : 'Yêu thích'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}