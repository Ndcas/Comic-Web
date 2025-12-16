import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Đảm bảo bạn đã import Sidebar
import HeaderAdmin from './HeaderAdmin';

const AdminLayout = ({ currentTitle, isAuthenticated }) => {
  
  if (!isAuthenticated) {
      return null;
  }
  
  return (
    // h-screen: cao toàn màn hình, w-full: rộng toàn màn hình
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      
      {/* 1. Sidebar: Thường có chiều rộng cố định (vd: w-64) */}
      <Sidebar />
      
      {/* 2. Vùng chứa bên phải: Chiếm toàn bộ phần còn lại */}
      {/* Cần bỏ pl-64 nếu Sidebar của bạn không dùng 'fixed' */}
      {/* Thêm min-w-0 để tránh việc các bảng dài làm vỡ layout flex */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header: Luôn nằm trên cùng, rộng 100% của vùng nội dung */}
        <HeaderAdmin title={currentTitle} />
        
        {/* 3. Main Content Area */}
        {/* p-4 hoặc p-6 để tạo khoảng cách nhỏ với mép màn hình */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F4F7FE] p-4 md:p-6">
          {/* Outlet sẽ render ManageComicsPage.jsx vào đây */}
          <div className="w-full mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;