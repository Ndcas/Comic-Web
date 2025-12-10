import React, { useState, useContext, createContext, useEffect } from 'react';
import HeaderBar from './HeaderBar'; 
import Footer from './Footer'; 
import { Outlet } from 'react-router-dom';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a Layout component (ThemeProvider)');
    }
    return context;
};

function Layout() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
            return window.localStorage.getItem('theme');
        }
        return 'light';
    });

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
            <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
                
                <HeaderBar /> 
                
                <main className="flex-grow pt-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"> 
                    <Outlet />
                </main>
                
                <Footer />
            </div>
        </ThemeContext.Provider>
    );
}

export default Layout;