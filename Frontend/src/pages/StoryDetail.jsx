import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { get } from '../utils/request';
import ChapterListDisplay from '../components/ChapterListDisplay';
import CommentSection from '../components/CommentSection'; 


const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const getAccessToken = () => localStorage.getItem('token'); 


const IconBookOpen = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M384 128H192c-17.67 0-32 14.33-32 32v224c0 17.67 14.33 32 32 32h192c17.67 0 32-14.33 32-32V160c0-17.67-14.33-32-32-32zM576 160v224c0 44.18-35.82 80-80 80h-64V96h64c44.18 0 80 35.82 80 80zM0 160c0-44.18 35.82-80 80-80h64v352H80c-44.18 0-80-35.82-80-80V160z"/></svg>
);
const IconUserEdit = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4zm219.7 151.7l-7.7 5.1c-15.5 10.3-35.7 7-47.4-8.7L392 368 288 472l-1.3 1.3c-2.2 2.2-4.2 4.4-6.4 6.5-6.8 6.8-15.4 11.2-24.8 12.8-5.3.8-10.6 1.3-16 1.3-19 0-36.5-6.8-50.4-19.1l-.8-.8-152-152c-1.3-1.3-2.6-2.5-3.8-3.7-2.7-2.7-5.1-5.7-7.3-8.8-1.5-2-2.9-4.1-4.2-6.2-1.3-2.1-2.5-4.2-3.6-6.4-1.3-2.3-2.5-4.6-3.6-7-.8-2-.8-4.1-.8-6.1V368l80-80 57.4 57.4-4.2 4.2c-4.1 4.1-6.4 9.3-6.4 14.8V424c0 6.6 5.4 12 12 12h41.6c6.6 0 12-5.4 12-12v-65.7c0-5.5-2.3-10.7-6.4-14.8l-4.2-4.2L424 392l80 80c3.9 3.9 10.2 3.9 14.1 0l7.7-7.7c15.7-15.5 19.3-38.8 8.7-54.3z"/></svg>
);
const IconTag = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M0 160l256 256L512 160H0zm256 128L64 160h384L256 288z"/></svg>
);
const IconRunning = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm9.6 32h-19.2c-2.4 0-4.6-.7-6.7-1.7-22.2 10.2-46.9 16-72.9 16-26 0-50.7-5.8-72.9-16-2.1 1-4.3 1.7-6.7 1.7H96c-53 0-96 43-96 96v80c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16v-80c0-53-43-96-96-96z"/></svg>
);
const IconHeart = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 192c-25.1-23.7-58.8-37-93.5-37-34.7 0-68.4 13.3-93.5 37l-4.3 4.1L256 257.6l-2.9-2.7-4.3-4.1C221.7 168.3 188 155 153.3 155c-34.7 0-68.4 13.3-93.5 37-25.1 23.7-39.3 56.4-39.3 93.1 0 36.7 14.2 69.4 39.3 93.1l199.1 187.9c4.8 4.6 11.2 7.1 18.2 7.1s13.4-2.5 18.2-7.1l199.1-187.9c25.1-23.7 39.3-56.4 39.3-93.1 0-36.7-14.2-69.4-39.3-93.1z"/></svg>
);
const IconArrowRight = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M190.5 66.9l-22.2 22.2c-4.7 4.7-4.7 12.3 0 17l163.7 163.7H32c-6.6 0-12 5.4-12 12v32c0 6.6 5.4 12 12 12h300v-14.8l-163.7 163.7c-4.7 4.7-4.7 12.3 0 17l22.2 22.2c4.7 4.7 12.3 4.7 17 0l210.6-210.6c4.7-4.7 4.7-12.3 0-17L207.5 66.9c-4.7-4.7-12.3-4.7-17 0z"/></svg>
);
const IconCompressAlt = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M98.7 137.9L22.4 214.2c-15.6 15.6-15.6 40.9 0 56.6l22.2 22.2c15.6 15.6 40.9 15.6 56.6 0l58.1-58.1-1.4-1.4c-15.6-15.6-15.6-40.9 0-56.6l22.2-22.2c15.6-15.6 40.9-15.6 56.6 0l58.1 58.1-1.4-1.4c-15.6-15.6-15.6-40.9 0-56.6l22.2-22.2c15.6-15.6 40.9-15.6 56.6 0l58.1 58.1 22.2-22.2c15.6-15.6 40.9-15.6 56.6 0l22.2 22.2c15.6 15.6 15.6 40.9 0 56.6l-76.3 76.3-1.4-1.4c-15.6-15.6-40.9-15.6-56.6 0l-58.1 58.1-22.2-22.2c-15.6-15.6-40.9-15.6-56.6 0l-58.1 58.1-1.4-1.4c-15.6-15.6-40.9-15.6 0-56.6l-22.2-22.2c-15.6-15.6-15.6-40.9 0-56.6l76.3-76.3z"/></svg>
);
const IconWarning = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M569.5 447.1L405.7 68.3C397.7 54.2 382.7 45 366.1 45H209.9c-16.6 0-31.6 9.2-39.6 23.3L6.5 447.1C-1.5 461.2 3.5 478 17.5 489.2 31.5 500.4 49 507 66.5 507H509.5c17.5 0 35-6.6 49-17.8 14-11.2 19-28 11-42.1zM288 432c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm0-96c-17.6 0-32-14.4-32-32V176c0-17.6 14.4-32 32-32s32 14.4 32 32v128c0 17.6-14.4 32-32 32z"/></svg>
);


function StoryDetail() {
    const { TID } = useParams();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [summary, setSummary] = useState(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState(null);
    
    const handleTomTatTruyen = async () => {
        setIsSummaryLoading(true);
        setSummaryError(null);
        setSummary(null);

        try {
            const response = await axios.get(`${VITE_BACKEND_URL}/truyen/tomTatTruyen?TID=${TID}`);
            
            if (response.data && response.data.summary) {
                setSummary(response.data.summary);
            } else {
                setSummaryError('Phản hồi API không có dữ liệu tóm tắt hợp lệ.');
            }
        } catch (err) {
            console.error("Lỗi khi gọi API Tóm tắt truyện:", err);
            const errorMessage = err.response?.data?.error || 'Lỗi không xác định khi tóm tắt truyện.';
            setSummaryError(errorMessage);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const fetchStoryDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let truyenResponse = null;
            let chuongTruyenResponse = null;
            const isUserLoggedIn = !!getAccessToken(); 
            
            if (isUserLoggedIn) {
                truyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinTruyen?TID=${TID}`, false, true);
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`, false, true); 
            } else {
                truyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinTruyen?TID=${TID}`);
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`);
            }

            let dataTruyen = await truyenResponse.json();
            if (!truyenResponse.ok) {
                throw new Error(dataTruyen.error);
            }
            
            let dataChuongTruyen = await chuongTruyenResponse.json();
            if (!chuongTruyenResponse.ok) {
                throw new Error(dataChuongTruyen.error);
            }

            setStory(dataTruyen.truyen);
            setChapters(dataChuongTruyen.chuongTruyens); 
            
        } catch (err) {
            console.error("Lỗi tải chi tiết truyện:", err);
            setError(err.message || "Không thể tải chi tiết truyện. Vui lòng kiểm tra ID hoặc kết nối Backend.");
        } finally {
            setLoading(false);
        }
    }, [TID]);

    useEffect(() => {
        fetchStoryDetail();
    }, [fetchStoryDetail]);

    if (loading) return <div className="text-center p-8 text-xl">Đang tải chi tiết truyện...</div>;
    if (error) return <div className="text-center p-8 text-xl text-red-600 flex items-center justify-center"><IconWarning className="w-5 h-5 mr-2" /> {error}</div>;
    if (!story) return <div className="text-center p-8 text-gray-500">Truyện không tồn tại.</div>;

    const firstChapter = chapters.length > 0 ? chapters[0] : null;
    const latestChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

    return (
        <div className="container mx-auto p-4 max-w-7xl">

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                {story.TenTruyen}
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">

                <div className="w-full lg:w-1/3 flex flex-col items-center lg:sticky lg:top-4 h-full">

                    <div className="w-2/3 sm:w-1/2 lg:w-full aspect-[3/4] rounded-lg shadow-xl overflow-hidden mb-5 border-4 border-gray-200">
                        <img
                            src={`${VITE_BACKEND_URL}/assets/covers/${story.AnhBia || 'default.jpg'}`}
                            alt={story.TenTruyen}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="w-full sm:w-1/2 lg:w-full flex flex-col gap-3">
                        {firstChapter && (
                            <Link
                                to={`/read/${story.TID}/${firstChapter.CTID}`}
                                className="w-full py-3 bg-red-600 text-white font-bold text-lg 
                                            rounded-full flex items-center justify-center 
                                            hover:bg-red-700 transition-colors shadow-lg">
                                <IconBookOpen className="w-4 h-4 mr-2" /> Đọc Từ Chương Đầu
                            </Link>
                        )}
                        {latestChapter && (
                            <Link
                                to={`/read/${story.TID}/${latestChapter.CTID}`}
                                className="w-full py-3 bg-gray-200 text-gray-800 font-bold text-lg 
                                            rounded-full flex items-center justify-center 
                                            hover:bg-gray-300 transition-colors border border-gray-300">
                                <IconArrowRight className="w-4 h-4 mr-2" /> Chương Mới Nhất
                            </Link>
                        )}
                        
                        <button
                            onClick={handleTomTatTruyen}
                            disabled={isSummaryLoading}
                            className={`w-full py-3 text-white font-bold text-lg rounded-full flex items-center justify-center transition-colors shadow-md 
                                ${isSummaryLoading ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                        >
                            <IconCompressAlt className="w-4 h-4 mr-2" /> 
                            {isSummaryLoading ? 'Đang Tóm Tắt...' : '🤖 Tóm Tắt Truyện'}
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-2/3">

                    {(summary || isSummaryLoading || summaryError) && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-bold mb-2 text-yellow-700 flex items-center">
                                <IconCompressAlt className="w-5 h-5 mr-2" /> Tóm Tắt Nhanh (AI)
                            </h2>
                            {isSummaryLoading && (
                                <p className="text-yellow-600">Đang tạo tóm tắt... Vui lòng chờ vài giây.</p>
                            )}
                            {summaryError && (
                                <p className="text-red-500">Lỗi: {summaryError}</p>
                            )}
                            {summary && !isSummaryLoading && (
                                <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
                            )}
                        </div>
                    )}


                    <div className="p-4 bg-gray-50 rounded-xl shadow-inner mb-6">
                        <h2 className="text-xl font-bold mb-3 text-red-600 border-b pb-1">Thông Tin Cơ Bản</h2>
                        {/* ... thông tin cơ bản */}
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Mô Tả Truyện (Của Tác Giả)</h2>
                    <div className="text-gray-600 leading-relaxed bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-6">
                        <p className="whitespace-pre-wrap">{story.MoTa}</p>
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Danh Sách Chương</h2>

                    {story.TID && <ChapterListDisplay comicId={story.TID} />}

                    {TID && <CommentSection TID={parseInt(TID)} />} 
                    
                </div>
            </div>
        </div>
    );
}

export default StoryDetail;