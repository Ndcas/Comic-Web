// src/pages/ComicManagementPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookOpen, Search, Eye, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

const ComicManagementPage = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho phân trang và tìm kiếm (có thể mở rộng sau)
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalComics, setTotalComics] = useState(0);

    // API Endpoint: /truyen?page=...&limit=...
    const COMIC_API_URL = '/truyen'; 

    // Hàm lấy danh sách truyện từ Backend
    const fetchComics = async () => {
        setLoading(true);
        setError(null);
        try {
            // Thêm Authorization Header để Backend xác thực Admin
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(COMIC_API_URL, {
                params: { 
                    page: page, 
                    limit: 10, // Giả sử 10 truyện mỗi trang
                    q: searchQuery 
                },
                headers: {
                    // Backend của bạn có thể yêu cầu token ở đây
                    Authorization: `Bearer ${token}`, 
                },
                // Bật cookie để Backend đọc refreshToken (nếu cần)
                withCredentials: true 
            });

            // 💡 TODO: Điều chỉnh theo cấu trúc Response của API /truyen thực tế
            setComics(response.data.comics || response.data); 
            setTotalComics(response.data.total || response.data.length); 

        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu truyện:", err);
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra Server Backend.");
            toast.error("Lỗi: Không thể tải danh sách truyện.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComics();
    }, [page, searchQuery]); // Tải lại khi thay đổi trang hoặc tìm kiếm

    // Hàm xử lý duyệt truyện (Ví dụ)
    const handleVerify = (comicId) => {
        // 💡 TODO: Gọi API POST /admin/verifyComic
        toast.info(`Đã gửi yêu cầu duyệt truyện ID: ${comicId}`);
    };

    // Hàm xử lý xóa truyện (Ví dụ)
    const handleDelete = (comicId) => {
        // 💡 TODO: Gọi API DELETE /admin/comics/:id
        if (window.confirm(`Bạn có chắc muốn xóa truyện ID ${comicId} này không?`)) {
            toast.error(`Đã xóa truyện ID: ${comicId}`);
        }
    };


    if (loading) return <div className="text-center py-10 text-indigo-600">Đang tải dữ liệu truyện...</div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            
            {/* Thanh Tìm kiếm và Tiêu đề */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-indigo-600"/> Quản lý Truyện ({totalComics} truyện)
                </h2>
                <div className="relative w-1/3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên truyện..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Bảng Danh sách Truyện */}
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Truyện</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comics.map((comic) => (
                            <tr key={comic.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comic.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{comic.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comic.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        comic.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                                        comic.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {comic.status === 'Verified' ? <CheckCircle className="w-4 h-4 mr-1"/> : <Clock className="w-4 h-4 mr-1"/>}
                                        {comic.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comic.views}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    
                                    {/* Nút Duyệt truyện */}
                                    {comic.status === 'Pending' && (
                                        <button
                                            onClick={() => handleVerify(comic.id)}
                                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                            title="Duyệt"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}

                                    {/* Nút Chi tiết/Xem */}
                                    <Link 
                                        to={`/story/${comic.id}`} 
                                        target="_blank"
                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </Link>
                                    
                                    {/* Nút Chỉnh sửa */}
                                    <button
                                        // 💡 TODO: Thêm logic chuyển hướng đến trang chỉnh sửa
                                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Nút Xóa */}
                                    <button
                                        onClick={() => handleDelete(comic.id)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang (Có thể bổ sung sau) */}
            <div className="flex justify-center items-center space-x-4">
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg bg-white shadow hover:bg-gray-100 disabled:opacity-50"
                >
                    Trang trước
                </button>
                <span className="text-gray-700">Trang {page} / {Math.ceil(totalComics / 10)}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 10 >= totalComics}
                    className="px-4 py-2 border rounded-lg bg-white shadow hover:bg-gray-100 disabled:opacity-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default ComicManagementPage;