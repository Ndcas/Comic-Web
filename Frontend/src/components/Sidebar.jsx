

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { LayoutDashboard, BookOpen, Users, AlertTriangle, Settings, LogOut } from 'lucide-react'; 


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); 

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Truyện', path: '/admin/comics', icon: BookOpen },
    { name: 'Quản lý Người dùng', path: '/admin/users', icon: Users },
    { name: 'Quản lý Báo cáo', path: '/admin/reports', icon: AlertTriangle },
    { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
   
    localStorage.removeItem('admin_token');
    
    
    navigate('/admin/login', { replace: true });
    
    console.log('Admin Đăng xuất thành công và đã xóa token.');
  };

  return (
    // Sidebar: Chiều rộng cố định (w-64), nền tối (bg-slate-900)
    <div className="w-64 bg-slate-900 text-white flex flex-col p-4 shadow-2xl h-full fixed top-0 left-0">
      
      {/* Tiêu đề / Logo */}
      <div className="text-2xl font-extrabold mb-8 pt-4 text-indigo-400 border-b border-slate-700 pb-4">
        ADMIN PANEL
      </div>
      
      {/* Menu Điều hướng chính */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          // Kiểm tra xem đường dẫn hiện tại có khớp với mục menu không
          const isActive = location.pathname === item.path;
          const Icon = item.icon; 
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition duration-200 text-sm 
                ${isActive ? 'bg-indigo-600 font-bold shadow-md' : 'hover:bg-slate-700/80 text-gray-300'}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Nút Đăng xuất */}
      <div className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg transition duration-200 bg-red-600 hover:bg-red-700 text-sm font-bold"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Đăng Xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;