import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAxios } from '../utils/AuthContext'; 

const API_BASE_PATH = '/admin/comics'; 

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

    const fetchComics = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authAxios.get(API_BASE_PATH, {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                    status: filterStatus,
                    keyword: searchKeyword,
                }
            });

            setComics(response.data.comics || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalItems(response.data.totalItems || 0);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách truyện.');
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, pageSize, filterStatus, searchKeyword]); 

    useEffect(() => {
        fetchComics();
    }, [fetchComics]);

    
    const handleVerifyComic = async (TID) => {
        if (!window.confirm(`Bạn có chắc chắn muốn DUYỆT truyện ID: ${TID} không?`)) return;

        try {
            setMessage(`Đang duyệt truyện ID: ${TID}...`);
            await authAxios.post(`${API_BASE_PATH}/duyet/${TID}`);
            setMessage(`Truyện ID: ${TID} đã được duyệt thành công!`);
            fetchComics();
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi duyệt truyện.');
        } finally {
            setMessage(null);
        }
    };

    
    const handleRejectComic = async (TID) => {
        const reason = prompt(`Nhập lý do TỪ CHỐI truyện ID: ${TID}:`);
        if (!reason) return;

        try {
            setMessage(`Đang từ chối truyện ID: ${TID}...`);
            await authAxios.post(`${API_BASE_PATH}/tuChoi/${TID}`, { LyDo: reason });
            setMessage(`Truyện ID: ${TID} đã bị từ chối.`);
            fetchComics();
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi từ chối truyện.');
        } finally {
            setMessage(null);
        }
    };
    
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); 
        
        fetchComics(); 
    };

    return (
        <div style={styles.container}>
            <h2>Quản Lý Danh Sách Truyện</h2>
            
            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <label>Trạng thái:</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        style={styles.select}
                    >
                        <option value="UNVERIFIED">Chờ Duyệt</option>
                        <option value="VERIFIED">Đã Duyệt</option>
                        <option value="REJECTED">Đã Từ Chối</option>
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
                    <button type="submit" style={styles.searchButton}>Tìm</button>
                </form>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}

            {loading ? (
                <p style={styles.loading}>Đang tải danh sách...</p>
            ) : (
                <>
                    <p style={styles.summary}>Tổng cộng: {totalItems} truyện</p>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>TID</th>
                                <th>Tên Truyện</th>
                                <th>Tác giả</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comics.length > 0 ? (
                                comics.map((comic) => (
                                    <tr key={comic.TID}>
                                        <td>{comic.TID}</td>
                                        <td>{comic.TenTruyen}</td>
                                        <td>{comic.TenTaiKhoanTacGia || 'N/A'}</td>
                                        <td>
                                            <span style={styles.statusBadge[comic.TrangThai || 'UNVERIFIED']}>
                                                {comic.TrangThai === 'VERIFIED' ? 'Đã Duyệt' : comic.TrangThai === 'REJECTED' ? 'Từ Chối' : 'Chờ Duyệt'}
                                            </span>
                                        </td>
                                        <td>{new Date(comic.NgayTao).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            {comic.TrangThai === 'UNVERIFIED' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleVerifyComic(comic.TID)}
                                                        style={styles.actionButton.verify}
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectComic(comic.TID)}
                                                        style={styles.actionButton.reject}
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}
                                            {(comic.TrangThai === 'VERIFIED' || comic.TrangThai === 'REJECTED') && (
                                                <button style={styles.actionButton.view}>Chi tiết</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>Không tìm thấy truyện nào.</td></tr>
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
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    statusBadge: {
        UNVERIFIED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#ffc107', color: 'black', fontSize: '0.9em' },
        VERIFIED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '0.9em' },
        REJECTED: { padding: '5px 10px', borderRadius: '15px', backgroundColor: '#dc3545', color: 'white', fontSize: '0.9em' },
    },
    actionButton: {
        verify: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
        reject: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
        view: { padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }
    },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' },
    pageButton: { padding: '8px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    pageInfo: { fontWeight: 'bold' }
};

export default ComicManagementPage;