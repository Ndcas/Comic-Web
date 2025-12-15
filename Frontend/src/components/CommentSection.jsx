import React, { useState, useEffect, useCallback } from 'react';
// import { FiSend, FiUser } from 'react-icons/fi'; // Ví dụ nếu bạn có thư viện icon

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_PREFIX = '/truyen'; 

const getAccessToken = () => localStorage.getItem('token'); 

// Component con: Hiển thị một bình luận duy nhất
const CommentItem = ({ comment, formatTime }) => {
    // Tạo màu nền avatar ngẫu nhiên dựa trên tên người dùng (để có tính thẩm mỹ)
    const username = comment.NguoiDung?.TenTaiKhoan || 'Người dùng ẩn danh';
    const initial = username.charAt(0).toUpperCase();
    const avatarColor = `hsl(${username.length * 40 % 360}, 70%, 50%)`;

    return (
        <li className="flex space-x-3 p-4 bg-gray-50 border-l-4 border-red-200 rounded-lg shadow-sm">
            
            {/* Avatar Placeholder */}
            <div 
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
                style={{ backgroundColor: avatarColor }}
                title={username}
            >
                {initial}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <p className="comment-author text-sm">
                        <strong className="text-red-700 font-extrabold mr-2 hover:text-red-800 transition-colors">
                            {username}
                        </strong> 
                        {/* Bạn có thể thêm badge cho Admin/Tác giả ở đây */}
                    </p>
                    <small className="text-gray-500 text-xs">
                        {formatTime(comment.ThoiGianBinhLuan)}
                    </small>
                </div>
                <p className="comment-content text-gray-800 break-words whitespace-pre-wrap">
                    {comment.NoiDung}
                </p>
                {/* Khu vực Trả lời (Reply) có thể thêm vào sau */}
                <div className="mt-2 text-xs text-blue-500 hover:text-blue-700 cursor-pointer">
                    {/* <span className="mr-1">↶</span> Trả lời */}
                </div>
            </div>
        </li>
    );
};


const CommentSection = ({ TID }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const IS_LOGGED_IN = !!getAccessToken();
    const MAX_CHARACTERS = 300;

    const fetchComments = useCallback(async () => {
        // ... (Logic fetchComments giữ nguyên)
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
                // Sắp xếp bình luận theo thời gian mới nhất lên đầu
                const sortedComments = data.binhLuans ? data.binhLuans.sort((a, b) => new Date(b.ThoiGianBinhLuan) - new Date(a.ThoiGianBinhLuan)) : [];
                setComments(sortedComments);
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
        // ... (Logic handleSubmit giữ nguyên)
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
            
            {/* PHẦN I: ĐĂNG BÌNH LUẬN */}
            <section id="post-comment-section" className="bg-blue-50 p-6 rounded-xl shadow-lg mb-8 border border-blue-200">
                <h4 className="text-2xl font-extrabold mb-4 text-blue-800 flex items-center">
                    <span className="mr-2 text-3xl">💬</span> Đóng góp ý kiến của bạn
                </h4>
                {error && <p className="text-red-600 mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">{error}</p>}
                {successMessage && <p className="text-green-700 mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">{successMessage}</p>}

                {IS_LOGGED_IN ? (
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                        <textarea
                            id="comment-content"
                            className="w-full h-28 p-4 border-2 border-blue-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800 text-base shadow-inner transition-all duration-200"
                            placeholder={`Viết bình luận của bạn tại đây (tối đa ${MAX_CHARACTERS} ký tự)...`}
                            required
                            maxLength={MAX_CHARACTERS}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="flex justify-between items-center">
                            <div id="char-count" className="text-sm text-blue-600">
                                {commentContent.length}/{MAX_CHARACTERS} ký tự
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading || commentContent.length === 0}
                                className={`px-6 py-3 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-xl
                                    ${isLoading || commentContent.length === 0 
                                        ? 'bg-red-300 cursor-not-allowed' 
                                        : 'bg-red-600 hover:bg-red-700'}`
                                }
                            >
                                <span className="mr-2">🚀</span> {isLoading ? 'Đang gửi...' : 'Gửi Bình Luận'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div id="login-prompt" className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                        <p className="font-medium text-lg">
                            <span className="mr-2">⚠️</span> Vui lòng <a href="/login" className="text-red-700 font-extrabold hover:text-red-900 hover:underline transition-colors">Đăng nhập</a> để bình luận và tham gia thảo luận!
                        </p>
                    </div>
                )}
            </section>
            
            {/* PHẦN II: DANH SÁCH BÌNH LUẬN */}
            <section id="comment-section" className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
                <h3 className="text-2xl font-extrabold mb-6 text-gray-900 border-b-4 border-red-500 inline-block pb-1">
                    Bình luận ({comments.length})
                </h3>
                
                {isLoading && <div className="text-center p-6 text-red-500 bg-gray-50 rounded-lg">Đang tải bình luận...</div>}
                
                {!isLoading && comments.length === 0 && (
                    <div id="no-comments" className="text-center p-8 text-gray-600 bg-gray-100 rounded-xl shadow-inner">
                        <p className="text-lg font-medium">✨ Hãy là người đầu tiên bình luận về truyện này! ✨</p>
                        {error && <p className="text-sm text-red-500 mt-2">Lỗi: {error}</p>}
                    </div>
                )}
                
                <ul id="comments-list" className="space-y-6">
                    {comments.map((comment, index) => (
                        <CommentItem key={comment.BLID || index} comment={comment} formatTime={formatTime} />
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default CommentSection;