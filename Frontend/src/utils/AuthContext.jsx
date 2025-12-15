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

const isTokenExpired = (exp) => {
    if (!exp) return true;
    const expiryTime = parseInt(exp) * 1000;
    const now = Date.now();
    return (expiryTime - now) < (5 * 60 * 1000); 
};

const getUserFromLocalStorage = () => {
    const token = localStorage.getItem("token"); 
    const role = localStorage.getItem("role"); 
    const email = localStorage.getItem("email"); 
    const exp = localStorage.getItem("exp"); 
    const tenTaiKhoan = localStorage.getItem("tenTaiKhoan"); 

    if (token && role && email && exp && !isTokenExpired(exp)) { 
        return { 
            token, 
            role, 
            email: email, 
            exp: exp,
            TenTaiKhoan: tenTaiKhoan || email 
        }; 
    }
    
    if (token && isTokenExpired(exp)) {
        console.log("Token đã hết hạn. Đang xóa token cũ.");
        localStorage.clear();
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
        } else {
            localStorage.removeItem('tenTaiKhoan');
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

    const isFavorite = useCallback((TID) => {
        if (!user) return false;
        return false;
    }, [user]);

    const toggleFavorite = useCallback((TID) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thực hiện chức năng Yêu thích.");
            return;
        }
    }, [user]);

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
        isFavorite,
        toggleFavorite,
    }), [user, logout, login, loading, updateToken, isFavorite, toggleFavorite]);

    return (
        <AuthContext.Provider value={value}> 
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 

let isRefreshing = false; 
let failedRequestsQueue = [];

const axiosRefreshRequest = async () => {
    try {
        const refreshToken = localStorage.getItem('token'); 

        const response = await axios.post(`${BASE_URL}/admin/refresh_token`, {}, {
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });
        
        return response.data; 

    } catch (err) {
        console.error("Lỗi khi làm mới token:", err);
        throw err;
    }
}

export const useAuthAxios = () => {
    const { user, logout, updateToken } = useAuth(); 
    
    const authAxiosRef = React.useRef(null);

    if (!authAxiosRef.current) {
        authAxiosRef.current = axios.create({
            baseURL: BASE_URL, 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        authAxiosRef.current.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token && !config.url.endsWith('/admin/refresh_token')) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        authAxiosRef.current.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true; 

                    if (!isRefreshing) {
                        isRefreshing = true;
                        
                        try {
                            const refreshData = await axiosRefreshRequest();
                            
                            updateToken(
                                refreshData.token, 
                                refreshData.exp, 
                                user.role, 
                                user.email, 
                                user.TenTaiKhoan
                            );

                            failedRequestsQueue.forEach(promise => promise.resolve(refreshData.token));
                            failedRequestsQueue = []; 

                            originalRequest.headers['Authorization'] = `Bearer ${refreshData.token}`;
                            return authAxiosRef.current(originalRequest);
                            
                        } catch (refreshError) {
                            logout(); 
                            return Promise.reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    }

                    return new Promise((resolve, reject) => {
                        failedRequestsQueue.push({
                            resolve: (token) => {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                resolve(authAxiosRef.current(originalRequest));
                            },
                            reject: (err) => reject(err)
                        });
                    });
                }

                return Promise.reject(error);
            }
        );
    }
    
    return authAxiosRef.current;
};