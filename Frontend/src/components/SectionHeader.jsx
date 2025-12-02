import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaFire, FaFeather } from 'react-icons/fa';

/**
 * Component hiển thị tiêu đề cho một phần (section) trên trang chủ.
 * @param {object} props - Các thuộc tính của component.
 * @param {string} props.title - Tiêu đề của phần (e.g., "TRUYỆN HOT ĐỀ CỬ").
 * @param {string} props.linkTo - Đường dẫn khi nhấn nút "TẤT CẢ" (e.g., "/hot").
 * @param {string} props.iconType - Loại icon hiển thị (e.g., 'hot' hoặc 'new').
 */
function SectionHeader({ title, linkTo, iconType }) {
    
    // Chọn icon dựa trên prop iconType
    let IconComponent;
    if (iconType === 'hot') {
        IconComponent = FaFire; // Icon lửa cho mục HOT
    } else if (iconType === 'new') {
        IconComponent = FaFeather; // Icon cánh chim cho mục MỚI
    } else {
        IconComponent = FaFire; // Mặc định là lửa
    }
    
    return (
        <div className="flex justify-between items-center mb-6 pt-4 border-b-4 border-red-600">
            {/* Tiêu đề chính */}
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
                {/* Icon nổi bật, màu đỏ */}
                <IconComponent className="text-red-600 mr-3 text-2xl animate-pulse" />
                {title}
            </h2>
            
            {/* Nút "TẤT CẢ" */}
            <Link 
                to={linkTo} 
                className="flex items-center text-sm font-semibold text-gray-600 hover:text-red-700 
                           bg-gray-100 px-3 py-1 rounded-full transition-all duration-300 hover:shadow-md"
                title={`Xem tất cả truyện trong mục ${title}`}
            >
                TẤT CẢ
                <FaChevronRight className="ml-1 text-xs" />
            </Link>
        </div>
    );
}

export default SectionHeader;