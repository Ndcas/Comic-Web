import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAxios } from '../utils/AuthContext'; 



const API_UNVERIFIED_COMICS_PATH = '/truyen/truyenChuaDuyet'; 
const API_VERIFY_REJECT_COMIC_PATH = '/truyen/duyetTruyen';

const ComicManagementPage = () => {
    const authAxios = useAuthAxios(); 

    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10); 
    
    const [filterStatus, setFilterStatus] = useState('UNVERIFIED');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState(null);
    
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    const fetchComics = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        let apiPath = '';

        if (filterStatus === 'UNVERIFIED') {
            apiPath = API_UNVERIFIED_COMICS_PATH; 
        } else {
            setError(`Chức năng lọc theo trạng thái "${filterStatus}" chưa được hỗ trợ bởi Backend.`);
            setLoading(false);
            setComics([]);
            return; 
        }
        
        
        const params = {
            page: currentPage,
            limit: pageSize,
          
            keyword: searchKeyword.trim(), 
        };
        
      0
        const query = Object.keys(params)
            .filter(key => params[key] && params[key] !== '') 
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        const fullApiPath = query ? `${apiPath}?${query}` : apiPath;
        // ----------------------------------------------------

        try {
            const response = await authAxios.get(fullApiPath);
            
           
            const fetchedComics = response.data.truyens || response.data.data || response.data || []; 
            const total = response.data.totalItems || fetchedComics.length || 0;
            const totalPgs = response.data.totalPages || 1;

            setComics(fetchedComics); 
            setTotalItems(total);
            setTotalPages(totalPgs); 
            
        } catch (err) {
           
            const status = err.response?.status;
            let errorMessage = `Lỗi tải truyện từ ${fullApiPath}.`;

            if (status === 404) {
                errorMessage = `Lỗi 404: Không tìm thấy đường dẫn ${fullApiPath}. Vui lòng kiểm tra lại Base URL và Router Backend.`;
            } else if (status === 401 || status === 403) {
                errorMessage = `Lỗi xác thực (401/403): Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập.`;
            } else if (err.response?.data?.error) {
                errorMessage = `Backend Error: ${err.response.data.error}`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, pageSize, filterStatus, searchKeyword, refreshTrigger]);

    useEffect(() => {
        fetchComics();
    }, [fetchComics]);

    useEffect(() => {
        if (currentPage > totalPages && currentPage > 1 && !loading) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage, loading]);

    
    const handleVerifyComic = async (TID) => {
        if (!window.confirm(`Bạn có chắc chắn muốn DUYỆT truyện ID: ${TID} không?`)) return;

        try {
            setMessage(`Đang duyệt truyện ID: ${TID}...`);
            await authAxios.post(API_VERIFY_REJECT_COMIC_PATH, { 
                TID: TID, 
                DaDuyet: 1
            }); 
            setMessage(`Truyện ID: ${TID} đã được duyệt thành công!`);
            setRefreshTrigger(prev => prev + 1); 
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi duyệt truyện.');
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    
    const handleRejectComic = async (TID) => {
        const reason = prompt(`Nhập lý do TỪ CHỐI truyện ID: ${TID}:`);
        if (!reason) return;

        try {
            setMessage(`Đang từ chối truyện ID: ${TID}...`);
            await authAxios.post(API_VERIFY_REJECT_COMIC_PATH, { 
                TID: TID, 
                DaDuyet: 0,
                LyDoTuChoi: reason 
            }); 
            setMessage(`Truyện ID: ${TID} đã bị từ chối.`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi từ chối truyện.');
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };
    
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    
    const handleSearch = (e) => {
        e.preventDefault();
       
        if (currentPage !== 1) {
            setCurrentPage(1); 
        } else {
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'VERIFIED': return 'Đã Duyệt';
            case 'REJECTED': return 'Đã Từ Chối';
            default: return 'Chờ Duyệt';
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Quản Lý Danh Sách Truyện</h2>
            
            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <label style={{fontWeight: '500'}}>Trạng thái:</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        style={styles.select}
                    >
                        <option value="UNVERIFIED">Chờ Duyệt (Mặc định)</option>
                    </select>
                </div>

                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên truyện..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.searchButton}>🔎 Tìm</button>
                </form>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}

            {loading ? (
                <p style={styles.loading}>Đang tải danh sách...</p>
            ) : (
                <>
                    <p style={styles.summary}>Tổng cộng: {totalItems} truyện được tìm thấy</p>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>TID</th>
                                <th style={styles.th}>Tên Truyện</th>
                                <th style={styles.th}>Tác giả</th>
                                <th style={styles.th}>Trạng thái</th>
                                <th style={styles.th}>Ngày tạo</th>
                                <th style={styles.thAction}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comics.length > 0 ? (
                                comics.map((comic) => (
                                    <tr key={comic.TID} style={styles.tableRow}>
                                        <td style={styles.td}>{comic.TID}</td>
                                        <td style={styles.tdTitle}>{comic.TenTruyen}</td>
                                        <td style={styles.td}>{comic.TenTaiKhoanTacGia || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.statusBadge[comic.TrangThai || 'UNVERIFIED']}>
                                                {getStatusText(comic.TrangThai)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{new Date(comic.NgayTao).toLocaleDateString('vi-VN')}</td>
                                        <td style={styles.tdAction}>
                                            {comic.TrangThai === 'UNVERIFIED' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleVerifyComic(comic.TID)}
                                                        style={{...styles.actionButton, backgroundColor: '#28a745'}}
                                                        disabled={loading}
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectComic(comic.TID)}
                                                        style={{...styles.actionButton, backgroundColor: '#dc3545'}}
                                                        disabled={loading}
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}
                                            {(comic.TrangThai === 'VERIFIED' || comic.TrangThai === 'REJECTED') && (
                                                <button style={{...styles.actionButton, backgroundColor: '#17a2b8'}}>Chi tiết</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '20px'}}>Không tìm thấy truyện nào với bộ lọc này.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Bật lại Phân trang nếu Backend đã hỗ trợ phân trang thực sự */}
                    {totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1 || loading}
                                style={styles.pageButton}
                            >
                                <span role="img" aria-label="previous">⬅️</span> Trước
                            </button>
                            <span style={styles.pageInfo}>Trang {currentPage} / {totalPages}</span>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages || loading}
                                style={styles.pageButton}
                            >
                                Sau <span role="img" aria-label="next">➡️</span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' },
    title: { borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' },
    controls: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' },
    searchForm: { display: 'flex', gap: '5px' },
    input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', width: '300px' },
    searchButton: { padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
    error: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #f5c6cb' },
    message: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #c3e6cb' },
    loading: { textAlign: 'center', padding: '40px', fontSize: '1.2em' },
    summary: { marginBottom: '15px', fontWeight: 'bold', color: '#495057' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', marginTop: '15px' },
    tableHeader: { backgroundColor: '#e9ecef' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #dee2e6' },
    thAction: { textAlign: 'center', padding: '15px', borderBottom: '2px solid #dee2e6' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', backgroundColor: '#fdfdfd' },
    tdTitle: { padding: '15px', borderBottom: '1px solid #f1f1f1', backgroundColor: '#fdfdfd', fontWeight: '600', color: '#007bff' },
    tdAction: { padding: '15px', borderBottom: '1px solid #f1f1f1', backgroundColor: '#fdfdfd', textAlign: 'center' },
    statusBadge: {
        UNVERIFIED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#ffc107', color: 'black', fontSize: '0.85em', fontWeight: '600' },
        VERIFIED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '0.85em', fontWeight: '600' },
        REJECTED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#dc3545', color: 'white', fontSize: '0.85em', fontWeight: '600' },
    },
    actionButton: {
        padding: '6px 12px',
        margin: '0 4px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'opacity 0.2s',
    },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', gap: '20px' },
    pageButton: { padding: '8px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.2s' },
    pageInfo: { fontWeight: 'bold', color: '#343a40' }
};

export default ComicManagementPage;