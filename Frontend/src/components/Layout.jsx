import React, { useState, useContext, createContext, useEffect } from 'react';
import HeaderBar from './HeaderBar'; 
import Footer from './Footer'; 
import { Outlet, useLocation } from 'react-router-dom'; 

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a Layout component (ThemeProvider)');
    }
    return context;
};

function Layout() {
    const location = useLocation(); 
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
            return window.localStorage.getItem('theme');
        }
        return 'light';
    });

    
    const isReaderPage = location.pathname.startsWith('/read');
    
    
    const isHomePage = location.pathname === '/';

    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        window.localStorage.setItem('theme', theme);
    }, [theme]);

    const contextValue = { theme, toggleTheme };

    return (
        <ThemeContext.Provider value={contextValue}>
            <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isReaderPage ? 'bg-black' : (theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50')}`}>
                
                {!isReaderPage && <HeaderBar />} 
                
                {/* GIẢI PHÁP MỞ RỘNG TOÀN MÀN HÌNH:
                    - Nếu là trang đọc (isReaderPage) HOẶC trang chủ (isHomePage): 
                      Sử dụng 'w-full pt-...' và XÓA 'max-w-7xl mx-auto'.
                    - Các trang khác (Chi tiết truyện, Profile...): 
                      Giữ nguyên 'max-w-7xl mx-auto' để nội dung thu gọn ở giữa cho dễ nhìn.
                */}
                <main className={`flex-grow w-full ${
                    (isReaderPage || isHomePage) 
                    ? (isReaderPage ? 'pt-0' : 'pt-24') 
                    : 'pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
                }`}> 
                    <Outlet />
                </main>
                
                {!isReaderPage && <Footer />}
            </div>
        </ThemeContext.Provider>
    );
}

export default Layout;