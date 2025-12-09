// src/components/AdminLayout.jsx

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderAdmin from './HeaderAdmin';

const AdminLayout = () => {
  const location = useLocation();
  
  const getTitle = (pathname) => {
    switch (pathname) {
      case '/admin': return 'Dashboard - Tổng quan Hệ thống';
      case '/admin/comics': return 'Quản lý Truyện';
      case '/admin/users': return 'Quản lý Người dùng';
      case '/admin/reports': return 'Quản lý Báo cáo';
      default: return 'Admin Panel';
    }
  };
  
  const currentTitle = getTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100">
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pl-64">
        
        <HeaderAdmin title={currentTitle} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;