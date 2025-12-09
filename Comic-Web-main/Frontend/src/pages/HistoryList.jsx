import React, { useState, useEffect, useCallback } from 'react';
import { 
    layLichSuDoc, 
    xoaLichSuDoc, 
    xoaTatCaLichSuDoc, 
    themVaoDanhSachYeuThich, 
    layDanhSachYeuThich 
} from '../utils/nguoiDungApi'; 
import { IoIosWarning } from "react-icons/io";
import { FaTrash, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 
// import Layout from '../components/Layout'; // Nếu bạn có Layout component

export default function HistoryList() {
    const [historyList, setHistoryList] = useState([]);
    const [favoriteList, setFavoriteList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null); 
    const [addingFavoriteId, setAddingFavoriteId] = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);

    const token = localStorage.getItem('token');
    const isProcessing = loading || deletingId !== null || addingFavoriteId !== null || deletingAll;

    // Lấy danh sách yêu thích
    const fetchFavorites = useCallback(async () => {
        if (!token) return;
        try {
            const result = await layDanhSachYeuThich(token); 
            // Giả định API trả về mảng truyện yêu thích
            setFavoriteList(result || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách yêu thích:", err);
        }
    }, [token]);

    // Lấy lịch sử đọc
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
            // Giả định API trả về { lichSuDoc: [...] }
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

    // Xóa một truyện khỏi lịch sử đọc (theo TID)
    const handleDelete = async (TID) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa TẤT CẢ lịch sử đọc liên quan đến truyện này?")) return;

        setDeletingId(TID);
        try {
            await xoaLichSuDoc(token, TID); 
            setHistoryList(prev => prev.filter(item => item.Truyen.TID !== TID)); 
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.message || "Lỗi không xác định"));
        } finally {
            setDeletingId(null);
        }
    };

    // Xóa tất cả lịch sử đọc
    const handleDeleteAll = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc?")) return;

        setDeletingAll(true);
        try {
            await xoaTatCaLichSuDoc(token);
            setHistoryList([]);
        } catch (err) {
            alert("Lỗi khi xóa tất cả: " + (err.message || "Lỗi không xác định"));
        } finally {
            setDeletingAll(false);
        }
    };

    // Thêm vào danh sách yêu thích
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

    // Kiểm tra xem truyện đã có trong yêu thích chưa
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
        // <Layout>
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h1 className="text-3xl font-bold">Lịch Sử Đọc ({historyList.length})</h1>
                {historyList.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        disabled={isProcessing}
                        className={`px-3 py-1 text-white rounded-md transition duration-150 
                            ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {deletingAll ? 'Đang xóa...' : 'Xóa tất cả'}
                    </button>
                )}
            </div>

            {historyList.length === 0 ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    Danh sách lịch sử đọc của bạn đang trống.
                </div>
            ) : (
                <div className="space-y-4">
                    {historyList.map(item => {
                        // **FIX LỖI TypeError: Kiểm tra an toàn trước khi truy cập**
                        const truyen = item.Truyen;
                        const chuong = item.ChuongTruyen;
                        
                        if (!truyen || !chuong || !truyen.TID) {
                            // Bỏ qua mục bị lỗi hoặc hiển thị thông báo
                            console.warn("Mục lịch sử đọc bị thiếu dữ liệu Truyện/Chương hợp lệ:", item);
                            return (
                                <div key={item.LSDID || Math.random()} className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                                    <IoIosWarning className="inline mr-2" /> Dữ liệu truyện không đầy đủ, không thể hiển thị.
                                </div>
                            );
                        }

                        return (
                            <div key={item.LSDID || truyen.TID} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
                                <div className="flex-1">
                                    {/* Link tới trang chi tiết */}
                                    <Link to={`/truyen/${truyen.MaTruyen}`} className="text-xl font-semibold text-blue-600 hover:underline">
                                        {truyen.TenTruyen}
                                    </Link>
                                    
                                    {/* Link tới chương đã đọc */}
                                    <p className="text-sm text-gray-500">
                                        Chương: 
                                        <Link 
                                            to={`/doc-truyen/${truyen.MaTruyen}/chuong/${chuong.SoChuong}`}
                                            className="text-indigo-500 hover:underline ml-1"
                                        >
                                            {chuong.TieuDeChuong}
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

                                    <button
                                        onClick={() => handleDelete(truyen.TID)} // Dùng TID để xóa
                                        disabled={isProcessing}
                                        className={`px-3 py-1 text-white rounded-md transition duration-150 
                                            ${deletingId === truyen.TID ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                                    >
                                        <FaTrash className="inline mr-1" />
                                        {deletingId === truyen.TID ? 'Đang xóa...' : 'Xóa'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        // </Layout>
    );
}