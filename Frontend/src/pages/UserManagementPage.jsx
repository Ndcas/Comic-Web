import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAxios, useAuth } from '../utils/AuthContext'; 

const API_BASE_PATH_NGUOIDUNG = '/nguoidung'; 

const UserManagementPage = () => {
    const authAxios = useAuthAxios(); 
    const { user: adminUser } = useAuth(); 

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10); 
    
    // 1: Hoạt động, 0: Đã Khóa, 'ALL': Tất cả
    const [filterStatus, setFilterStatus] = useState(1); 
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Hàm gọi API và thực hiện Lọc/Phân trang tại Frontend
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Lấy toàn bộ danh sách người dùng từ Backend (Backend không phân trang/lọc)
            const response = await authAxios.get(`${API_BASE_PATH_NGUOIDUNG}/tatCaNguoiDung`);
            
            let allUsers = response.data.nguoiDungs || [];

            // 1. Lọc theo Trạng thái & Từ khóa (Frontend Filter)
            let filteredUsers = allUsers.filter(user => {
                // Lọc theo trạng thái
                const matchesStatus = filterStatus === 'ALL' || user.TrangThai === filterStatus;
                
                // Lọc theo từ khóa (Tên tài khoản hoặc Email)
                const keyword = searchKeyword.toLowerCase();
                const matchesKeyword = !keyword || 
                                       user.TenTaiKhoan?.toLowerCase().includes(keyword) || 
                                       user.Email?.toLowerCase().includes(keyword);
                                       
                return matchesStatus && matchesKeyword;
            });
            
            // 2. Phân trang (Frontend Pagination)
            const count = filteredUsers.length;
            const totalPagesCalculated = Math.ceil(count / pageSize);
            const offset = (currentPage - 1) * pageSize;
            const usersForPage = filteredUsers.slice(offset, offset + pageSize);
            
            setUsers(usersForPage);
            setTotalPages(totalPagesCalculated || 1);
            setTotalItems(count || 0);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, pageSize, filterStatus, searchKeyword, refreshTrigger]); 

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateTrangThai = async (user, trangThai) => {
        // Guard Rail: Ngăn Admin tự khóa mình hoặc khóa Admin khác
        if (trangThai === 0 && (adminUser?.NDID === user.NDID || isUserAdmin(user))) {
            alert('🚫 Lỗi bảo mật: Không thể khóa tài khoản Admin hoặc chính tài khoản của bạn.');
            return false;
        }

        if (trangThai === 0) {
            const reason = prompt(`Nhập lý do KHÓA tài khoản ${user.TenTaiKhoan} (ID: ${user.NDID}):`);
            if (!reason) return false;
        } else if (trangThai === 1) {
            if (!window.confirm(`Bạn có chắc chắn muốn MỞ KHÓA tài khoản ${user.TenTaiKhoan} không?`)) return false;
        }
        
        const actionText = trangThai === 0 ? 'Khóa' : 'Mở khóa';

        try {
            setMessage(`Đang ${actionText} tài khoản ${user.TenTaiKhoan}...`);
            
            await authAxios.post(`${API_BASE_PATH_NGUOIDUNG}/capNhatNguoiDung`, { 
                ndid: user.NDID,
                trangThai: trangThai, 
                // Truyền giá trị điểm hiện tại, bắt buộc do yêu cầu của API Backend cũ
                diem: user.Diem || 0 
            });
            
            setMessage(`Tài khoản ${user.TenTaiKhoan} đã được ${actionText.toUpperCase()}.`);
            setRefreshTrigger(prev => prev + 1);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || `Lỗi khi ${actionText.toLowerCase()} tài khoản.`);
            return false;
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleBanUser = (user) => updateTrangThai(user, 0);
    const handleUnbanUser = (user) => updateTrangThai(user, 1);
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Luôn về trang 1 khi tìm kiếm
        setRefreshTrigger(prev => prev + 1);
    };

    const handleFilterChange = (statusValue) => {
        // Chuyển đổi giá trị string ('ACTIVE', 'BANNED', 'ALL') sang giá trị số (1, 0, 'ALL')
        let status;
        switch (statusValue) {
            case 'ACTIVE':
                status = 1;
                break;
            case 'BANNED':
                status = 0;
                break;
            default:
                status = 'ALL';
        }
        setFilterStatus(status);
        setCurrentPage(1);
    };
    
    // Các hàm định dạng và kiểm tra
    const isCurrentUser = (user) => adminUser && user.NDID === adminUser.NDID;
    const isUserAdmin = (user) => user.isUser === false; 

    const formatTrangThai = (trangThai) => {
        if (trangThai === 0) return 'Đã Khóa';
        if (trangThai === 1) return 'Hoạt động';
        return 'Không xác định';
    }

    const formatRole = (isUser) => {
        return isUser === false ? 'Admin' : 'User';
    }

    const getStatusStyleKey = (trangThai) => {
        return trangThai === 0 ? 'BANNED' : 'ACTIVE';
    }

    return (
        <div style={styles.container}>
            <h2>Quản Lý Danh Sách Người Dùng</h2>
            
            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <label>Trạng thái:</label>
                    <select 
                        value={filterStatus === 1 ? 'ACTIVE' : filterStatus === 0 ? 'BANNED' : 'ALL'} 
                        onChange={(e) => handleFilterChange(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="ACTIVE">Hoạt động (1)</option>
                        <option value="BANNED">Đã Khóa (0)</option>
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
                                <th>NDID</th>
                                <th>Tên tài khoản</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tham gia</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.NDID}>
                                        <td>{user.NDID}</td>
                                        <td>{user.TenTaiKhoan}</td>
                                        <td>{user.Email}</td>
                                        <td>
                                            <span style={styles.roleBadge[formatRole(user.isUser)]}>
                                                {formatRole(user.isUser)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={styles.statusBadge[getStatusStyleKey(user.TrangThai)]}>
                                                {formatTrangThai(user.TrangThai)}
                                            </span>
                                        </td>
                                        <td>{new Date(user.NgayThamGia).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            {isCurrentUser(user) ? (
                                                <span style={{color: '#6c757d', fontWeight: 'bold'}}>🚫 Bạn</span>
                                            ) : isUserAdmin(user) ? (
                                                <span style={{color: '#ffc107', fontWeight: 'bold'}}>👑 Admin</span>
                                            ) : user.TrangThai !== 0 ? (
                                                <button 
                                                    onClick={() => handleBanUser(user)}
                                                    style={styles.actionButton.ban}
                                                >
                                                    Khóa
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnbanUser(user)}
                                                    style={styles.actionButton.unban}
                                                >
                                                    Mở khóa
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Không tìm thấy người dùng nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
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
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left', 
             '& th, & td': { padding: '12px 15px', borderBottom: '1px solid #ddd' },
             '& th': { backgroundColor: '#f3f4f6', fontWeight: '600' }
            },
    
    roleBadge: {
        Admin: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#ffc107', color: 'black', fontSize: '0.9em', fontWeight: '600' },
        User: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#17a2b8', color: 'white', fontSize: '0.9em', fontWeight: '600' },
    },
    
    statusBadge: {
        ACTIVE: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '0.9em' },
        BANNED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#dc3545', color: 'white', fontSize: '0.9em' },
    },
    actionButton: {
        ban: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', transition: 'background-color 0.2s' },
        unban: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', transition: 'background-color 0.2s' },
    },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' },
    pageButton: { padding: '8px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' },
    pageInfo: { fontWeight: 'bold' },
};

export default UserManagementPage;