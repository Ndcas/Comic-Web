import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAuth } from "../utils/AuthContext"; 

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_BASE_URL = VITE_BACKEND_URL;

const AdminLoginPage = () => {
    
    const { updateToken } = useAuth(); 
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError(null);
        setLoading(true);

        if (!email || !matKhau) {
            setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
            setLoading(false);
            return;
        }

        try {
            
            const response = await axios.post(`${API_BASE_URL}/admin/dangNhap`, {
                Email: email,
                MatKhau: matKhau,
            });

            const { token, hanDung, role, email: userEmail, tenTaiKhoan } = response.data;
            
            const standardizedRole = role 
                ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() 
                : 'Admin';
            
            
            updateToken(token, hanDung, standardizedRole, userEmail, tenTaiKhoan);
            
            navigate('/admin', { replace: true }); 
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Lỗi kết nối hoặc thông tin đăng nhập không đúng.';
            setError(errorMessage);
            
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            backgroundColor: '#eef2f7' 
        },
        loginBox: { 
            width: '100%', 
            maxWidth: '450px', 
            padding: '50px', 
            backgroundColor: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', 
        },
        title: { 
            textAlign: 'center', 
            marginBottom: '40px', 
            color: '#1a202c', 
            fontSize: '28px'
        },
        formGroup: { marginBottom: '25px' },
        label: { 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: '#4a5568', 
            fontSize: '14px'
        },
        input: { 
            width: '100%', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0', 
            boxSizing: 'border-box',
            fontSize: '16px',
        },
        button: { 
            width: '100%', 
            padding: '14px', 
            backgroundColor: '#4c51bf', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '18px', 
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
        },
        error: { 
            color: '#c53030', 
            backgroundColor: '#fee2e2', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '30px', 
            textAlign: 'center',
            fontWeight: '500',
            border: '1px solid #fca5a5'
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2 style={styles.title}>🛡️ Quản Trị Hệ Thống</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p style={styles.error}>{error}</p>}
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>Email Admin:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            disabled={loading}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            value={matKhau}
                            onChange={(e) => setMatKhau(e.target.value)}
                            required
                            style={styles.input}
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{...styles.button, opacity: loading ? 0.7 : 1}} 
                        disabled={loading}
                    >
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;