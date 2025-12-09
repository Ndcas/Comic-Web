import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { layDanhSachYeuThich, xoaKhoiDanhSachYeuThich } from '../utils/nguoiDungApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function FavoriteList() {
    const [favoriteStories, setFavoriteStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // -------- Fetch danh sách yêu thích --------
    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!token) {
            setError("Bạn cần đăng nhập để xem danh sách yêu thích.");
            setLoading(false);
            return;
        }

        try {
            const data = await layDanhSachYeuThich(token);
            setFavoriteStories(data.truyens || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách yêu thích:", err);
            if (err.message.includes("401")) {
                toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError(err.message || "Lỗi khi tải danh sách yêu thích.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // -------- Xóa 1 truyện --------
    const handleRemoveFavorite = async (TID) => {
        if (!token) {
            toast.warning("Bạn cần đăng nhập để xóa truyện yêu thích.");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn xóa truyện này khỏi danh sách yêu thích?")) return;

        setDeletingId(TID);

        try {
            await xoaKhoiDanhSachYeuThich(token, TID);
            setFavoriteStories(prev => prev.filter(story => story.TID !== TID));
            toast.success("Đã xóa truyện khỏi danh sách yêu thích.");
        } catch (err) {
            console.error(err);
            toast.error(`Lỗi khi xóa truyện: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading && favoriteStories.length === 0) {
        return <div className="text-center py-10">Đang tải danh sách...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <h1 className="text-3xl font-bold mb-6 border-b pb-2">
                Truyện Yêu Thích Của Bạn ({favoriteStories.length})
            </h1>

            {favoriteStories.length === 0 ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    <p>Danh sách yêu thích của bạn đang trống. Hãy thêm truyện vào nhé!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteStories.map(story => (
                        <div key={story.TID} className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
                            {story.AnhBia && (
                                <img
                                    src={`${VITE_BACKEND_URL}/assets/covers/${story.AnhBia}`}
                                    alt={story.TenTruyen}
                                    className="h-48 w-full object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/200x300?text=No+Img'; }}
                                />
                            )}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-blue-600 truncate">{story.TenTruyen}</h2>
                                    <p className="text-sm text-gray-500">Tác giả: {story.TacGia}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveFavorite(story.TID)}
                                    disabled={deletingId === story.TID}
                                    className={`mt-3 px-3 py-2 text-white rounded-md transition duration-150
                                        ${deletingId === story.TID ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                                >
                                    {deletingId === story.TID ? 'Đang Xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
