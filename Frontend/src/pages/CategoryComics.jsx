import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ComicCard from '../components/ComicCard';
import Pagination from '../components/Pagination';
import { FaBookmark, FaHashtag, FaExclamationCircle } from 'react-icons/fa';
import { get } from '../utils/request';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
            let response = null;
            if (localStorage.getItem('role') === 'NguoiDung' && localStorage.getItem('token')) {
                response = await get(`${VITE_BACKEND_URL}/truyen/truyenTheoTheLoai?TLID=${TLID}&page=${page}`, false, true);
            } else {
                response = await get(`${VITE_BACKEND_URL}/truyen/truyenTheoTheLoai?TLID=${TLID}&page=${page}`);
            }
            let data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            setComics(data.truyens);
            setCurrentPage(data.trangHienTai);
            setMaxPages(data.trangToiDa);
            setCategoryName(data.theLoai.TenTheLoai);
        } catch (err) {
            console.error("Lỗi tải truyện theo thể loại:", err);
            setError("Không thể tải truyện theo thể loại này.");
        } finally {
            setLoading(false);
        }
    }, [TLID]);

    useEffect(() => {
        setCurrentPage(1);
        fetchCategoryComics(1);
    }, [TLID, fetchCategoryComics]);

    useEffect(() => {
        if (currentPage !== 1) {
            fetchCategoryComics(currentPage);
        }
    }, [currentPage, fetchCategoryComics]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xl transition-colors duration-300">
            <div className="animate-pulse">Đang tải truyện thể loại "{categoryName || '...'}"...</div>
        </div>
    );

    if (error) return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-600 transition-colors duration-300">
            <FaExclamationCircle className="mr-2 text-2xl" /> {error}
        </div>
    );

    return (
        /* SỬA: w-full px-10 và dark:bg-gray-900 để tràn viền và đổi màu nền */
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">

            {/* Tiêu đề Trang: Hỗ trợ Dark Mode */}
            <div className="flex items-center mb-8 pb-3 border-b-4 border-red-600">
                <FaBookmark className="text-4xl text-red-600 mr-3" />
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                    Truyện thuộc Thể loại:
                    <span className="ml-2 text-red-600">"{categoryName}"</span>
                </h1>
                <span className="ml-4 text-gray-500 dark:text-gray-400 text-xl font-bold">({comics.length} Truyện)</span>
            </div>

            {comics.length === 0 && !loading ? (
                <div className="text-center text-gray-500 dark:text-gray-400 p-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                    <FaHashtag className="text-5xl mx-auto mb-4 text-red-300 dark:text-red-900" />
                    <p className="text-xl font-medium">Không tìm thấy truyện nào thuộc thể loại "{categoryName}" lúc này.</p>
                </div>
            ) : (
                <>
                    {/* SỬA: Thêm 2xl:grid-cols-8 để tối ưu màn hình cực rộng */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 
                                    sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                        {comics.map(comic => (
                            <ComicCard key={comic.TID} comic={comic} />
                        ))}
                    </div>

                    {/* Phân trang */}
                    <div className="mt-16 flex justify-center pb-10">
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