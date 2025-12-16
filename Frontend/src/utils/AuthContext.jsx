import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from 'axios';

const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    updateToken: () => {},
    loading: true,
    isFavorite: () => false,
    toggleFavorite: () => {},
});

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = VITE_BACKEND_URL;
const USER_API_PREFIX = '/nguoiDung';

const isTokenExpired = (exp) => {
    if (!exp) return true;
    const expiryTime = parseInt(exp) * 1000;
    return (expiryTime - Date.now()) < (1 * 60 * 1000);
};

const getUserFromLocalStorage = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const exp = localStorage.getItem("exp");
    const tenTaiKhoan = localStorage.getItem("tenTaiKhoan");

    if (token && role && !isTokenExpired(exp)) {
        return { token, role, email, exp, TenTaiKhoan: tenTaiKhoan || email };
    }
    return null;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favoriteTIDs, setFavoriteTIDs] = useState(new Set());

    const logout = useCallback(() => {
        const currentRole = localStorage.getItem("role");
        localStorage.clear();
        setUser(null);
        setFavoriteTIDs(new Set());
        
        if (currentRole?.toUpperCase() === 'ADMIN') {
            window.location.href = '/admin/login';
        } else {
            window.location.href = '/login';
        }
    }, []);

    const authAxios = useMemo(() => {
        const instance = axios.create({
            baseURL: BASE_URL,
            headers: { 'Content-Type': 'application/json' }
        });

        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        });

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config.url.includes('danhSachYeuThich')) {
                    logout();
                }
                return Promise.reject(error);
            }
        );
        return instance;
    }, [logout]);

    const login = useCallback(() => {
        setUser(getUserFromLocalStorage());
    }, []);

    const updateToken = useCallback((newToken, newExpiry, newRole, newEmail, newTenTaiKhoan = null) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('exp', newExpiry);
        localStorage.setItem('role', newRole);
        localStorage.setItem('email', newEmail);
        if (newTenTaiKhoan) localStorage.setItem('tenTaiKhoan', newTenTaiKhoan);

        setUser({
            token: newToken,
            role: newRole,
            email: newEmail,
            exp: newExpiry,
            TenTaiKhoan: newTenTaiKhoan || newEmail,
        });
    }, []);

    const fetchFavorites = useCallback(async () => {
        if (!user || !user.token || user.role?.toUpperCase() === 'ADMIN') {
            return;
        }

        try {
            const response = await authAxios.get(`${USER_API_PREFIX}/danhSachYeuThich`);
            let favoriteData = response.data.truyens || response.data.danhSachYeuThich || response.data;
            if (Array.isArray(favoriteData)) {
                const TIDs = favoriteData.map(item => parseInt(item.TID));
                setFavoriteTIDs(new Set(TIDs));
            }
        } catch (error) {
            console.warn("Bỏ qua lỗi fetch yêu thích cho Admin.");
        }
    }, [user, authAxios]);

    const isFavorite = useCallback((TID) => favoriteTIDs.has(parseInt(TID)), [favoriteTIDs]);

    const toggleFavorite = useCallback(async (TID) => {
        if (!user) return alert("Vui lòng đăng nhập.");
        if (user.role?.toUpperCase() === 'ADMIN') return;
        
        const tidNumber = parseInt(TID);
        try {
            const response = await authAxios.post(`${USER_API_PREFIX}/themVaoDanhSachYeuThich`, { TID: tidNumber });
            if (response.status === 200 || response.status === 201) {
                setFavoriteTIDs(prev => new Set(prev).add(tidNumber));
                return true;
            }
        } catch (error) {
            return false;
        }
    }, [user, authAxios]);

    useEffect(() => {
        setUser(getUserFromLocalStorage());
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) fetchFavorites();
    }, [user, fetchFavorites]);

    const value = useMemo(() => ({
        user, logout, login, loading, updateToken, isFavorite, toggleFavorite, authAxios
    }), [user, logout, login, loading, updateToken, isFavorite, toggleFavorite, authAxios]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuthAxios = () => {
    const { authAxios } = useAuth();
    return authAxios;
};