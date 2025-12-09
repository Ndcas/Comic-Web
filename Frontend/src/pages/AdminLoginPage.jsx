// src/pages/AdminLoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';
import { User, Lock, LogIn, Shield } from 'lucide-react';
import { toast } from 'react-toastify'; 

// Hàm giả định lưu token Admin (Sử dụng localStorage để giữ trạng thái đăng nhập)
const setAdminToken = (token) => {
    localStorage.setItem('admin_token', token);
};

const AdminLoginPage = () => {
    // Chúng ta giữ nguyên 'username' cho trường input, nhưng payload gửi đi là 'Email'
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 💡 ĐÃ SỬA: Loại bỏ tiền tố '/api' để khớp với Backend Routing và Proxy trong vite.config.js
        const LOGIN_URL = '/admin/dangNhap'; 

        try {
            // Payload khớp với yêu cầu của Backend: Email và MatKhau
            const payload = { 
                Email: username, 
                MatKhau: password 
            }; 
            
            const response = await axios.post(LOGIN_URL, payload);
            
            // Giả sử backend trả về token và thông tin admin
            const { token, adminInfo } = response.data; 

            setAdminToken(token);
            
            toast.success(`Chào mừng Admin ${adminInfo?.name || username}!`);
            navigate('/admin', { replace: true }); // Chuyển hướng đến Dashboard

        } catch (error) {
            console.error('Lỗi Đăng nhập Admin:', error);
            const errorMessage = error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
                
                {/* Tiêu đề & Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Shield className="w-10 h-10 text-indigo-600 mb-3" />
                    <h2 className="text-3xl font-bold text-gray-800">Đăng nhập Admin</h2>
                    <p className="text-gray-500 text-sm mt-1">Sử dụng tài khoản quản trị viên</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tên đăng nhập (hoặc Email) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email / Tên đăng nhập</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="admin@example.com"
                            />
                        </div>
                    </div>
                    
                    {/* Mật khẩu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    
                    {/* Nút Đăng nhập */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                                Đang xử lý...
                            </span>
                        ) : (
                            <><LogIn className="w-5 h-5 mr-2" /> Đăng nhập</>
                        )}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    <Link to="/admin/forgot-password" className="text-indigo-600 hover:text-indigo-800">Quên mật khẩu?</Link>
                </p>

            </div>
        </div>
    );
};

export default AdminLoginPage;