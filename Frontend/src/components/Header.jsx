import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, BookOpen, ChevronDown, ChevronUp, Settings, Sun, Moon } from 'lucide-react'; 
import CategoryDropdown from './CategoryDropdown.jsx'; 

const Header = ({ onHomeClick, isDarkMode, setIsDarkMode }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // --- State cho Dropdown Thể loại ---
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef(null);

    // --- State cho Dropdown Tùy chỉnh (Settings) ---
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    // Xử lý đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Đóng Category Dropdown
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            // Đóng Settings Dropdown
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

    // Hàm chuyển đổi theme
    const handleThemeSwitch = (mode) => {
        if (setIsDarkMode) {
            setIsDarkMode(mode === 'dark');
        }
        setIsSettingsOpen(false);
    };

    const navItems = [
        { name: 'Truyện Mới', path: '/new', isDropdown: false },
        { name: 'Truyện Hot', path: '/hot', isDropdown: false },
        { name: 'Truyện Đã Full', path: '/full', isDropdown: false },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            {/* Tầng 1: Logo, Tìm kiếm, Đăng nhập/Đăng ký */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                
                {/* Logo */}
                <Link 
                    to="/" 
                    onClick={(e) => {
                        // Nếu có prop onHomeClick (từ App.jsx), gọi nó để reset view về home
                        if (onHomeClick) {
                            e.preventDefault();
                            onHomeClick();
                        }
                    }}
                    className="text-2xl font-extrabold text-red-600 hover:text-red-700 transition tracking-wider flex items-center"
                >
                    <BookOpen size={24} className="mr-1" />ComicWeb
                </Link>

                {/* Thanh Tìm kiếm (Ẩn trên mobile) */}
                <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-lg mx-10">
                    <input
                        type="text"
                        placeholder="Tìm kiếm truyện, tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`p-2 border rounded-l-full focus:outline-none focus:border-red-500 w-full transition duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                    />
                    <button type="submit" className="p-2 bg-red-600 text-white rounded-r-full hover:bg-red-700 transition shadow-md -ml-1">
                        <Search size={20} />
                    </button>
                </form>

                {/* Khu vực bên phải: Tùy chỉnh & User */}
                <div className="flex items-center space-x-3">
                    
                    {/* --- NÚT TÙY CHỈNH (Desktop) --- */}
                    <div className="relative hidden sm:block" ref={settingsRef}>
                        <button 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`flex items-center space-x-1 font-medium hover:text-red-600 transition ${isSettingsOpen ? 'text-red-600' : ''}`}
                        >
                            <Settings size={20} />
                            <span>Tùy chỉnh</span>
                        </button>

                        {/* MENU DROPDOWN TÙY CHỈNH */}
                        {isSettingsOpen && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                                <button
                                    onClick={() => handleThemeSwitch('light')}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${!isDarkMode ? 'text-red-600 font-bold bg-red-50' : 'hover:bg-gray-600 hover:text-white'}`}
                                >
                                    <Sun size={16} />
                                    <span>Màu sáng</span>
                                </button>
                                <button
                                    onClick={() => handleThemeSwitch('dark')}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-red-400 font-bold bg-gray-600' : 'hover:bg-gray-100'}`}
                                >
                                    <Moon size={16} />
                                    <span>Màu tối</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Placeholder cho trạng thái người dùng */}
                    <Link to="/login" className={`hidden sm:block font-medium hover:text-red-600 transition ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Đăng nhập
                    </Link>
                    <Link to="/register" className="hidden sm:block px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-200 shadow-md">
                        Đăng ký
                    </Link>
                    
                    {/* Mobile Menu Icon */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className={`p-2 rounded-lg transition lg:hidden ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'}`}
                    >
                        <Menu size={24} /> 
                    </button>
                </div>
            </div>

            {/* Tầng 2: Thanh Navigation phụ (Chỉ hiển thị trên Desktop) */}
            <div className={`hidden lg:block border-t shadow-inner ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 items-center py-2">
                    
                    {/* Nút Thể Loại (Dropdown Menu) */}
                    <div className="relative" ref={categoryRef}>
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`px-3 py-1 font-medium transition duration-200 border-b-2 flex items-center ${
                                isCategoryOpen 
                                    ? 'text-red-600 border-red-600 rounded-t' + (isDarkMode ? ' bg-gray-700' : ' bg-red-50/50') 
                                    : 'border-transparent hover:border-red-600 ' + (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                            }`}
                        >
                            Thể Loại 
                            {isCategoryOpen 
                                ? <ChevronUp size={16} className="ml-1" /> 
                                : <ChevronDown size={16} className="ml-1" />
                            }
                        </button>
                        
                        {/* Component Dropdown Menu */}
                        {isCategoryOpen && <CategoryDropdown onClose={() => setIsCategoryOpen(false)} />}
                    </div>
                    
                    {/* Các mục Navigation còn lại */}
                    {navItems.map(item => (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className={`px-3 py-1 hover:text-red-600 transition duration-200 font-medium border-b-2 border-transparent hover:border-red-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    
                </nav>
            </div>
            
            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className={`lg:hidden border-t ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
                    <div className="px-4 pt-4 pb-4 space-y-3">
                        {/* Mobile Theme Switcher */}
                        <div className="flex justify-between items-center border-b pb-2 border-gray-600 mb-2">
                            <span className="font-medium">Giao diện</span>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => { if(setIsDarkMode) setIsDarkMode(false); }} 
                                    className={`p-1 px-3 rounded ${!isDarkMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                >Sáng</button>
                                <button 
                                    onClick={() => { if(setIsDarkMode) setIsDarkMode(true); }} 
                                    className={`p-1 px-3 rounded ${isDarkMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                >Tối</button>
                            </div>
                        </div>

                        {navItems.map(item => (
                            <Link key={item.name} to={item.path} className="block py-2 font-medium hover:text-red-600">
                                {item.name}
                            </Link>
                        ))}
                        <Link to="/login" className="block py-2 font-medium hover:text-red-600">Đăng nhập</Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;