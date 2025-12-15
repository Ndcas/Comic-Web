import React, { useState, useEffect, useCallback } from 'react';
import { 
    layLichSuDoc, 
    themVaoDanhSachYeuThich, 
    layDanhSachYeuThich 
} from '../utils/nguoiDungApi'; 
import { IoIosWarning } from "react-icons/io";
import { FaHeart } from 'react-icons/fa'; 
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
            console.error("Lỗi khi tải lịch sử đọc:", err);
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

    // --- Render logic ---
    if (loading && historyList.length === 0) {
        return <div className="text-center py-10">Đang tải lịch sử đọc...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500 flex items-center justify-center">
            <IoIosWarning className="mr-2" /> {error}
        </div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h1 className="text-3xl font-bold">Lịch Sử Đọc ({historyList.length})</h1>
                {/* Đã xóa nút Xóa tất cả theo yêu cầu */}
            </div>

            {historyList.length === 0 ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    Danh sách lịch sử đọc của bạn đang trống.
                </div>
            ) : (
                <div className="space-y-4">
                    {historyList.map(item => {
                        // FIX LỖI: Truy cập truyen qua ChuongTruyen một cách an toàn
                        const chuong = item.ChuongTruyen;
                        const truyen = chuong?.Truyen; 
                        
                        // Kiểm tra tính hợp lệ của dữ liệu 
                        if (!truyen || !chuong || !truyen.TID) {
                            console.warn("Mục lịch sử đọc bị thiếu dữ liệu Truyện/Chương hợp lệ:", item);
                            return (
                                <div key={item.LSDID || Math.random()} className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                                    <IoIosWarning className="inline mr-2" /> Dữ liệu truyện không đầy đủ, không thể hiển thị.
                                </div>
                            );
                        }

                        const readUrl = `/read/${truyen.TID}/${chuong.CTID}`; 
                        const storyUrl = `/truyen/${truyen.TID}`; 

                        return (
                            <div key={item.LSDID || truyen.TID} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
                                <div className="flex-1">
                                    {/* Link tới trang chi tiết */}
                                    <Link to={storyUrl} className="text-xl font-semibold text-blue-600 hover:underline">
                                        {truyen.TenTruyen}
                                    </Link>
                                    
                                    {/* Link tới chương đã đọc */}
                                    <p className="text-sm text-gray-500">
                                        Chương: 
                                        <Link 
                                            to={readUrl}
                                            className="text-indigo-500 hover:underline ml-1"
                                        >
                                            {chuong.SoChuong} - {chuong.TenChuong || chuong.TieuDeChuong} 
                                        </Link>
                                    </p>
                                    <p className="text-xs text-gray-400">Đọc lúc: {new Date(item.NgayDoc).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAddFavorite(truyen.TID)} 
                                        disabled={isFavorite(truyen.TID) || isProcessing}
                                        className={`px-3 py-1 text-white rounded-md transition duration-150 
                                            ${isFavorite(truyen.TID) ? 'bg-gray-400 cursor-not-allowed' :
                                                addingFavoriteId === truyen.TID ? 'bg-gray-400 cursor-not-allowed' :
                                                'bg-green-500 hover:bg-green-600'}`}
                                    >
                                        <FaHeart className="inline mr-1" />
                                        {isFavorite(truyen.TID) ? 'Đã yêu thích' :
                                        addingFavoriteId === truyen.TID ? 'Đang thêm...' :
                                        'Yêu Thích'}
                                    </button>
                                    {/* Đã xóa nút Xóa theo yêu cầu */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}