import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAxios } from '../utils/AuthContext'; 

const API_BASE_PATH_BAOCAO = '/baocao'; 

const ReportManagementPage = () => {
    const authAxios = useAuthAxios(); 

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10); 
    
    const [filterStatus, setFilterStatus] = useState('UNPROCESSED'); 
    const [filterType, setFilterType] = useState('ALL'); 
    const [message, setMessage] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        let allUnprocessedReports = [];

        if (filterStatus === 'PROCESSED') {
            setReports([]);
            setTotalPages(1);
            setTotalItems(0);
            setLoading(false);
            setError("LƯU Ý: Backend hiện chưa cung cấp API để lấy danh sách báo cáo ĐÃ XỬ LÝ.");
            return;
        }

        try {
            const resComment = authAxios.get(`${API_BASE_PATH_BAOCAO}/baoCaoBinhLuanChuaXuLy`);
            
            const resComic = authAxios.get(`${API_BASE_PATH_BAOCAO}/baoCaoTruyenChuaXuLy`);
            
            const [commentResponse, comicResponse] = await Promise.all([resComment, resComic]);

            const commentReports = (commentResponse.data.baoCaoBinhLuans || []).map(r => ({
                ...r,
                ReportID: r.BCBLID, 
                ReportType: 'COMMENT',
                TrangThai: 'UNPROCESSED',
                TenTaiKhoanNguoiBaoCao: r.NguoiBaoCao?.TenTaiKhoan, 
                NoiDungViPham: r.LyDo, 
                NgayBaoCao: r.NgayTao 
            }));
            
            const comicReports = (comicResponse.data.baoCaoTruyens || []).map(r => ({
                ...r,
                ReportID: r.BCTID, 
                ReportType: 'COMIC',
                TrangThai: 'UNPROCESSED',
                TenTaiKhoanNguoiBaoCao: r.NguoiBaoCao?.TenTaiKhoan,
                NoiDungViPham: r.LyDo, 
                NgayBaoCao: r.NgayTao
            }));

            allUnprocessedReports = [...commentReports, ...comicReports];

            let filteredReports = allUnprocessedReports.filter(report => {
                const matchesType = filterType === 'ALL' || report.ReportType === filterType;
                return matchesType;
            });
            
            const count = filteredReports.length;
            const totalPagesCalculated = Math.ceil(count / pageSize);
            const offset = (currentPage - 1) * pageSize;
            const reportsForPage = filteredReports.slice(offset, offset + pageSize);
            
            setReports(reportsForPage);
            setTotalPages(totalPagesCalculated || 1);
            setTotalItems(count || 0);
            setError(null); 

        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi tải danh sách báo cáo từ các API khác nhau.');
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, pageSize, filterStatus, filterType, refreshTrigger]); 

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleProcessReport = async (report) => {
        const { ReportID, ReportType } = report;

        const reason = prompt(`Xử lý báo cáo ${ReportType} ID ${ReportID}.\n\nNhập mode xử lý (0: Bỏ qua, 1: Xóa nội dung, 2: Xóa nội dung & Chặn người dùng):`);
        
        if (reason === null || !['0', '1', '2'].includes(reason)) {
            if (reason !== null) alert('Mode xử lý không hợp lệ. Vui lòng nhập 0, 1, hoặc 2.');
            return;
        }

        const mode = parseInt(reason, 10);
        
        try {
            setMessage(`Đang xử lý báo cáo ID: ${ReportID} với mode ${mode}...`);
            
            let url = '';
            let payload = {};

            if (ReportType === 'COMMENT') {
                url = `${API_BASE_PATH_BAOCAO}/xuLyBaoCaoBinhLuan`;
                payload = { BCBLID: ReportID, mode }; 
            } else if (ReportType === 'COMIC') {
                url = `${API_BASE_PATH_BAOCAO}/xuLyBaoCaoTruyen`;
                payload = { BCTID: ReportID, mode }; 
            } else {
                throw new Error("Loại báo cáo không xác định.");
            }

            await authAxios.post(url, payload); 

            setMessage(`Báo cáo ID: ${ReportID} (${ReportType}) đã được xử lý (Mode: ${mode}).`);
            
            setRefreshTrigger(prev => prev + 1); 
            
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi xử lý báo cáo.');
        } finally {
            setTimeout(() => setMessage(null), 3000); 
        }
    };
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleViewDetail = (ReportID, ReportType) => {
        alert(`Chi tiết xử lý (Chức năng chưa triển khai): Xem nội dung đã được xử lý cho ${ReportType} ID: ${ReportID}`);
    }

    const formatTrangThai = (trangThai) => {
        return trangThai === 'PROCESSED' ? 'Đã Xử Lý' : 'Chưa Xử Lý';
    }
    
    const formatReportType = (type) => {
        return type === 'COMIC' ? 'Truyện' : 'Bình luận';
    }

    return (
        <div style={styles.container}>
            <h2>Quản Lý Báo Cáo Vi Phạm ({formatTrangThai(filterStatus)})</h2>
            
            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <label>Trạng thái:</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                        style={styles.select}
                    >
                        <option value="UNPROCESSED">Chưa Xử Lý</option>
                        <option value="PROCESSED">Đã Xử Lý (Không khả dụng)</option>
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
                                                {formatReportType(report.ReportType)}
                                            </span>
                                        </td>
                                        <td>{report.NoiDungViPham}</td>
                                        <td>{report.TenTaiKhoanNguoiBaoCao || 'N/A'}</td>
                                        <td>{new Date(report.NgayBaoCao).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <span style={styles.statusBadge[report.TrangThai]}>
                                                {formatTrangThai(report.TrangThai)}
                                            </span>
                                        </td>
                                        <td>
                                            {report.TrangThai === 'UNPROCESSED' ? (
                                                <button 
                                                    onClick={() => handleProcessReport(report)}
                                                    style={styles.actionButton.process}
                                                >
                                                    Xử lý (Mode)
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleViewDetail(report.ReportID, report.ReportType)}
                                                    style={styles.actionButton.view}
                                                >
                                                    Chi tiết xử lý
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{textAlign: 'center'}}>Không tìm thấy báo cáo nào phù hợp với bộ lọc.</td></tr>
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
    controls: { display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    select: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    error: { color: 'red', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    message: { color: 'green', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
    loading: { textAlign: 'center', padding: '30px' },
    summary: { marginBottom: '15px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' },
    typeBadge: {
        COMIC: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#007bff', color: 'white', fontSize: '0.8em', fontWeight: '600' },
        COMMENT: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#6c757d', color: 'white', fontSize: '0.8em', fontWeight: '600' },
    },
    statusBadge: {
        UNPROCESSED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#ffc107', color: 'black', fontSize: '0.9em', fontWeight: '600' },
        PROCESSED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '0.9em', fontWeight: '600' },
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