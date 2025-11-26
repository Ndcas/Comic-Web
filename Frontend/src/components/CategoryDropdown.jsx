import React from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpen, Tag, Zap, Compass, Heart, Laugh, Ghost, 
    Frown, Sparkles, Rocket, School, Trophy, SearchCode, 
    Cog, Aperture, Home, ScrollText, Package, Drama, Lightbulb,
    Sun, Moon // Thêm icon Sun và Moon cho tùy chỉnh giao diện
} from 'lucide-react'; 

// Dữ liệu thể loại đầy đủ bao gồm ID, Tên và Slug, được bổ sung Icon và Màu sắc
const CATEGORIES = [
    { id: 1, name: 'Hành động', slug: 'hanh-dong', icon: Zap, color: 'text-red-600' },
    { id: 3, name: 'Phiêu lưu', slug: 'phieu-luu', icon: Compass, color: 'text-orange-500' },
    { id: 5, name: 'Tình cảm', slug: 'tinh-cam', icon: Heart, color: 'text-pink-500' },
    { id: 4, name: 'Hài hước', slug: 'hai-huoc', icon: Laugh, color: 'text-green-600' },
    { id: 6, name: 'Kinh dị', slug: 'kinh-di', icon: Ghost, color: 'text-purple-600' },
    { id: 9, name: 'Giả tưởng', slug: 'gia-tuong', icon: Sparkles, color: 'text-cyan-500' },
    { id: 8, name: 'Khoa học viễn tưởng', slug: 'khoa-hoc-vien-tuong', icon: Rocket, color: 'text-blue-600' },
    { id: 10, name: 'Học đường', slug: 'hoc-duong', icon: School, color: 'text-teal-500' },
    { id: 11, name: 'Thể thao', slug: 'the-thao', icon: Trophy, color: 'text-lime-600' },
    { id: 13, name: 'Trinh thám', slug: 'trinh-tham', icon: SearchCode, color: 'text-indigo-600' },
    { id: 14, name: 'Mecha', slug: 'mecha', icon: Cog, color: 'text-gray-600' },
    { id: 15, name: 'Isekai', slug: 'isekai', icon: Aperture, color: 'text-purple-400' },
    { id: 16, name: 'Đời thường', slug: 'doi-thuong', icon: Home, color: 'text-amber-600' },
    { id: 12, name: 'Lịch sử', slug: 'lich-su', icon: ScrollText, color: 'text-yellow-700' },
    { id: 7, name: 'Bi kịch', slug: 'bi-kich', icon: Frown, color: 'text-gray-500' },
    // Các thể loại phân loại theo nguồn (sử dụng icon chung)
    { id: 17, name: 'Manga', slug: 'manga', icon: BookOpen, color: 'text-red-700' },
    { id: 18, name: 'Manhwa', slug: 'manhwa', icon: Package, color: 'text-green-700' },
    { id: 19, name: 'Manhua', slug: 'manhua', icon: Package, color: 'text-blue-700' },
    { id: 20, name: 'Comics', slug: 'comics', icon: Drama, color: 'text-blue-400' },
];

/**
 * Menu Dropdown hiển thị danh sách các thể loại truyện và Tùy chỉnh giao diện
 * @param {object} props - Props của component
 * @param {function} props.onClose - Hàm được gọi khi người dùng click vào một thể loại
 * @param {boolean} props.isDarkMode - Trạng thái chế độ tối hiện tại (Cần thiết cho giao diện)
 * @param {function} props.setIsDarkMode - Hàm setter để thay đổi chế độ tối (Cần thiết cho chức năng)
 */
const CategoryDropdown = ({ onClose, isDarkMode, setIsDarkMode }) => {
    
    // Hàm xử lý chuyển đổi chế độ Sáng/Tối
    const handleThemeSwitch = (mode) => {
        if (setIsDarkMode) {
            setIsDarkMode(mode === 'dark');
        }
        onClose(); // Đóng dropdown sau khi chọn
    };

    return (
        <div 
            className="absolute top-full left-0 mt-2 max-w-xs md:max-w-md w-full z-50 
                       bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 
                       border border-gray-200 dark:border-gray-700 
                       max-h-[70vh] overflow-y-auto transform origin-top-left animate-slide-down"
            // Ngăn chặn sự kiện click lan truyền lên Header để không đóng dropdown ngay lập tức
            onClick={(e) => e.stopPropagation()} 
        >
            <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> TẤT CẢ CÁC THỂ LOẠI
            </h3>
            
            {/* Grid 2 cột cho Thể loại */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon || Tag; // Fallback to Tag
                    return (
                        <Link
                            key={category.id}
                            // Sử dụng slug cho URL category
                            to={`/category/${category.slug}`} 
                            onClick={onClose}
                            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition truncate group"
                        >
                            {/* Icon tùy chỉnh hoặc Tag */}
                            <CategoryIcon className={`w-4 h-4 mr-2 opacity-80 ${category.color} transition duration-150 group-hover:opacity-100`} />
                            {category.name}
                        </Link>
                    );
                })}
            </div>

            {/* --- TÙY CHỈNH GIAO DIỆN (Dark/Light Mode) --- */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" /> TÙY CHỈNH GIAO DIỆN
                </h4>
                <div className="flex space-x-3">
                    {/* Nút Màu sáng */}
                    <button
                        onClick={() => handleThemeSwitch('light')}
                        className={`flex-1 flex items-center justify-center p-2 text-sm font-medium rounded-lg transition-all border ${
                            !isDarkMode 
                                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                    >
                        <Sun className="w-4 h-4 mr-1" /> Màu sáng
                    </button>
                    {/* Nút Màu tối */}
                    <button
                        onClick={() => handleThemeSwitch('dark')}
                        className={`flex-1 flex items-center justify-center p-2 text-sm font-medium rounded-lg transition-all border ${
                            isDarkMode 
                                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                    >
                        <Moon className="w-4 h-4 mr-1" /> Màu tối
                    </button>
                </div>
            </div>
            
            {/* Link xem trang đầy đủ */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <Link to="/categories" onClick={onClose} className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition duration-150">
                    Xem Trang Thể Loại Đầy Đủ
                </Link>
            </div>

            {/* Thêm một vài hiệu ứng CSS đơn giản */}
            <style jsx>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-down {
                    animation: slide-down 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; /* Sử dụng bounce effect nhẹ */
                }
            `}</style>
        </div>
    );
};

export default CategoryDropdown;