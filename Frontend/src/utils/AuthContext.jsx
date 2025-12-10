// src/utils/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from 'axios'; 

const AuthContext = createContext({
    user: null, 
    login: () => {}, 
    logout: () => {}, 
    updateToken: (newToken, newExpiry, newRole, newEmail, newTenTaiKhoan) => {}, 
    loading: true,
});

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 
const BASE_URL = VITE_BACKEND_URL; 

const getUserFromLocalStorage = () => {
    const token = localStorage.getItem("token"); 
    const role = localStorage.getItem("role"); 
    const email = localStorage.getItem("email"); 
    const exp = localStorage.getItem("exp"); 
    const tenTaiKhoan = localStorage.getItem("tenTaiKhoan"); 

    if (token && role && email && exp) {
        return { 
            token, 
            role, 
            email: email, 
            exp: exp,
            TenTaiKhoan: tenTaiKhoan || email 
        }; 
    }
    
    return null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = useCallback(() => {
        setUser(getUserFromLocalStorage());
    }, []);

    const updateToken = useCallback((newToken, newExpiry, newRole, newEmail, newTenTaiKhoan = null) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('exp', newExpiry);
        localStorage.setItem('role', newRole);
        localStorage.setItem('email', newEmail);
        if (newTenTaiKhoan) {
            localStorage.setItem('tenTaiKhoan', newTenTaiKhoan);
        }

        setUser({
            token: newToken,
            role: newRole,
            email: newEmail,
            exp: newExpiry,
            TenTaiKhoan: newTenTaiKhoan || newEmail,
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.clear();
        setUser(null); 
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
    }), [user, logout, login, loading, updateToken]);

    return (
        <AuthContext.Provider value={value}> 
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const useAuthAxios = () => {
    const { user } = useAuth(); 

    const authAxios = useMemo(() => {
        const instance = axios.create({
            baseURL: BASE_URL, 
            headers: {
                Authorization: user ? `Bearer ${user.token}` : ''
            }
        });

        // Interceptor logic cho Refresh Token có thể được thêm ở đây

        return instance;
        
    }, [user?.token]);

    return authAxios;
};