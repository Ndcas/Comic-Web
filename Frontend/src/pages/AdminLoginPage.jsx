

import React, { useState } from 'react';
import axios from 'axios';

import { useAuth } from "../utils/AuthContext"; 


const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API_BASE_URL = VITE_BACKEND_URL;

const AdminLoginPage = () => {
    
    const { updateToken } = useAuth(); 
    
    const [email, setEmail] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError(null);
        setLoading(true);

        if (!email || !matKhau) {
            setError('Vui lòng nhập đầy đủ Email và Mật khẩu');
            setLoading(false);
            return;
        }

        try {
          
            const response = await axios.post(`${API_BASE_URL}/admin/dangNhap`, {
                Email: email,
                MatKhau: matKhau,
            });

            
            const { token, hanDung, role, email: userEmail, tenTaiKhoan } = response.data;
            
         
            updateToken(token, hanDung, role, userEmail, tenTaiKhoan);
            
            
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Lỗi kết nối hệ thống. Vui lòng thử lại.';
            setError(errorMessage);
            
        } finally {
            setLoading(false);
        }
    };

    // ... (Phần UI giữ nguyên)
    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2 style={styles.title}>🔒 Đăng Nhập Admin</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p style={styles.error}>{error}</p>}
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>Email:</label>
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
                    
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

// ... (CSS giữ nguyên)
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6' },
    loginBox: { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
    title: { textAlign: 'center', marginBottom: '30px', color: '#333' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s' },
    error: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' },
};

export default AdminLoginPage;