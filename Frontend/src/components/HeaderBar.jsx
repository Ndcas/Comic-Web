import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Thêm tất cả các icons cần thiết cho Navigation và Thể loại truyện
import {
    Search, BookOpen, ChevronDown, Menu, Settings, Mail, List, TrendingUp, Sparkles, Sun, Moon,
    Heart, Smile, Zap, Sword, Ghost, Binary, ScrollText, History, // Đã thêm History icon
    // Các icons được thêm vào để khớp với danh sách thể loại mới
    Dices, Drama, School, Globe, Telescope, ZapOff, BookA, Activity, User, Briefcase,
    // THÊM ICON ĐĂNG NHẬP/ĐĂNG KÝ
    LogIn, UserPlus, LogOut, UserCircle
} from 'lucide-react';

// Import hook useTheme từ Layout.jsx (BẮT BUỘC để tránh lỗi biên dịch)
import { useTheme } from './Layout.jsx';

// 🚨 BƯỚC 1: IMPORT HOOK useAuth TỪ CONTEXT
import { useAuth } from '../utils/AuthContext.jsx'; 

import { get } from '../utils/request.js';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
/**
 * Component HeaderBar bao gồm Thanh Điều Hướng chính (Dark) và Thanh thông tin giới thiệu.
 */
const HeaderBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [genres, setGenres] = useState([]);

    // 🚨 BƯỚC 2: SỬ DỤNG useAuth ĐỂ LẤY TRẠNG THÁI user, loading và hàm logout
    const { user, logout, loading } = useAuth();

    // Hàm gọi API để lấy danh sách thể loại
    async function fetchGenres() {
        try {
            // Sử dụng cú pháp try/catch và exponential backoff cho API call
            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    let result = await get(`${VITE_BACKEND_URL}/truyen/theLoai`);
                    let data = await result.json();
                    if (!result.ok) {
                        throw new Error(data.error || "Lỗi khi tải thể loại.");
                    }
                    setGenres(data.theLoais);
                    return; // Thành công, thoát khỏi vòng lặp
                } catch (error) {
                    if (i < maxRetries - 1) {
                        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                        await new Promise(resolve => setTimeout(resolve, delay));
                        // Không in ra console khi retry
                    } else {
                        throw error; // Lần retry cuối cùng thất bại
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải thể loại từ API:", error);
            // Có thể thêm logic hiển thị lỗi cho người dùng ở đây nếu cần
        }
    }

    useEffect(() => {
        fetchGenres();
    }, [location.pathname]); // Cập nhật khi chuyển hướng


    // Sử dụng hook để lấy trạng thái và hàm chuyển đổi theme
    const { theme, toggleTheme } = useTheme();

    // 🚨 BƯỚC 3: XÓA BIẾN GIẢ LẬP VÌ CHÚNG TA ĐÃ DÙNG 'user' TỪ CONTEXT
    // const currentUser = null; 

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Chuyển đổi ký tự tìm kiếm thành slug an toàn trước khi navigate
            const safeQuery = encodeURIComponent(searchQuery.trim());
            navigate(`/search/${safeQuery}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false); // Đóng menu mobile sau khi tìm kiếm
        }
    };

    const navItems = [
        { name: 'Truyện Mới', path: '/new', icon: Sparkles },
        // { name: 'Truyện Hot', path: '/hot', icon: TrendingUp },
        // { name: 'Truyện Full', path: '/full', icon: List },
    ];

    // 🚨 BƯỚC 4: SỬ DỤNG HÀM logout THỰC TẾ VÀ CẬP NHẬT GIAO DIỆN
    const handleLogout = () => {
        logout(); // Gọi hàm logout từ AuthContext
        setIsMobileMenuOpen(false); 
        navigate('/'); // Điều hướng về trang chủ
    };
    
    // Hiển thị trạng thái Loading nếu cần
    if (loading) {
        // Có thể hiển thị spinner hoặc giữ nguyên giao diện cũ cho đến khi xác thực xong
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 shadow-2xl">

            {/* Tầng 1: Thanh Điều Hướng Chính (Màu tối đậm - #2a2f34) */}
            <nav className="bg-[#2a2f34] text-white h-16 flex items-center">
                <div className="container mx-auto max-w-7xl px-4 flex justify-between items-center w-full">

                    {/* Logo & Branding */}
                    <Link to="/" className="flex items-center text-2xl font-extrabold text-white hover:text-red-400 transition tracking-wider">
                        <BookOpen size={24} className="mr-2 text-red-500" />
                        COMICWEB
                    </Link>

                    {/* Main Menu Dropdowns (Desktop) */}
                    <div className="hidden lg:flex space-x-6 items-center text-sm font-medium">

                        {/* Danh sách (Menu Dropdown) - Thể loại */}
                        <div className="relative group">
                            <button className="flex items-center p-2 rounded hover:text-red-400 transition font-bold text-base">
                                <Menu size={18} className="mr-1" /> Danh sách
                                <ChevronDown size={14} className="ml-1 opacity-70 group-hover:rotate-180 transition" />
                            </button>
                            {/* Dropdown Content */}
                            {/* Tăng chiều rộng w-64 và thêm max-h-96 để chứa đủ danh sách thể loại mới */}
                            <div className="absolute left-0 mt-0 w-64 bg-white text-gray-800 rounded-md shadow-2xl py-2 hidden group-hover:block transition-all duration-300 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 max-h-96 overflow-y-auto">

                                {/* Các mục chính (Truyện Mới) */}
                                {navItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <item.icon size={16} className="mr-2 text-red-500" />
                                        {item.name}
                                    </Link>
                                ))}

                                {/* Thêm đường phân cách */}
                                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                                {/* Các Thể Loại Truyện */}
                                {genres.length > 0 ? (
                                    genres.map((genre, index) => (
                                        <Link
                                            key={index}
                                            to={`/genre/${genre.TLID}`}
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            {/* Hiện tại không có icon cho từng thể loại từ API, chỉ hiển thị tên */}
                                            {genre.TenTheLoai}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Đang tải thể loại...</div>
                                )}
                            </div>
                        </div>

                        {/* TÙY CHỈNH (Menu Dropdown MỚI) */}
                        <div className="relative group">
                            <button className="flex items-center p-2 rounded hover:text-red-400 transition font-bold text-base">
                                <Settings size={18} className="mr-1" /> Tùy chỉnh
                                <ChevronDown size={14} className="ml-1 opacity-70 group-hover:rotate-180 transition" />
                            </button>

                            {/* Dropdown Content - Theme Switcher và các tùy chọn khác */}
                            <div className="absolute right-0 mt-0 w-48 bg-white text-gray-800 rounded-md shadow-2xl py-2 hidden group-hover:block transition-all duration-300 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">

                                {/* Nút Chuyển Đổi Theme (SÁNG/TỐI) */}
                                <button
                                    onClick={toggleTheme} // Gọi hàm chuyển đổi theme
                                    className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition text-gray-700 dark:text-gray-200"
                                >
                                    {theme === 'dark' ? (
                                        <>
                                            <Sun size={18} className="mr-2 text-yellow-400" />
                                            Chế độ Sáng
                                        </>
                                    ) : (
                                        <>
                                            <Moon size={18} className="mr-2 text-blue-500" />
                                            Chế độ Tối
                                        </>
                                    )}
                                </button>

                                <Link to="/settings" className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition border-t border-gray-100 dark:border-gray-600">
                                    <Settings size={16} className="mr-2 text-red-500" />
                                    Cài đặt
                                </Link>

                            </div>
                        </div>

                        {/* Nút Góp ý */}
                        <Link to="/feedback" className="flex items-center p-2 rounded hover:text-red-400 transition font-bold text-base">
                            <Mail size={18} className="mr-1" /> Góp ý
                        </Link>
                    </div>

                    {/* Search Bar & AUTH/MOBILE Menu Button */}
                    <div className="flex items-center space-x-3">
                        {/* Search Bar (Nền tối, viền đỏ) */}
                        <form onSubmit={handleSearch} className="hidden sm:flex">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="p-2 text-sm rounded-l bg-gray-700 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-red-600 w-32 md:w-48 text-white placeholder-gray-400 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="p-2 px-3 bg-red-600 rounded-r hover:bg-red-700 transition duration-150 border border-red-600">
                                <Search className="w-4 h-4" />
                            </button>
                        </form>

                        {/* --- KHU VỰC XÁC THỰC (DESKTOP) --- */}
                        {/* 🚨 SỬ DỤNG BIẾN user TỪ CONTEXT */}
                        {user ? (
                            // 1. Đã đăng nhập: Avatar và Menu Người dùng
                            <div className="relative group hidden lg:block">
                                <button className="flex items-center space-x-2 p-1 rounded-full bg-red-600 hover:bg-red-700 transition duration-150 text-white shadow-md">
                                    <UserCircle size={24} className="text-white" />
                                    {/* Hiển thị email người dùng, bạn có thể thay bằng username nếu có */}
                                    <span className="text-sm font-semibold pr-2">{user.email || 'User'}</span>
                                </button>
                                {/* Dropdown Profile */}
                                {/* CHÚ Ý: ĐÃ SỬA TỪ 'mt-2' THÀNH 'mt-0' ĐỂ KHẮC PHỤC LỖI MẤT MENU KHI HOVER */}
                                <div className="absolute right-0 mt-0 w-48 bg-white text-gray-800 rounded-md shadow-2xl py-2 hidden group-hover:block transition-all duration-300 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" style={{ zIndex: 60 }}>
                                    <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <User size={16} className="mr-2 text-blue-500" /> Tài khoản
                                    </Link>
                                    <Link to="/favorites" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <Heart size={16} className="mr-2 text-red-500" /> Truyện yêu thích
                                    </Link>
                                    {/* 👇 THÊM LỊCH SỬ ĐỌC (Desktop) 👇 */}
                                    <Link to="/history" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <History size={16} className="mr-2 text-green-500" /> Lịch sử đọc
                                    </Link>
                                    {/* 👆 KẾT THÚC LỊCH SỬ ĐỌC 👆 */}
                                    <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500">
                                        <LogOut size={16} className="mr-2" /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // 2. Chưa đăng nhập: Nút Đăng nhập/Đăng ký
                            <div className="hidden lg:flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="flex items-center px-4 py-1.5 text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-md"
                                >
                                    <LogIn size={16} className="mr-1" /> Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center px-4 py-1.5 text-sm font-semibold rounded-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition duration-150"
                                >
                                    <UserPlus size={16} className="mr-1" /> Đăng ký
                                </Link>
                            </div>
                        )}
                        {/* --- KẾT THÚC KHU VỰC XÁC THỰC (DESKTOP) --- */}


                        {/* Mobile Menu Icon (Hiển thị trên mọi kích thước, trừ lg) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-white hover:bg-gray-700 rounded-lg transition lg:hidden"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                </div>
            </nav>

            {/* Tầng 2: Thanh Giới Thiệu (Màu tối nhạt hơn - #41484e) */}
            <div className="bg-[#41484e] py-1.5 text-center text-xs text-gray-300 border-t border-gray-700">
                Đọc truyện online, đọc truyện chữ, truyện full. Tổng hợp đầy đủ và cập nhật liên tục.
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div id="mobile-menu" className="lg:hidden absolute top-full left-0 right-0 bg-[#2a2f34] shadow-xl border-t border-gray-700 pb-4 max-h-[80vh] overflow-y-auto">
                    {/* Mobile Search Form */}
                    <form onSubmit={handleSearch} className="p-4 flex">
                        <input
                            type="text"
                            placeholder="Tìm kiếm truyện, tác giả..."
                            className="p-2 text-sm rounded-l bg-gray-700 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-red-600 w-full text-white placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="p-2 px-3 bg-red-600 rounded-r hover:bg-red-700 transition duration-150 border border-red-600">
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="flex flex-col space-y-1 px-4">
                        {/* Mobile Navigation Links (Mới) */}
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-lg font-bold"
                            >
                                <item.icon size={18} className="mr-3 text-red-500" />
                                {item.name}
                            </Link>
                        ))}

                        {/* Thêm đường phân cách cho mobile */}
                        <div className="border-t border-gray-700 my-1"></div>

                        {/* Mobile Genre Links (Thể loại) */}
                        <p className="px-3 pt-2 pb-1 text-sm font-semibold text-gray-400 uppercase">Thể loại</p>
                        {genres.length > 0 ? (
                            genres.map((genre, index) => (
                                <Link
                                    key={index}
                                    to={`/genre/${genre.TLID}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-lg"
                                >
                                    {genre.TenTheLoai}
                                </Link>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">Đang tải...</div>
                        )}

                        {/* Thêm đường phân cách cho mobile */}
                        <div className="border-t border-gray-700 my-1"></div>

                        {/* Nút Chuyển Đổi Theme (MOBILE) */}
                        <button
                            onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                            className="w-full text-left flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-lg font-bold transition"
                        >
                            {theme === 'dark' ? (
                                <Sun size={18} className="mr-3 text-yellow-400" />
                            ) : (
                                <Moon size={18} className="mr-3 text-blue-500" />
                            )}
                            {theme === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối'}
                        </button>

                        {/* Nút Cài đặt (giữ nguyên) */}
                        <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-lg font-bold">
                            <Settings size={18} className="mr-3 text-red-500" /> Cài đặt
                        </Link>

                        {/* Nút Góp ý (giữ nguyên) */}
                        <Link to="/feedback" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-lg font-bold">
                            <Mail size={18} className="mr-3 text-red-500" /> Hòm thư góp ý
                        </Link>
                    </div>

                    {/* Thêm nút Đăng nhập/Đăng ký trên mobile (LUÔN HIỂN THỊ) */}
                    <div className="p-4 border-t border-gray-700 mt-2 flex justify-end space-x-3">
                        {/* 🚨 SỬ DỤNG BIẾN user TỪ CONTEXT */}
                        {user ? (
                            // Đã đăng nhập trên mobile
                            <div className="flex flex-col w-full space-y-2">
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-white font-semibold rounded-lg bg-gray-700 hover:bg-gray-600 transition flex items-center justify-center">
                                    <User size={16} className="mr-2 text-blue-400" /> Tài khoản của tôi
                                </Link>
                                {/* 👇 THÊM TRUYỆN YÊU THÍCH (Mobile) 👇 */}
                                <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-white font-semibold rounded-lg bg-gray-700 hover:bg-gray-600 transition flex items-center justify-center">
                                    <Heart size={16} className="mr-2 text-red-400" /> Truyện yêu thích
                                </Link>
                                {/* 👇 THÊM LỊCH SỬ ĐỌC (Mobile) 👇 */}
                                <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-white font-semibold rounded-lg bg-gray-700 hover:bg-gray-600 transition flex items-center justify-center">
                                    <History size={16} className="mr-2 text-green-400" /> Lịch sử đọc
                                </Link>
                                {/* 👆 KẾT THÚC LỊCH SỬ ĐỌC 👆 */}
                                <button onClick={handleLogout} className="px-3 py-2 text-sm text-red-400 font-semibold rounded-lg border border-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center">
                                    <LogOut size={16} className="mr-2" /> Đăng xuất
                                </button>
                            </div>
                        ) : (
                            // Chưa đăng nhập trên mobile
                            <>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 px-3 py-2 text-sm text-gray-300 hover:text-white transition rounded-lg border border-gray-500 hover:bg-gray-700 text-center font-semibold">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 px-3 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200 text-center">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderBar;