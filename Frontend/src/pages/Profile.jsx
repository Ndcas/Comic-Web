// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext.jsx'; 
import { getProfile, doiTenTaiKhoan } from '../utils/request.js'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, Mail, Calendar, Settings, 
    AlertTriangle, LogOut, Loader2, Edit, Save, DollarSign 
} from 'lucide-react';

import WalletSection from '../components/WalletSection.jsx';

const Profile = () => {
    // Lấy user, logout, updateToken từ AuthContext
    const { user, logout, loading: authLoading, updateToken } = useAuth();
    const navigate = useNavigate();
    
    // 💡 SỬA CHỮA QUAN TRỌNG: Lấy token từ user object trong AuthContext
    // Đảm bảo token luôn là một chuỗi (nếu không có thì là chuỗi rỗng)
    const token = user?.token || ''; 
    
    // 🔍 DEBUG: Log giá trị token ra console để kiểm tra
    console.log('--- DEBUG PROFILE ---');
    console.log(`1. User object exists: ${!!user}`);
    console.log(`2. Token from user object: ${token.length > 0 ? 'Có (dài ' + token.length + ')' : 'Rỗng/null'}`);
    console.log('-----------------------');

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State cho chức năng Đổi tên
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [nameError, setNameError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // 1. Kiểm tra trạng thái đăng nhập
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        // 2. Chỉ fetch data khi user đã xác thực
        if (user) {
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            // Giả định getProfile() trả về { nguoiDung: { ..., Diem: X, ... } }
            const data = await getProfile();
            const userData = data.nguoiDung;
            setProfileData(userData);
            
            setNewUsername(userData.TenTaiKhoan || userData.email || ''); 
        } catch (err) {
            console.error('Lỗi khi tải Profile:', err.message);
            setError(err.message);
            
            if (err.message.includes('Phiên đăng nhập hết hạn')) {
                logout(); 
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveUsername = async () => {
        const trimmedNewUsername = newUsername.trim();
        
        if (trimmedNewUsername === profileData.TenTaiKhoan || trimmedNewUsername === profileData.email) {
            setIsEditingName(false);
            return; 
        }

        if (trimmedNewUsername.length < 3 || trimmedNewUsername.length > 50) {
            setNameError('Tên tài khoản phải từ 3 đến 50 ký tự.');
            return;
        }

        setIsSaving(true);
        setNameError('');
        try {
            const response = await doiTenTaiKhoan(trimmedNewUsername);
            
            setProfileData(prev => ({ ...prev, TenTaiKhoan: trimmedNewUsername }));
            
            updateToken(response.token, response.hanDung, trimmedNewUsername); 

            alert('Đổi tên tài khoản thành công!');
            setIsEditingName(false);
        } catch (err) {
            setNameError(err.message || 'Lỗi không xác định khi đổi tên.');
        } finally {
            setIsSaving(false);
        }
    };

    // 🌟 HÀM CẬP NHẬT ĐIỂM (Được gọi từ WalletSection sau khi rút/nạp thành công)
    const handleUpdateDiem = (newDiem) => {
        // Cập nhật trường Diem trong state local profileData
        setProfileData(prev => ({ ...prev, Diem: newDiem }));
    };


    // --- HIỂN THỊ TRẠNG THÁI LOADING VÀ ERROR ---
    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] dark:text-white mt-20">
                <Loader2 className="animate-spin mr-2" size={32} /> Đang tải thông tin tài khoản...
            </div>
        );
    }
    
    if (error && !profileData) {
        return (
             <div className="p-8 text-center bg-red-100 dark:bg-red-900 rounded-lg max-w-lg mx-auto mt-20">
                <AlertTriangle className="mx-auto text-red-600 dark:text-red-400 mb-3" size={32} />
                <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Lỗi Truy Cập</h2>
                <p className="text-red-700 dark:text-red-400 mt-2">{error}</p>
                <button 
                    onClick={() => navigate('/login')} 
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Đăng nhập lại
                </button>
            </div>
        );
    }
    // --- KẾT THÚC HIỂN THỊ TRẠNG THÁI ---


    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-8 dark:text-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold border-b-2 pb-2 mb-6 dark:border-gray-700 mt-20">
                <User className="inline mr-2 text-red-500" size={28} /> Thông Tin Tài Khoản
            </h1>

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-10">
                <div className="flex items-center space-x-6 border-b pb-6 mb-6 dark:border-gray-700">
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white text-3xl font-bold">
                        {profileData?.TenTaiKhoan ? profileData.TenTaiKhoan[0].toUpperCase() : (profileData?.email ? profileData.email[0].toUpperCase() : 'U')}
                    </div>
                    <div>
                        <p className="text-2xl font-semibold">{profileData?.TenTaiKhoan || profileData?.email}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                            {profileData?.VaiTro === 1 ? 'Quản trị viên' : 'Thành viên'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    
                    {/* KHU VỰC TÊN HIỂN THỊ (TenTaiKhoan) */}
                    <div className="relative border p-4 rounded-lg dark:border-gray-700">
                        <div className="flex items-center">
                            <User className="mr-3 text-red-500" size={20} />
                            <span className="font-medium w-32">Tên hiển thị:</span>
                            
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => {
                                        setNewUsername(e.target.value);
                                        setNameError('');
                                    }}
                                    className="flex-1 p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500"
                                    disabled={isSaving}
                                />
                            ) : (
                                <span className="text-gray-700 dark:text-gray-300 font-bold">{profileData?.TenTaiKhoan || 'Chưa đặt tên'}</span>
                            )}
                            
                            <button 
                                onClick={isEditingName ? handleSaveUsername : () => setIsEditingName(true)}
                                disabled={isSaving}
                                className="ml-4 p-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition disabled:bg-gray-400"
                                title={isEditingName ? "Lưu tên" : "Chỉnh sửa tên"}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : (isEditingName ? <Save size={18} /> : <Edit size={18} />)}
                            </button>
                        </div>
                        {nameError && (
                            <p className="text-sm text-red-500 mt-2 flex items-center">
                                <AlertTriangle size={16} className="mr-1" /> {nameError}
                            </p>
                        )}
                    </div>
                    {/* KẾT THÚC KHU VỰC TÊN HIỂN THỊ */}

                    <div className="flex items-center">
                        <Mail className="mr-3 text-red-500" size={20} />
                        <span className="font-medium w-32">Email:</span>
                        <span className="text-gray-700 dark:text-gray-300">{profileData?.email}</span>
                    </div>
                    
                    {/* 🌟 HIỂN THỊ SỐ DƯ ĐIỂM */}
                    <div className="flex items-center border-b pb-4 dark:border-gray-700">
                        <DollarSign className="mr-3 text-green-500" size={20} />
                        <span className="font-medium w-32">Số dư điểm:</span>
                        <span className="text-green-600 dark:text-green-400 font-extrabold text-lg">
                            {profileData?.Diem !== undefined ? profileData.Diem.toLocaleString() : '---'} Điểm
                        </span>
                    </div>
                    {/* KẾT THÚC HIỂN THỊ SỐ DƯ ĐIỂM */}

                    {/* 🌟 TÍCH HỢP WALLET SECTION */}
                    {profileData?.Diem !== undefined && (
                        <WalletSection 
                            currentDiem={profileData.Diem}
                            updateDiem={handleUpdateDiem}
                            // Truyền token đã được sửa
                            userToken={token} 
                        />
                    )}
                    {/* KẾT THÚC TÍCH HỢP WALLET SECTION */}
                    
                    {profileData?.ThoiGianTao && (
                        <div className="flex items-center pt-4 border-t dark:border-gray-700">
                            <Calendar className="mr-3 text-red-500" size={20} />
                            <span className="font-medium w-32">Ngày tham gia:</span>
                            <span className="text-gray-700 dark:text-gray-300">
                                {new Date(profileData.ThoiGianTao).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    
                    <div className="pt-6 border-t mt-6 dark:border-gray-700 space-y-3">
                        <Link 
                            to="/change-password" 
                            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                            <Settings className="mr-2" size={18} /> Đổi mật khẩu
                        </Link>
                        
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        >
                            <LogOut className="mr-2 text-red-500" size={18} /> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;