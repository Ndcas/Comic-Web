import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
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

// --- HOOKS EXPORT ---
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favoriteTIDs, setFavoriteTIDs] = useState(new Set());

    const authAxios = useAuthAxios();

    // --- LOGIC AUTH CƠ BẢN ---
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
        setFavoriteTIDs(new Set());
    }, []);

    // --- LOGIC YÊU THÍCH ---

    const fetchFavorites = useCallback(async () => {
        if (!user || !user.token) {
            setFavoriteTIDs(new Set());
            return;
        }

        try {
            const response = await authAxios.get(`${USER_API_PREFIX}/danhSachYeuThich`);

            console.log("Dữ liệu Yêu thích từ Server:", response.data);

            let favoriteData = response.data.truyens || response.data.danhSachYeuThich;

            if (!Array.isArray(favoriteData) && Array.isArray(response.data)) {
                favoriteData = response.data;
            }

            if (Array.isArray(favoriteData)) {
                const TIDs = favoriteData.map(item => parseInt(item.TID));
                setFavoriteTIDs(new Set(TIDs));
            } else {
                setFavoriteTIDs(new Set());
            }

        } catch (error) {
            console.error("Lỗi khi tải danh sách yêu thích:", error);
            setFavoriteTIDs(new Set());
        }
    }, [user, authAxios]);

    const isFavorite = useCallback((TID) => {
        return favoriteTIDs.has(parseInt(TID));
    }, [favoriteTIDs]);

    const toggleFavorite = useCallback(async (TID) => {
        const tidNumber = parseInt(TID);

        if (!user) {
            alert("Vui lòng đăng nhập để thực hiện chức năng Yêu thích.");
            return false;
        }

        const isCurrentlyFavorite = isFavorite(tidNumber);

        const actionUrl = isCurrentlyFavorite
            ? `${USER_API_PREFIX}/xoaKhoiDanhSachYeuThich`
            : `${USER_API_PREFIX}/themVaoDanhSachYeuThich`;

        try {
            const response = await authAxios.post(actionUrl, { TID: tidNumber });

            if (response.status === 200 || response.status === 201) {

                // Cập nhật state Frontend ngay lập tức
                setFavoriteTIDs(prev => {
                    const newSet = new Set(prev);
                    if (isCurrentlyFavorite) {
                        newSet.delete(tidNumber);
                    } else {
                        newSet.add(tidNumber);
                    }
                    return newSet;
                });
                // Sau khi thành công, nên gọi lại fetchFavorites nếu cần đồng bộ hóa toàn bộ
                // fetchFavorites();
                return true;
            } else {
                throw new Error(response.data.error || "Lỗi Server khi cập nhật yêu thích.");
            }

        } catch (error) {
            console.error("Lỗi khi toggleFavorite:", error);

            // CẢI THIỆN XỬ LÝ LỖI 400
            let errorMessage = `Thao tác ${isCurrentlyFavorite ? 'bỏ' : 'thêm'} yêu thích thất bại.`;

            if (error.response && error.response.status === 400) {
                // Lấy thông báo lỗi chi tiết từ Backend
                const backendError = error.response.data.error || error.response.data.message || 'Dữ liệu yêu cầu không hợp lệ.';
                errorMessage = `${errorMessage} Chi tiết: ${backendError}`;
            } else {
                errorMessage = `${errorMessage} Vui lòng kiểm tra console.`;
            }

            alert(errorMessage);
            return false;
        }
    }, [user, isFavorite, authAxios]);


    // --- EFFECTS ---

    useEffect(() => {
        const currentUser = getUserFromLocalStorage();
        setUser(currentUser);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavoriteTIDs(new Set());
        }
    }, [user, fetchFavorites]);


    // --- MEMOIZED VALUE ---
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

// --- LOGIC INTERCEPTOR (Giữ nguyên) ---

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

    const authAxiosRef = useRef(null);

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