import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const AdminLayout = () => {
    const { user, logoutUser } = useAuth();
    const location = useLocation();

    if (user?.Role !== 'Admin') {
        return (
            <div style={styles.unauthorizedContainer}>
                <h1>🚫 Truy cập bị từ chối</h1>
                <p>Bạn không có quyền truy cập vào trang quản trị này. Vui lòng đăng nhập với tài khoản Admin.</p>
                <Link to="/" style={styles.homeLink}>Quay về Trang chủ</Link>
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
                        Xin chào, **{user.TenTaiKhoan}**
                    </span>
                    <button onClick={logoutUser} style={styles.logoutButton}>
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
                                ...(location.pathname === item.path ? styles.navLinkActive : {}) 
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
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f4f7f6', 
    },
    header: {
        backgroundColor: '#343a40',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    logo: {
        margin: 0,
        fontSize: '1.5em',
        fontWeight: '700',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    mainContent: {
        display: 'flex',
        flexGrow: 1,
    },
    sidebar: {
        width: '250px',
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    },
    navLink: {
        color: '#ecf0f1',
        textDecoration: 'none',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s, color 0.2s',
        fontSize: '1.05em',
        fontWeight: '500',
    },
    navLinkActive: {
        backgroundColor: '#3498db', 
        color: 'white',
        borderLeft: '5px solid #ffc107', 
        paddingLeft: '15px',
    },
    navIcon: {
        marginRight: '10px',
        fontSize: '1.2em',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #3e566e',
        margin: '15px 20px',
    },
    contentArea: {
        flexGrow: 1,
        padding: '20px',
        overflowY: 'auto',
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