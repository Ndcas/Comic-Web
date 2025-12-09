import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, BookOpen, ChevronDown, ChevronUp, Settings, Sun, Moon, User } from 'lucide-react'; // 💡 Đã thêm User
import CategoryDropdown from './CategoryDropdown.jsx'; 
import { useAuth } from "../utils/AuthContext";  

const Header = ({ onHomeClick, isDarkMode, setIsDarkMode }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();  
    
    // 💡 DEBUG LOG: Bật console log để kiểm tra giá trị user
    console.log("DEBUG: Trạng thái User (Header):", user); 

    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const categoryRef = useRef(null);
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search/${searchTerm.trim()}`);
            setSearchTerm('');
        }
    };

    const handleThemeSwitch = (mode) => {
        if (setIsDarkMode) {
            setIsDarkMode(mode === 'dark');
        }
        setIsSettingsOpen(false);
    };

    const navItems = [
        { name: 'Truyện Mới', path: '/new' },
        { name: 'Truyện Hot', path: '/hot' },
        { name: 'Truyện Đã Full', path: '/full' },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            
            {/* Tầng 1: Logo + Tìm kiếm + User */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                
                {/* Logo */}
                <Link 
                    to="/" 
                    onClick={(e) => {
                        if (onHomeClick) {
                            e.preventDefault();
                            onHomeClick();
                        }
                    }}
                    className="text-2xl font-extrabold text-red-600 hover:text-red-700 transition tracking-wider flex items-center"
                >
                    <BookOpen size={24} className="mr-1" />ComicWeb
                </Link>

                {/* Thanh Tìm kiếm */}
                <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-lg mx-10">
                    <input
                        type="text"
                        placeholder="Tìm kiếm truyện, tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`p-2 border rounded-l-full w-full transition duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                    />
                    <button type="submit" className="p-2 bg-red-600 text-white rounded-r-full hover:bg-red-700 transition shadow-md -ml-1">
                        <Search size={20} />
                    </button>
                </form>

                {/* Phần phải: Settings + User */}
                <div className="flex items-center space-x-3">
                    
                    {/* Settings */}
                    <div className="relative hidden sm:block" ref={settingsRef}>
                        <button 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`flex items-center space-x-1 font-medium hover:text-red-600 transition ${isSettingsOpen ? 'text-red-600' : ''}`}
                        >
                            <Settings size={20} />
                            <span>Tùy chỉnh</span>
                        </button>

                        {isSettingsOpen && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                                <button
                                    onClick={() => handleThemeSwitch('light')}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100"
                                >
                                    <Sun size={16} />
                                    <span>Màu sáng</span>
                                </button>
                                <button
                                    onClick={() => handleThemeSwitch('dark')}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100"
                                >
                                    <Moon size={16} />
                                    <span>Màu tối</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 🔥 USER ACCOUNT AREA (Đã sửa để hiển thị icon) 🔥 */}
                    {user ? (
                        // HIỂN THỊ ICON VÀ EMAIL KHI ĐÃ ĐĂNG NHẬP
                        <div className="relative flex items-center space-x-3">
                            {/* Nút/Biểu tượng Tài khoản */}
                            <button
                                // Tạm thời gọi logout. Đây nên là nút mở User Dropdown Menu
                                onClick={logout} 
                                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-200 shadow-md"
                                title={`Tài khoản: ${user.email || 'Người dùng'}`}
                            >
                                {/* Sử dụng Icon User */}
                                <User size={20} /> 
                            </button>

                            {/* Tên người dùng/email (Giờ đã hiển thị mặc định) */}
                            <span className="font-medium text-red-600 hidden lg:block">
                                {user.email || 'Tài khoản'}
                            </span>
                            
                        </div>
                    ) : (
                        // HIỂN THỊ NÚT ĐĂNG NHẬP/ĐĂNG KÝ KHI CHƯA ĐĂNG NHẬP
                        <>
                            {/* 💡 Đã bỏ class ẩn */}
                            <Link to="/login" className="font-medium hover:text-red-600 transition">
                                Đăng nhập
                            </Link>
                            {/* 💡 Đã bỏ class ẩn */}
                            <Link to="/register" className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-200 shadow-md">
                                Đăng ký
                            </Link>
                        </>
                    )}

                    {/* Mobile menu icon */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className={`p-2 rounded-lg lg:hidden ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'}`}
                    >
                        <Menu size={24} /> 
                    </button>
                </div>
            </div>

            {/* Tầng 2: Nav */}
            <div className={`hidden lg:block border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 items-center py-2">
                    
                    {/* Thể loại */}
                    <div className="relative" ref={categoryRef}>
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`px-3 py-1 font-medium flex items-center border-b-2 transition 
                            ${isCategoryOpen ? 'text-red-600 border-red-600' : 'border-transparent hover:border-red-600'}`}
                        >
                            Thể Loại 
                            {isCategoryOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                        </button>

                        {isCategoryOpen && <CategoryDropdown onClose={() => setIsCategoryOpen(false)} />}
                    </div>

                    {/* Nav items */}
                    {navItems.map(item => (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className="px-3 py-1 hover:text-red-600 transition font-medium border-b-2 border-transparent hover:border-red-600"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;