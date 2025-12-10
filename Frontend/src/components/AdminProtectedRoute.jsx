import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const AdminProtectedRoute = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div style={{textAlign: 'center', marginTop: '20vh'}}>Đang kiểm tra quyền...</div>;
    }

    if (user && user.role === 'Admin') {
        return <Outlet />; 
    } else {
        return <Navigate to="/admin/login" replace />;
    }
};

export default AdminProtectedRoute;