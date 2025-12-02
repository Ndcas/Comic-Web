// /src/pages/StoryDetailPage.jsx

import React, { useContext } from 'react';
import { FavoriteContext } from '../contexts/FavoriteContext';
import { FaHeart } from 'react-icons/fa';

// Giả định component này nhận TID qua props hoặc URL params
export default function StoryDetailPage({ storyId }) { 
    // Giả định storyId là TID của truyện hiện tại
    const TID = storyId || 123; 
    
    // Sử dụng Context
    const { 
        isFavorite, 
        addFavorite, 
        removeFavorite, 
        loading: favoritesLoading 
    } = useContext(FavoriteContext);

    // 1. Kiểm tra trạng thái hiện tại
    const isCurrentlyFavorite = isFavorite(TID);
    const [isUpdating, setIsUpdating] = React.useState(false);

    // 2. Xử lý logic click
    const handleFavoriteClick = async () => {
        if (favoritesLoading || isUpdating) return; // Ngăn double click
        
        setIsUpdating(true);
        try {
            if (isCurrentlyFavorite) {
                await removeFavorite(TID);
                alert('Đã xóa khỏi danh sách yêu thích.');
            } else {
                // Backend sẽ xử lý việc tìm kiếm và tạo bản ghi
                await addFavorite(TID); 
                alert('Đã thêm vào danh sách yêu thích!');
            }
        } catch (error) {
            console.error('Lỗi thao tác yêu thích:', error);
            alert('Thao tác thất bại: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setIsUpdating(false);
        }
    };
    
    // --- Render Nút Yêu Thích ---
    
    // Hiển thị nút nếu TID hợp lệ và không bị lỗi
    const buttonText = isUpdating 
        ? (isCurrentlyFavorite ? 'Đang xóa...' : 'Đang thêm...')
        : (isCurrentlyFavorite ? 'Đã Yêu Thích' : 'Yêu Thích');

    return (
        <div className="story-details">
            <h2>Chi tiết truyện #{TID}</h2>
            {/* ... Nội dung truyện khác ... */}
            
            <button
                onClick={handleFavoriteClick}
                disabled={favoritesLoading || isUpdating}
                className={`flex items-center px-4 py-2 rounded-lg text-white font-bold transition duration-200 
                    ${isCurrentlyFavorite 
                        ? 'bg-red-500 hover:bg-red-600' // Đã thích
                        : 'bg-gray-500 hover:bg-gray-600' // Chưa thích
                    }
                    ${(favoritesLoading || isUpdating) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <FaHeart className="mr-2" />
                {buttonText}
            </button>
            
            {/* ... Phần còn lại của trang chi tiết ... */}
        </div>
    );
}