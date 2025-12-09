// src/pages/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ListFilter, Lock, Unlock, Shield, Mail } from 'lucide-react';
// import { toast } from 'react-toastify'; // Nếu bạn đang sử dụng

// Dữ liệu mẫu (Thay thế bằng API data)
const MOCK_USERS = [
  { ID: 101, Username: "danny_user", Email: "danny@example.com", Role: "Admin", Status: "Active", JoinedDate: "2023-01-01" },
  { ID: 102, Username: "user_hoangan", Email: "hoangan@email.com", Role: "Member", Status: "Active", JoinedDate: "2023-05-15" },
  { ID: 103, Username: "user_bi_khoa", Email: "khoa@email.com", Role: "Member", Status: "Locked", JoinedDate: "2024-03-20" },
  { ID: 104, Username: "reviewer_01", Email: "review@test.com", Role: "Reviewer", Status: "Active", JoinedDate: "2024-11-01" },
];

const UserManagementPage = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [filterStatus, setFilterStatus] = useState('All'); // All, Active, Locked
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // 💡 TODO: Hàm lấy dữ liệu người dùng từ API
  const fetchUsers = async () => {
    // try {
    //   setLoading(true);
    //   const response = await axios.get('/admin/users/list?status=' + filterStatus + '&search=' + searchTerm);
    //   setUsers(response.data);
    // } catch (error) {
    //   // toast.error("Lỗi tải danh sách người dùng");
    // } finally {
    //   setLoading(false);
    // }
  };
  
  useEffect(() => {
    // fetchUsers(); // Kích hoạt khi có API thực tế
  }, [filterStatus, searchTerm]);

  // Hàm hiển thị trạng thái bằng badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Hoạt động</span>;
      case 'Locked':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Bị khóa</span>;
      case 'Admin':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Admin</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Khác</span>;
    }
  };
  
  // Hàm xử lý hành động Khóa/Mở khóa tài khoản
  const handleLockUnlock = (userId, currentStatus) => {
      const action = currentStatus === 'Active' ? 'Khóa' : 'Mở khóa';
      if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ID: ${userId} không?`)) {
          // 💡 TODO: Gọi API /admin/users/lockUnlock với ID và action
          // Ví dụ: axios.post('/admin/users/lockUnlock', { userId, action: currentStatus === 'Active' ? 'lock' : 'unlock' });
          alert(`Đã thực hiện hành động ${action} cho người dùng ID ${userId}`);
          // Cập nhật trạng thái hiển thị
          setUsers(users.map(u => u.ID === userId ? { ...u, Status: action === 'Khóa' ? 'Locked' : 'Active' } : u));
      }
  }

  // Hàm xử lý Phân quyền
  const handlePromoteToAdmin = (userId) => {
      if (window.confirm(`Bạn có chắc chắn muốn cấp quyền Admin cho người dùng ID: ${userId} không?`)) {
          // 💡 TODO: Gọi API /admin/users/promoteAdmin với ID
          alert(`Đã cấp quyền Admin cho người dùng ID ${userId}`);
          // Cập nhật trạng thái hiển thị
          setUsers(users.map(u => u.ID === userId ? { ...u, Role: 'Admin' } : u));
      }
  }

  const filteredUsers = users.filter(user => 
      filterStatus === 'All' ? true : user.Status === filterStatus
  ).filter(user => 
      user.Username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">👥 Quản lý Người dùng</h1>

      {/* Thanh Công cụ: Tìm kiếm và Bộ lọc */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        
        {/* Tìm kiếm */}
        <div className="flex items-center w-full max-w-md border rounded-lg bg-gray-50">
          <Search className="w-5 h-5 ml-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên hoặc Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2.5 bg-transparent focus:outline-none"
          />
        </div>

        {/* Bộ lọc Trạng thái */}
        <div className="flex items-center space-x-2">
          <ListFilter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2.5 border rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">Tất cả Trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Locked">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Bảng Danh sách Người dùng */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        {loading ? (
          <p className="text-center p-10">Đang tải danh sách người dùng...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ID: {user.ID} <br/>
                    <span className="font-semibold">{user.Username}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    <Mail className="w-4 h-4 mr-1"/> {user.Email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    {renderStatusBadge(user.Role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(user.Status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    
                    {/* Nút Khóa / Mở khóa */}
                    {user.Status === 'Active' ? (
                        <button
                            title="Khóa Tài khoản"
                            onClick={() => handleLockUnlock(user.ID, 'Active')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                            <Lock className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            title="Mở khóa Tài khoản"
                            onClick={() => handleLockUnlock(user.ID, 'Locked')}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        >
                            <Unlock className="w-5 h-5" />
                        </button>
                    )}
                    
                    {/* Nút Phân quyền Admin (Chỉ hiển thị cho Member/Reviewer) */}
                    {user.Role !== 'Admin' && (
                        <button
                            title="Cấp quyền Admin"
                            onClick={() => handlePromoteToAdmin(user.ID)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        >
                            <Shield className="w-5 h-5" />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Trường hợp không có dữ liệu */}
        {filteredUsers.length === 0 && !loading && (
            <p className="text-center py-8 text-gray-500">Không tìm thấy người dùng nào.</p>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;