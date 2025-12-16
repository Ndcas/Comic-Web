import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext'; 

const AdminLayout = () => {
    const { user, logout } = useAuth(); 
    const location = useLocation();

    if (!user || user.role !== 'Admin') {
        return (
            <div style={styles.unauthorizedContainer}>
                <h1>🚫 Truy cập bị từ chối</h1>
                <p>Bạn không có quyền truy cập vào trang quản trị này. Vui lòng đăng nhập với tài khoản Admin.</p>
                <Link to="/login" style={styles.homeLink}>Đăng nhập lại</Link>
            </div>
        );
    }
    
    const navItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
        { path: '/admin/comics', name: 'Quản lý Truyện', icon: '📚' },
        { path: '/admin/users', name: 'Quản lý Người dùng', icon: '👥' },
        { path: '/admin/reports', name: 'Quản lý Báo cáo', icon: '🚨' },
    ];

    return (
        <div style={styles.appContainer}>
            {/* Header cố định phía trên */}
            <header style={styles.header}>
                <h1 style={styles.logo}>ADMIN PANEL</h1>
                <div style={styles.userInfo}>
                    <span style={{ marginRight: '15px' }}>
                        Xin chào, <b>{user.TenTaiKhoan || user.email}</b>
                    </span>
                    <button onClick={logout} style={styles.logoutButton}>Đăng xuất</button>
                </div>
            </header>

            <div style={styles.mainContent}>
                {/* Sidebar cố định bên trái */}
                <nav style={styles.sidebar}>
                    {navItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            style={{ 
                                ...styles.navLink, 
                                ...(location.pathname.startsWith(item.path) ? styles.navLinkActive : {}) 
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                    <hr style={styles.divider} />
                    <Link to="/" style={styles.navLink}>
                        <span style={styles.navIcon}>🏠</span> Xem Website
                    </Link>
                </nav>

                {/* Vùng nội dung chính: Tự động giãn nở tối đa */}
                <main style={styles.contentArea}>
                    <div style={styles.pageWrapper}>
                        <Outlet /> 
                    </div>
                </main>
            </div>
        </div>
    );
};

const styles = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        height: '70px',
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    logo: { fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' },
    logoutButton: {
        padding: '8px 16px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    mainContent: {
        display: 'flex',
        flex: 1,
        width: '100%',
        overflow: 'hidden',
    },
    sidebar: {
        width: '260px',
        backgroundColor: '#34495e',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        flexShrink: 0,
    },
    contentArea: {
        flex: 1,
        backgroundColor: '#F4F7FE',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    pageWrapper: {
        padding: '25px',
        width: '100%',
        boxSizing: 'border-box',
    },
    navLink: {
        padding: '15px 25px',
        color: '#bdc3c7',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s',
    },
    navLinkActive: {
        backgroundColor: '#3498db',
        color: 'white',
        borderLeft: '5px solid #ffc107',
    },
    navIcon: { marginRight: '15px' },
    divider: { border: '0.5px solid #455d7a', margin: '15px 20px' },
    unauthorizedContainer: { textAlign: 'center', padding: '100px', color: '#721c24' },
    homeLink: { textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }
};

export default AdminLayout;