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
            <header style={styles.header}>
                <h1 style={styles.logo}>ADMIN PANEL</h1>
                <div style={styles.userInfo}>
                    <span style={{ marginRight: '15px' }}>
                        Xin chào, **{user.TenTaiKhoan || user.email}**
                    </span>
                    <button onClick={logout} style={styles.logoutButton}>
                        Đăng xuất
                    </button>
                </div>
            </header>

            <div style={styles.mainContent}>
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
                        <span style={styles.navIcon}>🏠</span>
                        Xem Website
                    </Link>
                </nav>

                <main style={styles.contentArea}>
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};

const styles = {
    navLinkActive: {
        backgroundColor: '#3498db', 
        color: 'white',
        borderLeft: '5px solid #ffc107', 
        paddingLeft: '15px',
    },
    unauthorizedContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '20px',
    },
    homeLink: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
    }
};

export default AdminLayout;