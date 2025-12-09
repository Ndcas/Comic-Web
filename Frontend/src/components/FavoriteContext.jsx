import React, { createContext, useState, useEffect, useCallback } from 'react';
import { layDanhSachYeuThich, themVaoDanhSachYeuThich, xoaKhoiDanhSachYeuThich } from '../utils/nguoiDungApi';

const FavoriteContext = createContext();

const FavoriteProvider = ({ children }) => {
    const [favoriteList, setFavoriteList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setFavoriteList([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await layDanhSachYeuThich(token);
            const list = (data.truyens || []).map(item => ({ TID: item.TID }));
            setFavoriteList(list);
        } catch (err) {
            console.error("Lỗi khi tải danh sách yêu thích:", err);
            setFavoriteList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const addFavorite = async (TID) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Người dùng chưa đăng nhập.");
        try {
            await themVaoDanhSachYeuThich(token, TID);
            setFavoriteList(prev => (!prev.some(story => story.TID === TID) ? [...prev, { TID }] : prev));
        } catch (err) {
            console.error("Lỗi thêm vào yêu thích:", err);
            throw err;
        }
    };

    const removeFavorite = async (TID) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Người dùng chưa đăng nhập.");
        try {
            await xoaKhoiDanhSachYeuThich(token, TID);
            setFavoriteList(prev => prev.filter(story => story.TID !== TID));
        } catch (err) {
            console.error("Lỗi xóa yêu thích:", err);
            throw err;
        }
    };

    const isFavorite = useCallback((TID) => {
        if (loading) return false;
        return favoriteList.some(story => story.TID === TID);
    }, [favoriteList, loading]);

    return (
        <FavoriteContext.Provider value={{
            favoriteList,
            loading,
            addFavorite,
            removeFavorite,
            isFavorite,
            fetchFavorites
        }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export { FavoriteContext, FavoriteProvider };
