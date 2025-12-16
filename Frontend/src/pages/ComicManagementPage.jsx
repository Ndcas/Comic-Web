import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAxios } from '../utils/AuthContext';

const ManageComicsPage = () => {
    const authAxios = useAuthAxios();
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [selectedComic, setSelectedComic] = useState(null);
    const [aiAdvice, setAiAdvice] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState(null); 

    const fetchPendingComics = useCallback(async () => {
        setLoading(true);
        try {
            const response = await authAxios.get('/truyen/truyenChuaDuyet');
            setComics(response.data.truyens || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error.response?.data?.error);
        } finally {
            setLoading(false);
        }
    }, [authAxios]);

    useEffect(() => {
        fetchPendingComics();
    }, [fetchPendingComics]);

    const handleViewDetail = async (tid) => {
        setAiAdvice(""); 
        setSelectedChapter(null);
        try {
            const response = await authAxios.get(`/truyen/thongTinTruyenAdmin?TID=${tid}`);
            setSelectedComic(response.data.truyen);
        } catch (error) {
            alert(error.response?.data?.error || "Lỗi tải thông tin truyện");
        }
    };

    const handleViewChapter = async (ctid) => {
        try {
            const response = await authAxios.get(`/truyen/thongTinChuongTruyenAdmin?CTID=${ctid}`);
            setSelectedChapter(response.data.chuongTruyen);
        } catch (error) {
            alert("Không thể tải nội dung chương");
        }
    };

    const getAIAdvice = async (tid) => {
        setLoadingAI(true);
        try {
            const response = await authAxios.get(`/truyen/thamKhaoYKienAIDuyetTruyen?TID=${tid}`);
            setAiAdvice(response.data.result);
        } catch (error) {
            setAiAdvice("AI Gemini hiện không thể phản hồi.");
        } finally {
            setLoadingAI(false);
        }
    };

    const handleAction = async (tid, isApprove) => {
        let lyDo = null;
        if (!isApprove) {
            lyDo = prompt("Nhập lý do từ chối (Ghi chú cho tác giả):");
            if (lyDo === null) return;
        }

        try {
            await authAxios.post('/truyen/duyetTruyen', {
                TID: tid,
                DaDuyet: isApprove ? 1 : 0, 
                LyDoTuChoi: lyDo
            });
            alert(isApprove ? "Đã duyệt và xuất bản truyện!" : "Đã từ chối truyện.");
            setSelectedComic(null);
            fetchPendingComics();
        } catch (error) {
            alert(error.response?.data?.error || "Thao tác thất bại.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.mainTitle}>Quản Trị Hệ Thống</h2>
            
            <div style={styles.whiteBox}>
                <div style={styles.headerRow}>
                    <h3 style={styles.boxTitle}>Quản Lý Danh Sách Truyện</h3>
                    <p style={styles.summaryText}>Số lượng truyện đang chờ: <b>{comics.length}</b></p>
                </div>
                
                <div style={styles.searchBar}>
                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Trạng thái: </label>
                        <select style={styles.select} disabled>
                            <option>Chờ Duyệt (Mặc định)</option>
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <input type="text" placeholder="Tìm kiếm theo Tên truyện..." style={styles.input} />
                        <button style={styles.btnSearch}>🔍 Tìm</button>
                    </div>
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeaderRow}>
                                <th style={styles.th}>TID</th>
                                <th style={styles.th}>Tên Truyện</th>
                                <th style={styles.th}>Tác giả</th>
                                <th style={styles.th}>Trạng thái</th>
                                <th style={styles.th}>Ngày tạo</th>
                                <th style={styles.th}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={styles.tdCenter}>Đang kết nối Database...</td></tr>
                            ) : comics.length > 0 ? (
                                comics.map((comic) => (
                                    <tr key={comic.TID} style={styles.tr}>
                                        <td style={styles.td}>{comic.TID}</td>
                                        <td style={styles.td}><b>{comic.TenTruyen}</b></td>
                                        <td style={styles.td}>{comic.TacGia || 'Chưa rõ'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.statusBadge}>Chờ Duyệt</span>
                                        </td>
                                        <td style={styles.td}>{new Date(comic.NgayTao).toLocaleDateString('vi-VN')}</td>
                                        <td style={styles.td}>
                                            <button onClick={() => handleViewDetail(comic.TID)} style={styles.actionBtn}>👁️ Xem chi tiết</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={styles.tdCenter}>Không tìm thấy truyện nào chờ duyệt.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedComic && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={{margin:0}}>Duyệt truyện: {selectedComic.TenTruyen}</h3>
                            <button onClick={() => setSelectedComic(null)} style={styles.closeBtn}>&times;</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.comicMeta}>
                                <p><b>Mô tả nội dung:</b> {selectedComic.MoTa || 'Không có mô tả.'}</p>
                                <p><b>Danh sách chương:</b> (Nhấn để xem hình ảnh kiểm tra nội dung)</p>
                                <div style={styles.chapterGrid}>
                                    {selectedComic.ChuongTruyens?.map(ch => (
                                        <button key={ch.CTID} onClick={() => handleViewChapter(ch.CTID)} style={styles.chapterBtn}>
                                            Chương {ch.SoChuong}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedChapter && (
                                <div style={styles.imageViewer}>
                                    <p style={{textAlign: 'center', marginBottom: '15px'}}><b>Đang xem: Chương {selectedChapter.SoChuong}</b></p>
                                    <div style={styles.imageScroll}>
                                        {selectedChapter.HinhAnhs?.map(img => (
                                            <img key={img.HAID} src={img.LinkHinh} alt="Nội dung" style={styles.previewImg} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div style={styles.aiBox}>
                                <button onClick={() => getAIAdvice(selectedComic.TID)} style={styles.aiBtn} disabled={loadingAI}>
                                    {loadingAI ? "🤖 Gemini đang đọc truyện..." : "🤖 Tham khảo AI Gemini (Comic Validation)"}
                                </button>
                                {aiAdvice && <div style={styles.aiText}><b>Gemini tư vấn:</b> {aiAdvice}</div>}
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button onClick={() => handleAction(selectedComic.TID, false)} style={styles.rejectBtn}>❌ Từ chối</button>
                            <button onClick={() => handleAction(selectedComic.TID, true)} style={styles.approveBtn}>✅ Duyệt & Xuất bản</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    // 1. Container chính: Đã loại bỏ padding cố định để rộng nhất có thể
    container: { 
        padding: '20px', 
        backgroundColor: '#F4F7FE', 
        minHeight: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxSizing: 'border-box'
    },
    mainTitle: { fontSize: '24px', color: '#2B3674', fontWeight: '700', marginBottom: '20px' },
    
    // 2. Card trắng: Dùng width 100%
    whiteBox: { 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '15px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    boxTitle: { color: '#2B3674', fontSize: '18px', borderBottom: '2px solid #4318FF', paddingBottom: '5px', margin: 0 },
    
    // 3. SearchBar: Để flex-grow để input tự giãn
    searchBar: { display: 'flex', gap: '15px', marginBottom: '20px', width: '100%' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    label: { fontWeight: 'bold', fontSize: '14px' },
    select: { padding: '8px', borderRadius: '8px', border: '1px solid #E0E5F2' },
    inputGroup: { display: 'flex', flex: 1, gap: '10px' },
    input: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E0E5F2' },
    btnSearch: { backgroundColor: '#4318FF', color: 'white', border: 'none', padding: '0 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    
    summaryText: { fontSize: '14px', color: '#707EAE', margin: 0 },
    
    // 4. Bảng: Ép bảng dùng 100% chiều rộng của Card
    tableWrapper: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
    tableHeaderRow: { borderBottom: '1px solid #E9EDF7' },
    th: { padding: '15px', textAlign: 'left', color: '#A3AED0', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #F4F7FE', fontSize: '14px', color: '#2B3674' },
    tr: { transition: '0.2s', ':hover': { backgroundColor: '#F7F9FF' } },
    tdCenter: { padding: '50px', textAlign: 'center', color: '#A3AED0' },
    
    statusBadge: { backgroundColor: '#FFF4E5', color: '#FF9800', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    actionBtn: { color: '#4318FF', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' },
    
    // 5. Modal: Đã tăng width lên 95% để rộng hơn khi duyệt
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', width: '95%', maxWidth: '1400px', borderRadius: '20px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    modalHeader: { padding: '20px', borderBottom: '1px solid #E9EDF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: '#A3AED0' },
    modalBody: { padding: '20px', overflowY: 'auto', flex: 1 },
    
    comicMeta: { marginBottom: '20px', padding: '15px', backgroundColor: '#F4F7FE', borderRadius: '12px' },
    chapterGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
    chapterBtn: { padding: '8px 15px', background: 'white', border: '1px solid #E0E5F2', borderRadius: '8px', cursor: 'pointer' },
    
    imageViewer: { background: '#111', padding: '20px', borderRadius: '15px', marginBottom: '20px', color: '#fff' },
    imageScroll: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', alignItems: 'center' },
    previewImg: { width: 'auto', maxWidth: '100%' },
    
    aiBox: { padding: '20px', background: '#F0F3FF', borderRadius: '15px', border: '1px dashed #4318FF' },
    aiBtn: { width: '100%', padding: '12px', background: '#4318FF', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    aiText: { marginTop: '10px', fontSize: '14px', color: '#2B3674', padding: '10px', backgroundColor: '#fff', borderRadius: '8px' },
    
    modalFooter: { padding: '15px 20px', borderTop: '1px solid #E9EDF7', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    approveBtn: { padding: '10px 25px', background: '#05CD99', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    rejectBtn: { padding: '10px 25px', background: '#EE5D50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ManageComicsPage;