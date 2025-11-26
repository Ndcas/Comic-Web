import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ComicCard from '../components/ComicCard';
import Pagination from '../components/Pagination';
import { FaBookmark, FaHashtag, FaExclamationCircle } from 'react-icons/fa';


const API_BASE_URL = 'http://localhost:8080/truyen';

function CategoryComics() {
    const { TLID } = useParams();

    const [categoryName, setCategoryName] = useState('');
    const [comics, setComics] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPages, setMaxPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategoryComics = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            // Giả định API trả về cả tên thể loại, danh sách truyện và phân trang
            // Endpoint ví dụ: /truyenTheoTheLoai?TLID=1&page=1
            const response = await axios.get(`${API_BASE_URL}/truyenTheoTheLoai?TLID=${TLID}&page=${page}`);

            const data = response.data.data || response.data; // Cấu trúc dữ liệu trả về

            // Điều chỉnh cách đọc dữ liệu:
            setCategoryName(data.TenTheLoai || 'Thể loại không tên');
            setComics(data.truyens || []);
            setCurrentPage(data.trangHienTai || page);
            setMaxPages(data.trangToiDa || 1);

        } catch (err) {
            console.error("Lỗi tải truyện theo thể loại:", err);
            setError("Không thể tải truyện theo thể loại này.");
        } finally {
            setLoading(false);
        }
    }, [TLID]);

    useEffect(() => {
        // Tải trang 1 khi TLID thay đổi
        setCurrentPage(1);
        fetchCategoryComics(1);
    }, [TLID, fetchCategoryComics]);

    useEffect(() => {
        // Tải dữ liệu khi trang thay đổi (sau khi TLID đã load)
        if (currentPage !== 1) {
            fetchCategoryComics(currentPage);
        }
    }, [currentPage, fetchCategoryComics]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
    };

    if (loading) return <div className="text-center p-8 text-xl">Đang tải truyện thể loại "{categoryName || '...'}"...</div>;
    if (error) return <div className="text-center p-8 text-xl text-red-600 flex items-center justify-center"><FaExclamationCircle className="mr-2" /> {error}</div>;

    return (
        <div className="container mx-auto p-4 max-w-7xl">

            {/* Tiêu đề Trang: Phong cách nổi bật */}
            <div className="flex items-center mb-6 pb-2 border-b-4 border-red-600">
                <FaBookmark className="text-4xl text-red-600 mr-3" />
                <h1 className="text-3xl font-extrabold text-gray-800">
                    Truyện thuộc Thể loại:
                    <span className="ml-2 text-red-600">"{categoryName}"</span>
                </h1>
                <span className="ml-4 text-gray-500 text-xl font-bold">({comics.length} Truyện)</span>
            </div>

            {comics.length === 0 && !loading ? (
                <div className="text-center text-gray-500 p-10 border rounded-lg">
                    <FaHashtag className="text-4xl mx-auto mb-3 text-red-300" />
                    <p className="text-lg">Không tìm thấy truyện nào thuộc thể loại "{categoryName}" lúc này.</p>
                </div>
            ) : (
                <>
                    {/* Danh sách truyện: Bố cục Grid Responsive (Đã dùng ở Home.jsx) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 
                                    sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {comics.map(comic => (
                            // Sử dụng ComicCard đã được nâng cấp
                            <ComicCard key={comic.TID} comic={comic} />
                        ))}
                    </div>

                    {/* Phân trang */}
                    <div className="mt-10 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            maxPages={maxPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default CategoryComics;