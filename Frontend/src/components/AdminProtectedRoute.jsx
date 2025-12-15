import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';


const AdminProtectedRoute = ({ element }) => { 
    const { user, loading } = useAuth();
    
   
    if (loading) {
        return <div style={{textAlign: 'center', marginTop: '20vh', padding: '20px', fontSize: '1.2em', color: '#4c51bf'}}>Đang kiểm tra quyền Admin...</div>;
    }

   
    if (user && user.role === 'Admin') {
       
        return element; 
        
    } else {
       
        return <Navigate to="/admin/login" replace />;
    }
};

export default AdminProtectedRoute;