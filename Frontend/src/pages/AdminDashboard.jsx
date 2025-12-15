
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

import DashboardPage from './DashboardPage'; 
import ComicManagementPage from './ComicManagementPage';
import UserManagementPage from './UserManagementPage'; 
import ReportManagementPage from './ReportManagementPage'; 

const AdminDashboard = () => {
    
    const location = useLocation();

    const menuItems = [
        { path: '', name: '📊 Tổng quan (Dashboard)', Component: DashboardPage }, 
        { path: 'comics', name: '📚 Quản lý Truyện', Component: ComicManagementPage },
        { path: 'users', name: '👤 Quản lý Người dùng', Component: UserManagementPage },
        { path: 'reports', name: '⚠️ Quản lý Báo cáo', Component: ReportManagementPage },
    ];
    
    const isLinkActive = (path) => {
        const currentPath = location.pathname.split('/').pop();
        return currentPath === path || (path === '' && currentPath === 'admin');
    };

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>Admin Panel</h3>
                <nav>
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path || '/admin'} 
                            style={{ 
                                ...styles.navLink,
                                ...(isLinkActive(item.path) ? styles.navLinkActive : {})
                            }}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h1>Quản Trị Hệ Thống</h1>
                </div>
                
                <div style={styles.pageContent}>
                    <Routes>
                        {menuItems.map((item) => (
                            <Route 
                                key={item.path} 
                                path={item.path} 
                                element={<item.Component />} 
                            />
                        ))}
                        <Route path="*" element={<h2 style={{padding: '20px'}}>404 - Trang Admin không tồn tại</h2>} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f4f7f9',
    },
    sidebar: {
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px 0',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
        position: 'sticky', 
        top: 0,
        height: '100vh',
    },
    sidebarTitle: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#ecf0f1',
    },
    navLink: {
        display: 'block',
        padding: '12px 20px',
        textDecoration: 'none',
        color: '#ecf0f1',
        borderLeft: '4px solid transparent',
        transition: 'background-color 0.3s, border-left-color 0.3s',
    },
    navLinkActive: { 
        backgroundColor: '#34495e',
        borderLeftColor: '#3498db',
        fontWeight: 'bold',
    },
    content: {
        flexGrow: 1,
        padding: '0 20px 20px 20px',
    },
    header: {
        padding: '20px 0',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px',
    },
    pageContent: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        minHeight: '80vh'
    }
};

export default AdminDashboard;