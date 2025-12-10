// src/pages/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 🚨 ĐÃ SỬA LỖI IMPORT: Thay thế import 'authAxios' bằng import 'useAuthAxios'
// (Giả định hook này đã được export trong AuthContext.jsx)
import { useAuthAxios } from '../utils/AuthContext'; 

// Chỉ cần API path vì Base URL sẽ được cung cấp bởi useAuthAxios
const API_BASE_PATH = '/admin/users'; 

const UserManagementPage = () => {
    // 🚨 GỌI HOOK: Lấy instance Axios đã được cấu hình và đính kèm token
    const authAxios = useAuthAxios(); 

    // State quản lý danh sách người dùng và phân trang
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10); 
    
    // State bộ lọc và tìm kiếm
    const [filterStatus, setFilterStatus] = useState('ACTIVE'); // TRẠNG THÁI: ACTIVE, BANNED
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState(null);

    // --- Hàm Fetch Dữ liệu Người dùng ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Sử dụng authAxios đã lấy từ hook
            const response = await authAxios.get(API_BASE_PATH, {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                    status: filterStatus,
                    keyword: searchKeyword,
                }
            });

            setUsers(response.data.users || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalItems(response.data.totalItems || 0);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, pageSize, filterStatus, searchKeyword]); // 🚨 QUAN TRỌNG: Thêm authAxios vào dependency array

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- Hàm Khóa Tài khoản (Ban) ---
    const handleBanUser = async (UID, TenTaiKhoan) => {
        const reason = prompt(`Nhập lý do KHÓA tài khoản ${TenTaiKhoan} (ID: ${UID}):`);
        if (!reason) return;

        try {
            setMessage(`Đang khóa tài khoản ${TenTaiKhoan}...`);
            await authAxios.post(`${API_BASE_PATH}/khoa/${UID}`, { LyDo: reason });
            setMessage(`Tài khoản ${TenTaiKhoan} đã bị KHÓA.`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi khóa tài khoản.');
        } finally {
            setMessage(null);
        }
    };

    // --- Hàm Mở khóa Tài khoản (Unban) ---
    const handleUnbanUser = async (UID, TenTaiKhoan) => {
        if (!window.confirm(`Bạn có chắc chắn muốn MỞ KHÓA tài khoản ${TenTaiKhoan} không?`)) return;

        try {
            setMessage(`Đang mở khóa tài khoản ${TenTaiKhoan}...`);
            await authAxios.post(`${API_BASE_PATH}/moKhoa/${UID}`);
            setMessage(`Tài khoản ${TenTaiKhoan} đã được MỞ KHÓA.`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi mở khóa tài khoản.');
        } finally {
            setMessage(null);
        }
    };
    
    // --- Xử lý sự kiện phân trang ---
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // --- Xử lý tìm kiếm ---
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); 
        fetchUsers();
    };

    // --- Render Component ---
    return (
        <div style={styles.container}>
            <h2>Quản Lý Danh Sách Người Dùng</h2>
            
            {/* Bộ lọc và Tìm kiếm */}
            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <label>Trạng thái:</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        style={styles.select}
                    >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="BANNED">Đã Khóa</option>
                    </select>
                </div>

                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên/Email..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.searchButton}>Tìm</button>
                </form>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}

            {loading ? (
                <p style={styles.loading}>Đang tải danh sách...</p>
            ) : (
                <>
                    <p style={styles.summary}>Tổng cộng: {totalItems} người dùng</p>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Tên tài khoản</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.UID}>
                                        <td>{user.UID}</td>
                                        <td>{user.TenTaiKhoan}</td>
                                        <td>{user.Email}</td>
                                        <td>{user.Role}</td>
                                        <td>
                                            <span style={styles.statusBadge[user.TrangThai || 'ACTIVE']}>
                                                {user.TrangThai === 'BANNED' ? 'Đã Khóa' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.NgayTao).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            {user.TrangThai !== 'BANNED' ? (
                                                <button 
                                                    onClick={() => handleBanUser(user.UID, user.TenTaiKhoan)}
                                                    style={styles.actionButton.ban}
                                                    disabled={user.Role === 'Admin'} 
                                                >
                                                    Khóa
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnbanUser(user.UID, user.TenTaiKhoan)}
                                                    style={styles.actionButton.unban}
                                                >
                                                    Mở khóa
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{textAlign: 'center'}}>Không tìm thấy người dùng nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Phân trang */}
                    <div style={styles.pagination}>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            style={styles.pageButton}
                        >
                            Trước
                        </button>
                        <span style={styles.pageInfo}>Trang {currentPage} / {totalPages}</span>
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            style={styles.pageButton}
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Styles cho component ---
const styles = {
    container: { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
    controls: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    select: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    searchForm: { display: 'flex', gap: '5px' },
    input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' },
    searchButton: { padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    message: { color: 'green', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    loading: { textAlign: 'center', padding: '30px' },
    summary: { marginBottom: '15px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' },
    statusBadge: {
        ACTIVE: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '0.9em' },
        BANNED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#dc3545', color: 'white', fontSize: '0.9em' },
    },
    actionButton: {
        ban: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
        unban: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
    },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' },
    pageButton: { padding: '8px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    pageInfo: { fontWeight: 'bold' },
};

export default UserManagementPage;