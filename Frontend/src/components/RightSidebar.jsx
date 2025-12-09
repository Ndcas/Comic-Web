import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component Cột Phải (RightSidebar)
 * Hiển thị danh sách các thể loại truyện.
 */
const RightSidebar = () => {
    // Dữ liệu thể loại được cập nhật theo yêu cầu của người dùng
    const genres = [
        "Bi kịch", "Comics", "Giả tưởng", "Hài hước",
        "Hành động", "Học đường", "Isekai", "Khoa học viễn tưởng",
        "Kinh dị", "Lịch sử", "Manga", "Manhua",
        "Manhwa", "Mecha", "Phiêu lưu", "Thể thao",
        "Tình cảm", "Trinh thám", "Đời thường"
    ];

    return (
        <div className="sticky top-20">
            {/* Khu vực Thể Loại Truyện */}
            <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 text-red-600">THỂ LOẠI TRUYỆN</h3>
                {/* Sử dụng bố cục 1 cột trên màn hình nhỏ, và 2 cột trên màn hình lớn */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-2">
                    {genres.map((genre, index) => (
                        <Link 
                            key={index} 
                            to={`/genre/${genre}`} 
                            className="text-sm text-gray-600 hover:text-red-600 transition truncate hover:underline"
                        >
                            {genre}
                        </Link>
                    ))}
                </div>
            </div>
            {/* Có thể thêm quảng cáo hoặc thông tin khác ở đây */}
        </div>
    );
};

export default RightSidebar;