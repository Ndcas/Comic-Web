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
            setSummaryError(err.response?.data?.error || 'Lỗi không xác định khi tóm tắt truyện.');
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const fetchStoryDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const isUserLoggedIn = !!getAccessToken(); 
            let truyenResponse, chuongTruyenResponse;
            
            if (isUserLoggedIn) {
                truyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinTruyen?TID=${TID}`, false, true);
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`, false, true); 
            } else {
                truyenResponse = await get(`${VITE_BACKEND_URL}/truyen/thongTinTruyen?TID=${TID}`);
                chuongTruyenResponse = await get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${TID}`);
            }

            let dataTruyen = await truyenResponse.json();
            if (!truyenResponse.ok) throw new Error(dataTruyen.error);
            
            let dataChuongTruyen = await chuongTruyenResponse.json();
            if (!chuongTruyenResponse.ok) throw new Error(dataChuongTruyen.error);

            setStory(dataTruyen.truyen);
            setChapters(dataChuongTruyen.chuongTruyens); 
        } catch (err) {
            console.error("Lỗi tải chi tiết truyện:", err);
            setError(err.message || "Không thể tải chi tiết truyện.");
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
                            <Link to={`/read/${story.TID}/${firstChapter.CTID}`} className="w-full py-3 bg-red-600 text-white font-bold text-lg rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg">
                                <IconBookOpen className="w-4 h-4 mr-2" /> Đọc Từ Chương Đầu
                            </Link>
                        )}
                        {latestChapter && (
                            <Link to={`/read/${story.TID}/${latestChapter.CTID}`} className="w-full py-3 bg-gray-200 text-gray-800 font-bold text-lg rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors border border-gray-300">
                                <IconArrowRight className="w-4 h-4 mr-2" /> Chương Mới Nhất
                            </Link>
                        )}
                        <button onClick={handleTomTatTruyen} disabled={isSummaryLoading} className={`w-full py-3 text-white font-bold text-lg rounded-full flex items-center justify-center transition-colors shadow-md ${isSummaryLoading ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
                            <IconCompressAlt className="w-4 h-4 mr-2" /> {isSummaryLoading ? 'Đang Tóm Tắt...' : '🤖 Tóm Tắt Truyện'}
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-2/3">
                    {(summary || isSummaryLoading || summaryError) && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-bold mb-2 text-yellow-700 flex items-center">
                                <IconCompressAlt className="w-5 h-5 mr-2" /> Tóm Tắt Nhanh (AI)
                            </h2>
                            {isSummaryLoading ? <p className="text-yellow-600 italic">Đang tạo tóm tắt... Vui lòng chờ.</p> : null}
                            {summaryError ? <p className="text-red-500">Lỗi: {summaryError}</p> : null}
                            {summary && !isSummaryLoading && <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>}
                        </div>
                    )}

                    <div className="p-4 bg-gray-50 rounded-xl shadow-inner mb-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-3 text-red-600 border-b pb-1">Thông Tin Cơ Bản</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-gray-700 mt-2">
                            <div className="flex">
                                <span className="font-semibold w-24 shrink-0">Tác giả:</span>
                                <span>{story.TacGia || 'Đang cập nhật'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24 shrink-0">Trạng thái:</span>
                                <span className={`px-2 py-0.5 rounded text-xs text-white font-medium ${story.TrangThai == 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
                                    {story.TrangThai == 0 ? 'Hoàn Thành' : 'Đang Ra'}
                                </span>
                            </div>
                            <div className="flex col-span-full">
                                <span className="font-semibold w-24 shrink-0">Thể loại:</span>
                                <span className="text-blue-600 font-medium">
                                    {story.TheLoaiTruyens && story.TheLoaiTruyens.length > 0
                                        ? story.TheLoaiTruyens.map(item => item.TheLoai?.TenTheLoai).filter(Boolean).join(', ')
                                        : (story.TheLoai || 'Chưa xác định')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-red-600">Mô Tả Truyện (Của Tác Giả)</h2>
                    <div className="text-gray-600 leading-relaxed bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-6">
                        <p className="whitespace-pre-wrap">{story.MoTa}</p>
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-red-600">Danh Sách Chương</h2>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        {story.TID && <ChapterListDisplay comicId={story.TID} />}
                    </div>

                    <div className="mt-8">
                        {TID && <CommentSection TID={parseInt(TID)} />} 
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoryDetail;