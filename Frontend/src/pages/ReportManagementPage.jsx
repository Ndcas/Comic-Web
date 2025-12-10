// src/pages/ReportManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 🚨 ĐÃ SỬA LỖI IMPORT: Thay thế import 'authAxios' bằng import 'useAuthAxios'
import { useAuthAxios } from '../utils/AuthContext'; 

// Truy cập trực tiếp biến môi trường Vite (không cần thiết nếu dùng base URL từ authAxios, 
// nhưng giữ lại để API_BASE_PATH được xác định rõ ràng)
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 
// Giả định base API cho quản lý báo cáo, tuy nhiên trong authAxios đã có base URL rồi.
// Tốt nhất chỉ nên dùng path /admin/reports
const API_BASE_PATH = '/admin/reports'; 

const ReportManagementPage = () => {
    // 🚨 GỌI HOOK: Lấy instance Axios đã được cấu hình và đính kèm token
    const authAxios = useAuthAxios(); 

    // State quản lý danh sách báo cáo
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10); 
    
    // State bộ lọc và tìm kiếm
    const [filterStatus, setFilterStatus] = useState('UNPROCESSED'); // TRẠNG THÁI: UNPROCESSED, PROCESSED
    const [filterType, setFilterType] = useState('ALL'); // TYPE: COMIC, COMMENT, ALL
    const [message, setMessage] = useState(null);

    // --- Hàm Fetch Dữ liệu Báo cáo ---
    // API: GET /admin/reports?page=X&status=Y&type=Z
    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Sử dụng authAxios đã lấy từ hook
            const response = await authAxios.get(API_BASE_PATH, {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                    status: filterStatus,
                    type: filterType === 'ALL' ? undefined : filterType, // Gửi type nếu không phải ALL
                }
            });

            // Giả định backend trả về: { reports: [], totalPages: N, totalItems: M }
            setReports(response.data.reports || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalItems(response.data.totalItems || 0);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách báo cáo.');
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, pageSize, filterStatus, filterType]); // 🚨 QUAN TRỌNG: Thêm authAxios vào dependency array

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // --- Hàm Xử lý Báo cáo (Đánh dấu đã xử lý) ---
    // API: POST /admin/reports/xuLy/:ReportID
    const handleProcessReport = async (ReportID, ReportType) => {
        if (!window.confirm(`Bạn có chắc chắn muốn đánh dấu báo cáo ${ReportID} (${ReportType}) là ĐÃ XỬ LÝ không?`)) return;

        try {
            setMessage(`Đang xử lý báo cáo ID: ${ReportID}...`);
            await authAxios.post(`${API_BASE_PATH}/xuLy/${ReportID}`);
            setMessage(`Báo cáo ID: ${ReportID} đã được đánh dấu ĐÃ XỬ LÝ.`);
            fetchReports(); // Tải lại danh sách
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi xử lý báo cáo.');
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

    // --- Xử lý thay đổi bộ lọc
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1); // Luôn reset về trang 1 khi thay đổi bộ lọc
    };
    
    // --- Render Component ---
    return (
        <div style={styles.container}>
            <h2>Quản Lý Báo Cáo Vi Phạm ({filterStatus === 'UNPROCESSED' ? 'Chưa Xử Lý' : 'Đã Xử Lý'})</h2>
            
            {/* Bộ lọc */}
            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <label>Trạng thái:</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                        style={styles.select}
                    >
                        <option value="UNPROCESSED">Chưa Xử Lý</option>
                        <option value="PROCESSED">Đã Xử Lý</option>
                    </select>
                </div>
                
                <div style={styles.filterGroup}>
                    <label>Loại báo cáo:</label>
                    <select 
                        value={filterType} 
                        onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="COMIC">Truyện</option>
                        <option value="COMMENT">Bình luận</option>
                    </select>
                </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}

            {loading ? (
                <p style={styles.loading}>Đang tải danh sách báo cáo...</p>
            ) : (
                <>
                    <p style={styles.summary}>Tổng cộng: {totalItems} báo cáo</p>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Loại</th>
                                <th>Nội dung báo cáo</th>
                                <th>Người báo cáo</th>
                                <th>Ngày báo cáo</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <tr key={report.ReportID}>
                                        <td>{report.ReportID}</td>
                                        <td>
                                            <span style={styles.typeBadge[report.ReportType]}>
                                                {report.ReportType === 'COMIC' ? 'Truyện' : 'Bình luận'}
                                            </span>
                                        </td>
                                        <td>{report.NoiDungViPham}</td>
                                        <td>{report.TenTaiKhoanNguoiBaoCao || 'N/A'}</td>
                                        <td>{new Date(report.NgayBaoCao).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <span style={styles.statusBadge[report.TrangThai]}>
                                                {report.TrangThai === 'PROCESSED' ? 'Đã Xử Lý' : 'Chưa Xử Lý'}
                                            </span>
                                        </td>
                                        <td>
                                            {report.TrangThai === 'UNPROCESSED' ? (
                                                <button 
                                                    onClick={() => handleProcessReport(report.ReportID, report.ReportType)}
                                                    style={styles.actionButton.process}
                                                >
                                                    Đánh dấu đã xử lý
                                                </button>
                                            ) : (
                                                <button style={styles.actionButton.view}>Chi tiết xử lý</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{textAlign: 'center'}}>Không tìm thấy báo cáo nào phù hợp với bộ lọc.</td></tr>
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
    controls: { display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    select: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    error: { color: 'red', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    message: { color: 'green', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    loading: { textAlign: 'center', padding: '30px' },
    summary: { marginBottom: '15px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' },
    typeBadge: {
        COMIC: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#007bff', color: 'white', fontSize: '0.8em' },
        COMMENT: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#6c757d', color: 'white', fontSize: '0.8em' },
    },
    statusBadge: {
        UNPROCESSED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#ffc107', color: 'black', fontSize: '0.9em' },
        PROCESSED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '0.9em' },
    },
    actionButton: {
        process: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
        view: { padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }
    },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' },
    pageButton: { padding: '8px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    pageInfo: { fontWeight: 'bold' },
};

export default ReportManagementPage;