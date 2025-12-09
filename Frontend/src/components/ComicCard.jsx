import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { FavoriteContext } from "./FavoriteContext";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getPlaceholderUrl = (title) => {
    const shortTitle = title ? title.split(' ').slice(0, 4).join(' ') : 'Truyen';
    return `https://placehold.co/180x240/1f2937/ffffff?text=${encodeURIComponent(shortTitle)}`;
};

function ComicCard({ comic, isDarkMode = false }) {
    const { isFavorite, addFavorite, removeFavorite, loading: favoritesLoading } = useContext(FavoriteContext);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!comic || !comic.TID) return null;

    const TID = comic.TID;
    const isCurrentlyFavorite = isFavorite(TID);
    const isDisabled = favoritesLoading || isUpdating;

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDisabled) return;
        setIsUpdating(true);
        try {
            if (isCurrentlyFavorite) await removeFavorite(TID);
            else await addFavorite(TID);
        } catch (error) {
            console.error(error);
            alert('Thao tác Yêu thích thất bại');
        } finally {
            setIsUpdating(false);
        }
    };

    const statusText = comic.TrangThai === 1 ? 'Còn tiếp' : 'Hoàn thành';
    const statusColor = comic.TrangThai === 1 ? 'bg-red-600' : 'bg-blue-600';
    const coverImageUrl = `${VITE_BACKEND_URL}/assets/covers/${comic.AnhBia || 'default.jpg'}`;
    const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
    const titleTextColor = isDarkMode ? 'text-white' : 'text-gray-800';

    return (
        <Link to={`/story/${TID}`} className="group block h-full">
            <div className={`rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border h-full flex flex-col ${cardBgClass}`}>
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <img
                        src={coverImageUrl}
                        alt={comic.TenTruyen}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = getPlaceholderUrl(comic.TenTruyen); }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold text-white rounded-full ${statusColor} shadow-lg z-10 uppercase tracking-wider`}>{statusText}</div>
                    <button
                        onClick={handleFavoriteClick}
                        disabled={isDisabled}
                        className={`absolute top-2 right-2 p-2 rounded-full shadow-lg z-10 transition-colors duration-200 
                            ${isCurrentlyFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-500 hover:text-red-500'}
                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isCurrentlyFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                        <FaHeart className={`w-4 h-4 ${isUpdating ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
                <div className="p-3 flex-grow flex items-center justify-center text-center">
                    <h3 className={`text-base font-bold line-clamp-2 group-hover:text-red-600 transition-colors ${titleTextColor}`} title={comic.TenTruyen}>{comic.TenTruyen}</h3>
                </div>
            </div>
        </Link>
    );
}

export default ComicCard;