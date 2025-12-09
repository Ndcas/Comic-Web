import React from 'react';
import { Link } from 'react-router-dom';
import { FaGhost, FaHome } from 'react-icons/fa';

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
            <FaGhost className="text-9xl text-red-500 mb-6 animate-pulse" />
            <h1 className="text-6xl font-extrabold text-gray-800 mb-3">404</h1>
            <h2 className="text-3xl font-semibold text-gray-600 mb-6">Không Tìm Thấy Trang</h2>
            <p className="text-lg text-gray-500 mb-8 max-w-md">
                Xin lỗi, trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc chưa bao giờ tồn tại.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-full 
                           flex items-center hover:bg-red-700 transition-colors shadow-lg"
            >
                <FaHome className="mr-2" /> Về Trang Chủ
            </Link>
        </div>
    );
}

export default NotFound;