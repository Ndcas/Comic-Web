import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Dữ liệu Giả định ---
const DUMMY_COMICS = [
    { id: 1, title: "Đại Thần Trở Lại", chapter: "Chapter 120 (END)", imageUrl: "https://placehold.co/300x400/3B82F6/ffffff?text=Great+God+Returns", views: "98.5K", genre: "Huyền Huyễn", rating: 4.8 },
    { id: 2, title: "Thần Y Trùng Sinh", chapter: "Chapter 55", imageUrl: "https://placehold.co/300x400/EF4444/ffffff?text=Reborn+Doctor", views: "72.1K", genre: "Đô Thị", rating: 4.5 },
    { id: 3, title: "Võ Luyện Đỉnh Phong", chapter: "Chapter 3000+", imageUrl: "https://placehold.co/300x400/10B981/ffffff?text=Martial+Peak", views: "150K", genre: "Tiên Hiệp", rating: 4.9 },
    { id: 4, title: "One Piece", chapter: "Chapter 1100", imageUrl: "https://placehold.co/300x400/F59E0B/ffffff?text=One+Piece", views: "210K", genre: "Hải Tặc", rating: 5.0 },
    { id: 5, title: "Đấu Phá Thương Khung", chapter: "Chapter 1600", imageUrl: "https://placehold.co/300x400/8B5CF6/ffffff?text=Battle+Through+The+Heavens", views: "180K", genre: "Huyền Huyễn", rating: 4.7 },
    { id: 6, title: "Yêu Thần Ký", chapter: "Chapter 400", imageUrl: "https://placehold.co/300x400/EC4899/ffffff?text=Tales+of+Demons+and+Gods", views: "115K", genre: "Đô Thị", rating: 4.6 },
];

const DUMMY_CHAPTER_CONTENT = "Đại Thần Trở Lại - Chapter 120 (END)\n\n\n\nChương này là chương cuối cùng. Cảm ơn bạn đã đồng hành cùng tác giả và bộ truyện trong suốt thời gian qua. Câu chuyện của nhân vật chính đã đi đến hồi kết viên mãn.\n\n\n\nTrong khung cảnh ánh trăng thanh thoát, nhân vật chính đứng trên đỉnh núi cao nhất, nhìn xuống thế gian phồn hoa. Một nụ cười nhẹ nở trên môi, kết thúc mọi ân oán. Sức mạnh của hắn đã đạt đến cảnh giới vô thượng, và không còn gì có thể ngăn cản bước chân của hắn nữa.\n\n\n\nKhắp nơi trên thế giới đều vang vọng danh tiếng của hắn. Hắn không chỉ là một vị thần, mà còn là một truyền thuyết sống, mãi mãi được người đời ca tụng. Hắn để lại những di sản vĩ đại, thay đổi vận mệnh của cả một kỷ nguyên.\n\n\n\nTrong khoảnh khắc cuối cùng, hắn không thấy hối tiếc, chỉ thấy bình yên. Mọi thử thách đã qua, mọi mục tiêu đã đạt được. Hắn là người chiến thắng cuối cùng.\n\n\n\n***Hết Chương 120***\n\n\n\nCảm ơn độc giả đã ủng hộ!";

const App = () => {
    // 1. STATE QUẢN LÝ CHẾ ĐỘ SÁNG/TỐI (Mặc định là false = Sáng)
    const [isDarkMode, setIsDarkMode] = useState(false);

    // State chính để quản lý view
    const [currentView, setCurrentView] = useState('home');
    const [selectedComicId, setSelectedComicId] = useState(null);

    // State cấu hình đọc truyện
    const [readerConfig, setReaderConfig] = useState(() => ({
        fontSize: 18, // Tăng cỡ chữ mặc định
        fontFamily: 'Inter',
        backgroundColor: '#1a1a1a',
        lineHeight: 1.8,
    }));

    const selectedComic = DUMMY_COMICS.find(c => c.id === selectedComicId);

    const openReader = (comicId) => {
        setSelectedComicId(comicId);
        setCurrentView('reader');
        window.scrollTo(0, 0);
    };

    const goHome = useCallback(() => {
        setCurrentView('home');
        setSelectedComicId(null);
        window.scrollTo(0, 0);
    }, []);

    // 2. CẬP NHẬT GLOBAL STYLES THEO DARK MODE VÀ READER CONFIG
    const globalStyles = `
        body {
            font-family: 'Inter', sans-serif;
            /* Nếu đang đọc truyện thì dùng màu của readerConfig, nếu ở trang chủ thì dùng theo Theme */
            background-color: ${currentView === 'reader' ? readerConfig.backgroundColor : (isDarkMode ? '#111827' : '#f3f4f6')};
            color: ${currentView === 'reader' ? '#f3f4f6' : (isDarkMode ? '#f9fafb' : '#1f2937')};
            transition: background-color 0.3s, color 0.3s;
        }
        .search-input::placeholder {
            color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
        /* Tùy chỉnh scrollbar đẹp hơn */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? '#374151' : '#e5e7eb'}; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#4b5563' : '#9ca3af'}; border-radius: 4px; }
    `;

    // --- Utility Components ---
    const SearchInput = () => {
        return (
            <div className={`flex items-center rounded-xl overflow-hidden w-full max-w-xs transition-all duration-300 shadow-xl ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className={`search-input bg-transparent text-base p-3 w-full focus:outline-none ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
                />
                <button className="p-3 bg-red-600 hover:bg-red-700 transition duration-150 transform hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        );
    };

    // --- Header Component ---
    const Header = ({ onHomeClick, currentView, isDarkMode, setIsDarkMode, setReaderConfig }) => {
        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [isSettingsOpen, setIsSettingsOpen] = useState(false);
        const settingsRef = useRef(null);

        // Đóng menu khi click ra ngoài
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                    setIsSettingsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Cập nhật reader config để khớp với dark mode khi ở trang chủ
        const toggleTheme = (isDark) => {
            setIsDarkMode(isDark);
            // Đặt lại reader config về mặc định Tối hoặc Sáng tương ứng
            if (isDark) {
                setReaderConfig(prev => ({ ...prev, backgroundColor: '#1a1a1a' }));
            } else {
                setReaderConfig(prev => ({ ...prev, backgroundColor: '#f9fafb' }));
            }
            setIsSettingsOpen(false);
        };


        const NavLink = ({ name, iconPath, onClick = () => { } }) => (
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClick(); }}
                className={`flex items-center text-sm font-medium p-2 rounded-lg transition duration-150 hover:bg-red-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300 hover:text-red-500' : 'text-gray-600 hover:text-red-600'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
                {name}
            </a>
        );

        return (
            <header className={`shadow-xl sticky top-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <a href="#" onClick={(e) => { e.preventDefault(); onHomeClick(); }} className="flex items-center text-3xl font-extrabold cursor-pointer group">
                                <span className="text-red-600 text-4xl mr-1 transition-colors duration-300 group-hover:text-red-500">C</span>OMIC<span className="text-red-600">WEB</span>
                            </a>
                        </div>

                        {/* Desktop Navigation & Search */}
                        <nav className="hidden lg:flex space-x-6 items-center">
                            {/* Danh sách: Đã dùng NavLink nên chữ luôn hiển thị */}
                            <NavLink name="Danh sách" iconPath="M4 6h16M4 12h16M4 18h16" />

                            <NavLink name="Thể loại" iconPath="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h14z" />
                            <NavLink name="Góp ý" iconPath="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                            {/* --- NÚT TÙY CHỈNH THEME (ĐÃ CHỈNH SỬA) --- */}
                            <div className="relative" ref={settingsRef}>
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={`flex items-center text-sm font-medium p-2 rounded-lg transition duration-150 focus:outline-none ${isSettingsOpen ? 'text-red-600 bg-red-50 dark:bg-gray-700' : (isDarkMode ? 'text-gray-300 hover:text-red-500' : 'text-gray-600 hover:text-red-600 hover:bg-gray-100')}`}
                                    title="Tùy chỉnh giao diện"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 **mr-1**" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLineLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    **<span className="text-sm font-medium">Tùy chỉnh</span>** {/* <--- ĐÃ THÊM VĂN BẢN VÀO ĐÂY */}
                                </button>

                                {/* Menu con thả xuống */}
                                {isSettingsOpen && (
                                    <div className={`absolute right-0 lg:left-0 mt-2 w-40 rounded-xl shadow-2xl py-1 ring-1 ring-black ring-opacity-5 origin-top-right transform transition-all duration-200 ease-out animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                        <div className={`block px-4 pt-2 pb-1 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Giao diện</div>
                                        <button
                                            onClick={() => toggleTheme(false)}
                                            className={`w-full text-left px-4 py-2 text-sm flex items-center transition duration-150 ${!isDarkMode ? 'text-red-600 font-bold bg-red-50' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Màu sáng
                                        </button>
                                        <button
                                            onClick={() => toggleTheme(true)}
                                            className={`w-full text-left px-4 py-2 text-sm flex items-center transition duration-150 ${isDarkMode ? 'text-red-400 font-bold bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                            Màu tối
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4">
                                <SearchInput />
                            </div>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center lg:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`inline-flex items-center justify-center p-2 rounded-md transition duration-150 focus:outline-none ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMenuOpen && (
                    <div className={`lg:hidden border-t transition-all duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {/* Mobile Search */}
                            <div className="p-3">
                                <SearchInput />
                            </div>
                            {/* Mobile Toggle Dark Mode */}
                            <div className={`px-3 py-2 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-2`}>
                                <span className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Giao diện</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => toggleTheme(false)} className={`p-2 rounded-lg text-sm font-semibold transition duration-150 ${!isDarkMode ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 bg-gray-200 hover:bg-gray-300'}`}>Sáng</button>
                                    <button onClick={() => toggleTheme(true)} className={`p-2 rounded-lg text-sm font-semibold transition duration-150 ${isDarkMode ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 bg-gray-200 hover:bg-gray-300'}`}>Tối</button>
                                </div>
                            </div>
                            <a href="#" className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}>Danh sách</a>
                            <a href="#" className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}>Thể loại</a>
                            <a href="#" className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}>Góp ý</a>
                        </div>
                    </div>
                )}

                {currentView === 'home' && (
                    <div className={`${isDarkMode ? 'bg-gray-900 text-gray-400 border-gray-700' : 'bg-red-50 text-red-700 border-red-200'} text-center py-3 text-sm border-t font-medium`}>
                        Đọc truyện online, đọc truyện chữ, truyện full. Tổng hợp đầy đủ và cập nhật liên tục.
                    </div>
                )}
            </header>
        );
    };

    // --- Comic Card Component ---
    const ComicCard = ({ id, title, chapter, imageUrl, views, genre, rating, onClick }) => (
        <div
            className={`rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.03] transition-all duration-300 cursor-pointer border ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-red-600' : 'bg-white border-gray-100 hover:border-red-600'}`}
            onClick={() => onClick(id)}
        >
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-opacity duration-300 opacity-95 hover:opacity-100"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x400/374151/f3f4f6?text=Image+Not+Found";
                    }}
                />
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg">
                    {views} views
                </div>
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-xs font-medium px-3 py-1 rounded-tr-lg">
                    {genre}
                </div>
            </div>
            <div className="p-4">
                <h3 className={`text-lg font-semibold h-14 overflow-hidden transition duration-150 mb-1 ${isDarkMode ? 'text-white hover:text-red-500' : 'text-gray-900 hover:text-red-600'}`}>{title}</h3>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400 font-medium">{chapter}</p>
                    <div className="flex items-center text-yellow-400 text-sm font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {rating}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Home Content Component ---
    const MainContent = ({ comics, onComicClick }) => {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
                <h2 className={`text-4xl font-extrabold mb-8 border-b-4 border-red-600 pb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-red-600">Truyện</span> Nổi Bật
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {comics.map((comic) => (
                        <ComicCard
                            key={comic.id}
                            id={comic.id}
                            title={comic.title}
                            chapter={comic.chapter}
                            imageUrl={comic.imageUrl}
                            views={comic.views}
                            genre={comic.genre}
                            rating={comic.rating}
                            onClick={onComicClick}
                        />
                    ))}
                </div>
                <div className="flex justify-center mt-12">
                    <button className="px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition duration-150 mx-2 transform hover:scale-105">1</button>
                    <button className={`px-5 py-3 font-semibold rounded-xl shadow-lg transition duration-150 mx-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>2</button>
                    <button className={`px-5 py-3 font-semibold rounded-xl shadow-lg transition duration-150 mx-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </main>
        );
    };

    // --- Reader Settings Component ---
    const ReaderSettings = ({ config, setConfig }) => {
        const updateConfig = (key, value) => {
            setConfig(prev => ({ ...prev, [key]: value }));
        };
        const fontSizes = [16, 18, 20, 22, 24]; // Cập nhật cỡ chữ
        const backgroundThemes = [
            { name: 'Tối', color: '#1a1a1a', text: '#f3f4f6' },
            { name: 'Sáng', color: '#f9fafb', text: '#1f2937' },
            { name: 'Giấy', color: '#fffdf6', text: '#4b5563' },
            { name: 'Xanh', color: '#dcfce7', text: '#065f46' },
        ];
        return (
            <div className={`p-6 rounded-xl shadow-2xl border mb-6 sticky top-20 z-40 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xl font-bold text-red-500 mb-4 border-b border-gray-700 pb-2">Cài Đặt Đọc</h4>
                <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cỡ Chữ ({config.fontSize}px)</label>
                    <div className="flex flex-wrap gap-2">
                        {fontSizes.map(size => (
                            <button
                                key={size}
                                onClick={() => updateConfig('fontSize', size)}
                                className={`w-10 h-10 rounded-full text-base font-semibold transition duration-150 border-2 ${config.fontSize === size ? 'bg-red-600 text-white border-red-600 shadow-md' : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Màu Nền</label>
                    <div className="flex flex-wrap gap-3">
                        {backgroundThemes.map(theme => (
                            <button
                                key={theme.name}
                                onClick={() => updateConfig('backgroundColor', theme.color)}
                                className={`w-12 h-12 rounded-full shadow-lg border-2 transition duration-150 flex items-center justify-center text-sm font-bold ${config.backgroundColor === theme.color ? 'border-red-500 ring-2 ring-red-500 ring-offset-2 ring-offset-current' : 'border-gray-400 hover:border-red-600'}`}
                                style={{ backgroundColor: theme.color, color: theme.text, ringOffsetColor: isDarkMode ? '#1f2937' : '#ffffff' }}
                                title={theme.name}
                            >
                                {theme.name[0]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="lineHeight" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Khoảng cách dòng ({config.lineHeight.toFixed(1)})</label>
                    <input
                        id="lineHeight"
                        type="range"
                        min="1.4"
                        max="2.5"
                        step="0.1"
                        value={config.lineHeight}
                        onChange={(e) => updateConfig('lineHeight', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
                    />
                </div>
            </div>
        );
    };

    // --- Reader Content Component ---
    const ReaderContent = ({ comic, config, goHome }) => {
        if (!comic) return null;
        const paragraphs = DUMMY_CHAPTER_CONTENT.split('\n\n').filter(p => p.trim() !== '');

        // Xác định màu chữ dựa trên màu nền để đảm bảo độ tương phản
        const getTextColor = (bgColor) => {
            if (['#1a1a1a', '#111827'].includes(bgColor)) return '#f3f4f6';
            if (['#f9fafb', '#fffdf6', '#dcfce7'].includes(bgColor)) return '#1f2937';
            // Mặc định cho các màu nền khác (nếu có)
            return '#1f2937';
        };

        const readerStyle = {
            fontSize: `${config.fontSize}px`,
            lineHeight: config.lineHeight,
            fontFamily: config.fontFamily,
            color: getTextColor(config.backgroundColor),
        };

        // Màu nền cho khu vực nội dung
        const contentBgColor = config.backgroundColor === '#1a1a1a' ? '#27272a' : config.backgroundColor;

        return (
            <main className="min-h-screen transition-colors duration-500" style={{ backgroundColor: config.backgroundColor }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8 pt-4">
                        <button onClick={goHome} className="text-sm text-gray-400 hover:text-red-500 transition duration-150 flex items-center mx-auto mb-2 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Trở về trang chủ
                        </button>
                        <h1 className="text-4xl font-extrabold text-red-500 mb-2">{comic.title}</h1>
                        <h2 className="text-2xl font-semibold" style={{ color: readerStyle.color }}>{comic.chapter}</h2>
                    </div>

                    <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                        {/* Cột Cài Đặt (Desktop) */}
                        <div className="lg:col-span-1 hidden lg:block">
                            <ReaderSettings config={config} setConfig={setReaderConfig} />
                        </div>

                        {/* Cột Nội Dung */}
                        <div className="lg:col-span-3">
                            {/* Cài đặt (Mobile/Tablet) */}
                            <div className="mt-8 mb-8 lg:hidden">
                                <ReaderSettings config={config} setConfig={setReaderConfig} />
                            </div>

                            <div className="p-6 sm:p-8 rounded-xl shadow-2xl transition-colors duration-500 border border-gray-700" style={{ backgroundColor: contentBgColor, color: readerStyle.color }}>
                                <div className="text-justify whitespace-pre-wrap" style={readerStyle}>
                                    {paragraphs.map((p, index) => (
                                        <p key={index} className="mb-6 indent-8" style={readerStyle}>{p}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Nút Điều hướng Chương */}
                            <div className="flex justify-between mt-12 pt-4 border-t border-gray-700">
                                <button className="flex items-center px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-xl shadow-lg hover:bg-gray-600 transition duration-150 transform hover:scale-105">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                    Chương Trước
                                </button>
                                <button className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition duration-150 transform hover:scale-105">
                                    Chương Tiếp
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-7-7h14" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    };

    // --- Footer Component ---
    const Footer = () => {
        const footerLinks = {
            'Liên Kết': ['Trang Chủ', 'Thể Loại', 'Tìm Kiếm', 'Truyện Mới'],
            'Hỗ Trợ': ['FAQ', 'Liên Hệ', 'Chính sách', 'Điều khoản'],
            'Mạng Xã Hội': ['Facebook', 'Twitter', 'Telegram'],
        };
        return (
            <footer className={`border-t-4 border-red-600 mt-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center mb-4">
                                <span className="text-red-600 text-4xl font-extrabold mr-1">C</span><span className="text-white text-3xl font-extrabold">OMIC</span><span className="text-red-600 text-3xl font-extrabold">WEB</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">Nền tảng đọc truyện tranh và truyện chữ trực tuyến chuyên nghiệp. Đọc mọi lúc, mọi nơi.</p>
                        </div>
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title} className="text-sm">
                                <h4 className="text-red-500 font-bold mb-3 border-b border-gray-700 pb-1">{title}</h4>
                                <ul className="space-y-2">{links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-gray-400 hover:text-red-500 transition duration-150">{link}</a>
                                    </li>
                                ))}</ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} COMICWEB. All rights reserved. Designed by Code.
                    </div>
                </div>
            </footer>
        );
    };

    // --- Main Renderer ---
    return (
        <div className={`app-container ${currentView === 'reader' ? 'overflow-hidden' : ''}`}>
            <style>{globalStyles}</style>
            <Header
                onHomeClick={goHome}
                currentView={currentView}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                setReaderConfig={setReaderConfig}
            />
            {currentView === 'home' && <MainContent comics={DUMMY_COMICS} onComicClick={openReader} />}
            {currentView === 'reader' && selectedComic && <ReaderContent comic={selectedComic} config={readerConfig} setReaderConfig={setReaderConfig} goHome={goHome} />}
            <Footer />
        </div>
    );
};

export default App;