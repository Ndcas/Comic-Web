import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Lock, Unlock, Zap, BookOpen } from 'lucide-react'; 
import { toast } from 'react-toastify'; 
import { useNavigate } from 'react-router-dom';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

async function fetchUserDiem(token) {
    if (!token) return 0;
    
    try {
        const response = await axios.get(`${VITE_BACKEND_URL}/user/diem`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.diem || 0;
    } catch (error) {
        console.error("Error fetching user points:", error);
        return 0;
    }
}

const ChapterListDisplay = ({ comicId }) => { 
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserDiem, setCurrentUserDiem] = useState(0); 
    const token = localStorage.getItem('access_token');
    const navigate = useNavigate();

    if (!comicId) {
        return <div className="p-8 text-center text-red-500">Error: Comic ID is missing. Cannot load chapters.</div>;
    }

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const diem = await fetchUserDiem(token);
            setCurrentUserDiem(diem);

            const chapterResponse = await axios.get(`${VITE_BACKEND_URL}/truyen/danhSachChuong?TID=${comicId}`, { 
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            const responseData = chapterResponse.data;
            let chaptersList = null;

            if (responseData?.data?.chuongTruyens) {
                chaptersList = responseData.data.chuongTruyens;
            } else if (responseData?.chuongTruyens) {
                chaptersList = responseData.chuongTruyens;
            }
            
            setChapters(chaptersList || []); 
            
        } catch (error) {
            console.error("Error loading data:", error);
            const errorMessage = error.response?.data?.error || "Failed to load story data. Please try again.";
            toast.error(errorMessage);
            setChapters([]);
        } finally {
            setLoading(false);
        }
    }, [comicId, token]);

    const handleUnlockChapter = async (chapter) => {
        if (!token) {
            return toast.warn("Please log in to unlock the chapter.");
        }

        if (currentUserDiem < chapter.GiaChuong) {
            return toast.error(`You don't have enough ${chapter.GiaChuong} points to unlock this chapter.`);
        }

        const confirmMessage = `Confirm unlocking chapter "${chapter.TenChuongTruyen}" with ${chapter.GiaChuong} points?`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const unlockResponse = await axios.post(`${VITE_BACKEND_URL}/truyen/moKhoaChuongTruyen`, 
                { ctid: chapter.CTID }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (unlockResponse.data.ok) {
                toast.success(`Chapter unlocked successfully!`);
                
                setChapters(prevChapters => prevChapters.map(c => 
                    c.CTID === chapter.CTID 
                        ? { ...c, is_unlocked: true } 
                        : c
                ));
                setCurrentUserDiem(prev => prev - chapter.GiaChuong); 
            } else {
                toast.error(unlockResponse.data.error || "Unknown unlock error.");
            }
            
        } catch (error) {
            console.error("Unlock transaction error:", error.response?.data);
            const errorMessage = error.response?.data?.error || "Transaction failed. System error.";
            toast.error(errorMessage);
        }
    }

    const handleReadChapter = (chapter) => {
        navigate(`/read/${comicId}/${chapter.CTID}`); 
    }

    useEffect(() => {
        fetchData();
    }, [comicId, token, fetchData]);

    const renderChapterStatus = (chapter) => {
        if (chapter.GiaChuong === 0) {
            return (
                <span className="text-blue-600 flex items-center text-sm font-semibold">
                    <BookOpen className="w-4 h-4 mr-1"/> FREE
                </span>
            );
        }

        if (chapter.is_unlocked) {
            return (
                <span className="text-green-600 flex items-center text-sm font-semibold">
                    <Unlock className="w-4 h-4 mr-1"/> UNLOCKED
                </span>
            );
        }

        return (
            <button
                onClick={(e) => {
                    e.stopPropagation(); 
                    handleUnlockChapter(chapter);
                }}
                className="flex items-center text-red-600 border border-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full text-sm font-medium transition duration-200"
                title={`Requires ${chapter.GiaChuong} points to unlock`}
            >
                <Lock className="w-4 h-4 mr-1"/> {chapter.GiaChuong} <Zap className="w-4 h-4 ml-1"/>
            </button>
        );
    }
    
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading chapter list...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-xl rounded-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Chapter List</h1>
                <div className="text-lg font-semibold text-indigo-600 flex items-center">
                    Points: {currentUserDiem} <Zap className="w-5 h-5 ml-1"/>
                </div>
            </div>
            
            <ul className="divide-y divide-gray-200">
                {chapters.map((chapter) => (
                    <li 
                        key={chapter.CTID} 
                        className={`py-4 flex justify-between items-center transition duration-150 p-2 rounded-lg ${chapter.is_unlocked || chapter.GiaChuong === 0 ? 'hover:bg-blue-50 cursor-pointer' : 'bg-gray-50'}`}
                        onClick={(chapter.is_unlocked || chapter.GiaChuong === 0) ? () => handleReadChapter(chapter) : undefined}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-900 truncate">
                                {chapter.TenChuongTruyen}
                            </p>
                            <p className="text-sm text-gray-500">
                                Published: {new Date(chapter.NgayDang || '2025-01-01').toLocaleDateString()}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            {renderChapterStatus(chapter)}
                        </div>
                    </li>
                ))}
            </ul>

            {chapters.length === 0 && (
                <p className="text-center py-10 text-gray-500">No chapters found for this story.</p>
            )}
        </div>
    );
};

export default ChapterListDisplay;