import React from 'react';
import { Link } from 'react-router-dom';

// Base URL để tải ảnh tĩnh
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Hàm tạo URL placeholder khi ảnh bìa lỗi hoặc thiếu.
 * @param {string} title - Tên truyện để đưa vào placeholder.
 * @returns {string} URL ảnh placeholder.
 */
const getPlaceholderUrl = (title) => {
    // Rút gọn tiêu đề để hiển thị trong placeholder
    const shortTitle = title ? title.split(' ').slice(0, 4).join(' ') : 'Truyen';
    return `https://placehold.co/180x240/1f2937/ffffff?text=${encodeURIComponent(shortTitle)}`;
};

/**
 * ComicCard Component (Thẻ hiển thị thông tin truyện)
 * @param {object} props - Props của component
 * @param {object} props.comic - Đối tượng truyện chứa dữ liệu (TID, TenTruyen, TrangThai, chuongTruyens, AnhBia)
 * @param {boolean} [props.isDarkMode=false] - Trạng thái chế độ tối (Bổ sung để có thể áp dụng theme cho card)
 */
function ComicCard({ comic, isDarkMode = false }) {
    if (!comic || !comic.TID) {
        return null;
    }

    // Lấy tên chương mới nhất (Chương cuối cùng trong mảng chuongTruyens)
    // const latestChapter = comic.chuongTruyens
    //     ? comic.chuongTruyens[comic.chuongTruyens.length - 1]
    //     : null;

    // Xác định trạng thái để hiển thị badge
    const statusText = comic.TrangThai == 1 ? 'Còn tiếp' : 'Hoàn thành';
    const statusColor = comic.TrangThai == 1 ? 'bg-red-600' : 'bg-blue-600';

    // URL ảnh bìa chính
    const coverImageUrl = `${VITE_BACKEND_URL}/assets/covers/${comic.AnhBia || 'default.jpg'}`;

    // Thiết lập màu sắc dựa trên Dark Mode
    const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
    const titleTextColor = isDarkMode ? 'text-white' : 'text-gray-800';

    return (
        // Thẻ Link bao bọc toàn bộ thẻ truyện
        <Link to={`/story/${comic.TID}`} className="group block h-full">
            <div className={`rounded-xl shadow-lg overflow-hidden 
                         hover:shadow-2xl transition-all duration-300 transform 
                         hover:-translate-y-1 border h-full flex flex-col ${cardBgClass}`}>

                {/* 1. Ảnh Bìa và Badge Trạng Thái */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <img
                        src={coverImageUrl}
                        alt={comic.TenTruyen}
                        // Hiệu ứng phóng to mượt mà khi hover
                        className="w-full h-full object-cover transition-all duration-500 
                                 group-hover:scale-105"
                        loading="lazy"
                        // Xử lý lỗi load ảnh: chuyển sang placeholder
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getPlaceholderUrl(comic.TenTruyen);
                        }}
                    />

                    {/* Overlay khi hover: làm ảnh tối đi và nổi bật chữ */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                    {/* Badge trạng thái (Làm nổi bật hơn) */}
                    <div className={`absolute top-2 left-2 px-3 py-1 
                                     text-xs font-bold text-white rounded-full ${statusColor} 
                                     shadow-lg z-10 uppercase tracking-wider`}>
                        {statusText}
                    </div>

                    {/* Chương mới nhất: Đặt ở góc dưới ảnh bìa */}
                    {/* {latestChapter && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 p-2 
                                         text-white text-xs font-medium truncate z-10">
                            Chương mới: <span className="text-red-400 font-bold">{latestChapter.TenChuongTruyen}</span>
                        </div>
                    )} */}
                </div>

                {/* 2. Thông tin mô tả (Footer) - Chỉ còn tên truyện */}
                <div className="p-3 flex-grow flex items-center justify-center text-center">
                    {/* Tên truyện (Hiển thị 2 dòng) */}
                    <h3 className={`text-base font-bold 
                                     line-clamp-2 group-hover:text-red-600 transition-colors ${titleTextColor}`}
                        title={comic.TenTruyen}>
                        {comic.TenTruyen}
                    </h3>
                </div>
            </div>
        </Link>
    );
}

export default ComicCard;