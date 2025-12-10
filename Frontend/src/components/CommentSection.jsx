import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_PREFIX = '/truyen'; 

const getAccessToken = () => localStorage.getItem('token'); 

const CommentSection = ({ TID }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const IS_LOGGED_IN = !!getAccessToken();
    const MAX_CHARACTERS = 300;

    const fetchComments = useCallback(async () => {
        if (!API_BASE_URL) {
            setError('Lỗi cấu hình: Thiếu đường dẫn BACKEND_URL.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const fullUrl = `${API_BASE_URL}${API_PREFIX}/danhSachBinhLuan?TID=${TID}`;
            const response = await fetch(fullUrl);
            const data = await response.json();

            if (response.ok) {
                setComments(data.binhLuans || []);
            } else {
                setError(data.error || 'Không thể tải bình luận. Vui lòng kiểm tra API.');
                setComments([]);
            }
        } catch (err) {
            setError('Lỗi kết nối máy chủ khi tải bình luận. (Network/CORS)');
            setComments([]);
        } finally {
            setIsLoading(false);
        }
    }, [TID]);

    useEffect(() => {
        if (TID) {
            fetchComments();
        }
    }, [TID, fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const noiDung = commentContent.trim();
        if (!noiDung || noiDung.length > MAX_CHARACTERS) return;

        const accessToken = getAccessToken();
        if (!accessToken) {
            setError('Vui lòng đăng nhập để bình luận!');
            return;
        }
        
        setIsLoading(true);
        setSuccessMessage('');
        setError(null);

        try {
            const fullUrl = `${API_BASE_URL}${API_PREFIX}/binhLuan`;
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` 
                },
                body: JSON.stringify({ TID, NoiDung: noiDung })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || 'Thêm bình luận thành công!');
                setCommentContent('');
                await fetchComments(); 

                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(data.error || 'Không thể đăng bình luận. Lỗi xác thực hoặc API.');
            }
        } catch (err) {
            setError('Lỗi kết nối mạng khi đăng bình luận.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Chưa có thời gian';
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mt-8">
            <section id="post-comment-section" className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
                <h4 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Đăng bình luận của bạn</h4>
                {error && <p className="text-red-500 mb-4 p-2 bg-red-50 border border-red-200 rounded">{error}</p>}
                {successMessage && <p className="text-green-600 mb-4 p-2 bg-green-50 border border-green-200 rounded">{successMessage}</p>}

                {IS_LOGGED_IN ? (
                    <form onSubmit={handleSubmit}>
                        <textarea
                            id="comment-content"
                            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 resize-none text-gray-700"
                            placeholder={`Viết bình luận của bạn tại đây (tối đa ${MAX_CHARACTERS} ký tự)...`}
                            required
                            maxLength={MAX_CHARACTERS}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            disabled={isLoading}
                        />
                        <div id="char-count" className="text-sm text-gray-500 mt-1 flex justify-end">
                            {commentContent.length}/{MAX_CHARACTERS}
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || commentContent.length === 0}
                            className={`mt-3 px-6 py-2 rounded-full text-white font-semibold transition-colors
                                ${isLoading || commentContent.length === 0 
                                    ? 'bg-red-300 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-700 shadow-lg'}`
                            }
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi Bình Luận'}
                        </button>
                    </form>
                ) : (
                    <div id="login-prompt" className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-lg">
                        <p>
                            Vui lòng <a href="/login" className="text-red-600 font-bold hover:underline">Đăng nhập</a> để bình luận.
                        </p>
                    </div>
                )}
            </section>
            
            <section id="comment-section" className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Bình luận ({comments.length})</h3>
                
                {isLoading && <div className="text-center p-4 text-red-500">Đang tải bình luận...</div>}
                
                {!isLoading && comments.length === 0 && (
                    <div id="no-comments" className="text-center p-6 text-gray-500 bg-gray-50 rounded">
                        {error ? `Lỗi: ${error}` : 'Chưa có bình luận nào cho truyện này.'}
                    </div>
                )}
                
                <ul id="comments-list" className="space-y-4">
                    {comments.map((comment, index) => (
                        <li key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <p className="comment-author text-sm mb-1">
                                <strong className="text-red-600 font-bold mr-2">{comment.NguoiDung?.TenTaiKhoan || 'Người dùng ẩn danh'}</strong> 
                                <small className="text-gray-500">({formatTime(comment.ThoiGianBinhLuan)})</small>
                            </p>
                            <p className="comment-content text-gray-700">{comment.NoiDung}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default CommentSection;