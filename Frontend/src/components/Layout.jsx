import React, { useState, useContext, createContext, useEffect } from 'react';
// Đổi tên import thành HeaderBar để khớp với tên component trong file HeaderBar.jsx
import HeaderBar from './HeaderBar'; 
import Footer from './Footer'; 
import { Outlet } from 'react-router-dom';

// 1. TẠO CONTEXT (ThemeContext)
const ThemeContext = createContext();

/**
 * 2. TẠO CUSTOM HOOK useTheme
 * Hook này cho phép các component con truy cập vào giá trị theme và hàm toggleTheme
 * Nó được export để sử dụng trong HeaderBar.jsx
 */
export const useTheme = () => {
    // Lấy context, nếu null/undefined tức là hook được gọi ngoài ThemeContext.Provider
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a Layout component (ThemeProvider)');
    }
    return context;
};

/**
 * 3. Component Layout (Đóng vai trò là ThemeProvider)
 * Toàn bộ logic quản lý Theme được đặt ở đây.
 */
function Layout() {
    // 4. State quản lý theme: Ưu tiên lấy từ localStorage hoặc mặc định là 'light'
    const [theme, setTheme] = useState(() => {
        // Kiểm tra localStorage khi component mount lần đầu
        if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
            return window.localStorage.getItem('theme');
        }
        // Mặc định là 'light'
        return 'light';
    });

    // 5. Hàm chuyển đổi theme
    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
    };

    /**
     * 6. Dùng useEffect để áp dụng class 'dark' lên <html> element và lưu vào localStorage
     * Đây là bước quan trọng để Tailwind CSS nhận diện chế độ Dark Mode.
     */
    useEffect(() => {
        const root = window.document.documentElement;
        // Xóa class cũ (để tránh lỗi)
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        // Thêm class mới ('dark' hoặc 'light')
        root.classList.add(theme);

        // Lưu trạng thái theme vào localStorage để duy trì
        window.localStorage.setItem('theme', theme);
    }, [theme]); // Chạy lại khi theme thay đổi

    // Giá trị cung cấp qua Context
    const contextValue = { theme, toggleTheme };

    return (
        <ThemeContext.Provider value={contextValue}>
            {/* 7. Bọc toàn bộ nội dung trong ThemeContext.Provider 
                Class BG ở đây chỉ là dự phòng, class chính được áp dụng lên <html>
                
                LƯU Ý: Không sử dụng Tailwind's dark: class trên thẻ Layout này, vì nó sẽ mâu thuẫn.
                Thay vào đó, chỉ áp dụng màu nền trực tiếp dựa trên state 'theme'.
            */}
            <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
                
                {/* Header cố định đã được tối ưu trong HeaderBar.jsx */}
                <HeaderBar /> 
                
                {/* Nội dung trang sẽ được render ở đây */}
                <main className="flex-grow pt-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"> 
                    <Outlet />
                </main>
                
                {/* Footer */}
                <Footer />
            </div>
        </ThemeContext.Provider>
    );
}

export default Layout;