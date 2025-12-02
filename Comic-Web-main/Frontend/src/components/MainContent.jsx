import React from 'react';
import ComicCard from './ComicCard.jsx'; // Import ComicCard đã tách ra

// Giả định cấu trúc data của comics (sử dụng lại DUMMY_COMICS từ App.jsx)
// Lưu ý: Trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ API hoặc state của component cha (App.jsx)
const DUMMY_COMICS = [
    { TID: 1, TenTruyen: "Đại Thần Trở Lại", TrangThai: 1, AnhBia: "placeholder1.jpg", chuongTruyens: [{ TenChuongTruyen: "Chapter 120" }], LuotXem: "98.5K" },
    { TID: 2, TenTruyen: "Thần Y Trùng Sinh", TrangThai: 1, AnhBia: "placeholder2.jpg", chuongTruyens: [{ TenChuongTruyen: "Chapter 55" }], LuotXem: "72.1K" },
    { TID: 3, TenTruyen: "Võ Luyện Đỉnh Phong", TrangThai: 2, AnhBia: "placeholder3.jpg", chuongTruyens: [{ TenChuongTruyen: "Chapter 3000+" }], LuotXem: "150K" },
    { TID: 4, TenTruyen: "One Piece", TrangThai: 1, AnhBia: "placeholder4.jpg", chuongTruyens: [{ TenChuongTruyen: "Chapter 1100" }], LuotXem: "210K" },
    { TID: 5, TenTruyen: "Đấu Phá Thương Khung", TrangThai: 2, AnhBia: "placeholder5.jpg", chuongTruyens: [{ TenChuongTruyen: "Chapter 1600" }], LuotXem: "180K" },
];


/**
 * MainContent Component (Nội dung chính của trang chủ, hiển thị danh sách truyện)
 * @param {object} props - Props của component
 * @param {array} [props.comics=DUMMY_COMICS] - Danh sách các đối tượng truyện
 * @param {boolean} props.isDarkMode - Trạng thái chế độ tối
 */
const MainContent = ({ comics = DUMMY_COMICS, isDarkMode }) => {
    
    // Nếu dữ liệu comics được truyền từ App.jsx xuống, ta sẽ dùng nó. 
    // Nếu không, dùng DUMMY_COMICS để đảm bảo hiển thị.
    const currentComics = comics.length > 0 ? comics : DUMMY_COMICS;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <h2 className={`text-3xl font-extrabold mb-8 border-b-2 border-red-600 pb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-red-600">Truyện</span> Mới Cập Nhật
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {currentComics.map((comic) => (
                    <ComicCard
                        key={comic.TID}
                        comic={comic} // CHỈ CẦN TRUYỀN ĐỐI TƯỢNG 'comic' DUY NHẤT
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>
            {/* Phân Trang */}
            <div className="flex justify-center mt-12">
                <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-150 mx-1">1</button>
                <button className={`px-4 py-2 font-semibold rounded-lg shadow-lg transition duration-150 mx-1 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>2</button>
                <button className={`px-4 py-2 font-semibold rounded-lg shadow-lg transition duration-150 mx-1 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>&gt;</button>
            </div>
        </main>
    );
};

export default MainContent;