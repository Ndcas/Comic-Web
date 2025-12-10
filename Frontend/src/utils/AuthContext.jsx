// src/utils/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from 'axios'; 

// 🛠️ SỬA LỖI: Thêm giá trị mặc định đầy đủ vào createContext
const AuthContext = createContext({
    user: null, 
    login: () => {}, 
    logout: () => {}, 
    // 🚨 Thay đổi chữ ký hàm để hỗ trợ Admin Login
    updateToken: (newToken, newExpiry, newRole, newEmail, newTenTaiKhoan) => {}, 
    loading: true,
});

// Lấy BASE_URL từ biến môi trường
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 
const BASE_URL = VITE_BACKEND_URL; 

// Hàm tiện ích đọc Local Storage
const getUserFromLocalStorage = () => {
    const token = localStorage.getItem("token"); 
    const role = localStorage.getItem("role"); 
    const email = localStorage.getItem("email"); 
    const exp = localStorage.getItem("exp"); 
    const tenTaiKhoan = localStorage.getItem("tenTaiKhoan"); 

    if (token && role && email && exp) {
        console.log("DEBUG: AuthContext read success:", { token: token.substring(0, 10) + '...', role, email });
        return { 
            token, 
            role, // <-- Thuộc tính quan trọng cho AdminProtectedRoute
            email: email, 
            exp: exp,
            TenTaiKhoan: tenTaiKhoan || email 
        }; 
    }
    
    console.log("DEBUG: AuthContext read failed (some keys missing).");
    return null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🚨 TỐI ƯU HÓA: Bọc hàm bằng useCallback
    const login = useCallback(() => {
        setUser(getUserFromLocalStorage());
        console.log("DEBUG: login() called, user state updated.");
    }, []);

    // 🚨 HÀM ĐÃ SỬA: Nhận đủ tham số để lưu thông tin Admin và cập nhật state
    const updateToken = useCallback((newToken, newExpiry, newRole, newEmail, newTenTaiKhoan = null) => {
        // 1. Cập nhật Local Storage
        localStorage.setItem('token', newToken);
        localStorage.setItem('exp', newExpiry);
        // QUAN TRỌNG: Lưu ROLE và EMAIL để AdminProtectedRoute và các component khác sử dụng
        localStorage.setItem('role', newRole);
        localStorage.setItem('email', newEmail);
        if (newTenTaiKhoan) {
            localStorage.setItem('tenTaiKhoan', newTenTaiKhoan);
        }

        // 2. Cập nhật State
        setUser({
            token: newToken,
            role: newRole,
            email: newEmail,
            exp: newExpiry,
            TenTaiKhoan: newTenTaiKhoan || newEmail,
        });

        console.log("DEBUG: Token, Role và thông tin người dùng đã được cập nhật.");
    }, []);


    // 🚨 TỐI ƯU HÓA: Bọc hàm bằng useCallback
    const logout = useCallback(() => {
        localStorage.clear(); // Xóa tất cả các mục liên quan đến user
        setUser(null); 
        console.log("DEBUG: Người dùng đã đăng xuất.");
    }, []);

    useEffect(() => {
        setUser(getUserFromLocalStorage());
        setLoading(false);
    }, []);

    const value = useMemo(() => ({
        user, 
        logout, 
        login, 
        loading,
        updateToken, 
    }), [user, logout, login, loading, updateToken]); // useMemo cho value

    return (
        <AuthContext.Provider value={value}> 
            {/* Chỉ render children sau khi đã kiểm tra xong Local Storage */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// 💡 EXPORT CUSTOM HOOKS
export const useAuth = () => useContext(AuthContext);

/**
 * 🚨 HOOK MỚI: Tạo instance Axios có đính kèm Access Token.
 */
export const useAuthAxios = () => {
    const { user } = useAuth(); 

    // Tối ưu hóa: Chỉ tạo lại instance khi token thay đổi
    const authAxios = useMemo(() => {
        const instance = axios.create({
            baseURL: BASE_URL, 
            headers: {
                Authorization: user ? `Bearer ${user.token}` : ''
            }
        });

        // 🚨 Interceptor logic cho Refresh Token (Nếu cần)
        
        return instance;
        
    }, [user?.token]); // Chỉ phụ thuộc vào token

    return authAxios;
};