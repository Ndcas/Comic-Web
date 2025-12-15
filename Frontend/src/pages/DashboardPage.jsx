import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth, useAuthAxios } from '../utils/AuthContext'; 

const API_PATH = '/admin/baoCaoHeThong'; 
const REFRESH_INTERVAL_MS = 300000; 

const DashboardPage = () => {
    const { logout } = useAuth(); 
    const authAxios = useAuthAxios(); 

    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReport = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authAxios.get(API_PATH); 
            setReport(response.data);
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Không thể tải báo cáo hệ thống. Vui lòng kiểm tra lại kết nối.';
            
            if (err.response?.status === 403) {
                alert("Bạn không có quyền truy cập trang này. Đang đăng xuất.");
                logout(); 
                navigate('/admin/login');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [authAxios, logout, navigate]); 

    useEffect(() => {
        fetchReport();
        
        const intervalId = setInterval(fetchReport, REFRESH_INTERVAL_MS); 

        return () => clearInterval(intervalId); 
    }, [fetchReport]); 

    const formatNumber = (num) => (num || 0).toLocaleString('vi-VN');
    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có dữ liệu';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });
    };
    
    if (loading && !report) return <div style={styles.center}>Đang tải Báo cáo Hệ thống...</div>;
    
    if (error && !report) return <div style={{...styles.center, color: '#dc3545', padding: '20px', border: '1px solid #dc3545', backgroundColor: '#ffe6e6', borderRadius: '8px'}}>🚨 Lỗi: {error}</div>;

    if (!report) {
        return <div style={styles.center}>Không có dữ liệu báo cáo để hiển thị.</div>;
    }


    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.headerTitle}>📊 Dashboard Tổng quan Hệ thống</h2>
                <span style={styles.updateTime}>
                    Cập nhật lần cuối: **{formatDate(report.reportTime)}**
                    {loading && <span style={styles.refreshingText}> (Đang làm mới...)</span>}
                </span>
            </header>

            <div style={styles.grid}>
                <Card title="Tổng số Người dùng" metric={formatNumber(report.numOfUsers)} color="#007bff" icon="👤" />
                <Card title="Tổng số Truyện" metric={formatNumber(report.numOfComics)} color="#17a2b8" icon="📚" />
                <Card title="Tổng số Chương" metric={formatNumber(report.numOfChapters)} color="#28a745" icon="📖" />
                
                <Card title="Truyện Đã Duyệt" metric={formatNumber(report.verifiedComics)} color="#28a745" icon="✅" />
                <Card title="Truyện Chờ Duyệt" metric={formatNumber(report.unverifiedComics)} color="#ffc107" icon="⏳" />
                <Card title="Truyện Bị Từ Chối" metric={formatNumber(report.rejectedComics)} color="#dc3545" icon="❌" />
                
                <Card title="Báo cáo Truyện chưa xử lý" metric={formatNumber(report.unprocessedComicReports)} color="#ff5722" icon="⚠️" />
                <Card title="Báo cáo Bình luận chưa xử lý" metric={formatNumber(report.unprocessedCommentReports)} color="#ff5722" icon="💬" />
                
                <Card title="Tổng Lợi nhuận (Điểm)" metric={formatNumber(report.totalProfitPoints || 0)} color="#4c51bf" icon="💰" />
            </div>
            
            <div style={styles.dataSection}>
                <h3>Dữ liệu Lợi nhuận & Lượt xem (30 Ngày)</h3>
                <p style={styles.subHeader}>Dữ liệu thô để vẽ biểu đồ/đồ thị</p>
                
                <div style={styles.dataContainer}>
                    <DataBox title="Lợi nhuận (Điểm) theo ngày" data={report.profitPointsByDays} />
                    <DataBox title="Lượt xem theo ngày" data={report.viewsByDays} />
                </div>
                
                <button onClick={logout} style={styles.logoutButton}>Đăng Xuất</button>
            </div>
            
        </div>
    );
};

const Card = ({ title, metric, color, icon }) => (
    <div style={{...styles.card, borderLeft: `5px solid ${color}`}}>
        <div style={styles.cardHeader}>
            <span style={{...styles.cardIcon, backgroundColor: color}}>{icon}</span>
            <h4 style={{color: '#4a5568', margin: 0, fontSize: '1em'}}>{title}</h4>
        </div>
        <p style={styles.metric}>{metric}</p>
    </div>
);

const DataBox = ({ title, data }) => {
    const isDataEmpty = !data || Object.keys(data).length === 0;

    return (
        <div style={styles.dataBox}>
            <h4 style={styles.dataBoxTitle}>{title}</h4>
            {isDataEmpty ? (
                <p style={{color: '#777'}}>Không có dữ liệu trong 30 ngày qua.</p>
            ) : (
                <pre style={styles.preCode}>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
};


const styles = {
    container: { padding: '20px 40px', backgroundColor: '#eef2f7', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4c51bf', paddingBottom: '15px', marginBottom: '35px' },
    headerTitle: { color: '#1a202c', fontSize: '2em' },
    updateTime: { fontSize: '0.9em', color: '#6c757d', fontStyle: 'italic' },
    refreshingText: { color: '#4c51bf', marginLeft: '5px', fontWeight: 'bold' },
    subHeader: { color: '#718096', fontSize: '0.9em', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
    card: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)', textAlign: 'left', transition: 'transform 0.2s', position: 'relative' },
    cardHeader: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
    cardIcon: { marginRight: '10px', padding: '5px 8px', borderRadius: '5px', color: 'white', fontWeight: 'bold', fontSize: '1.2em' },
    metric: { fontSize: '2.5em', fontWeight: '700', margin: '0', color: '#343a40' },
    dataSection: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)' },
    dataContainer: { display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '15px' },
    dataBox: { flex: 1, minWidth: '350px', backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' },
    dataBoxTitle: { color: '#2d3748', borderBottom: '1px dashed #cbd5e0', paddingBottom: '10px', marginBottom: '15px' },
    preCode: { whiteSpace: 'pre-wrap', overflowX: 'auto', fontSize: '0.85em', maxHeight: '400px', backgroundColor: '#edf2f7', padding: '10px', borderRadius: '4px', border: 'none' },
    center: { textAlign: 'center', marginTop: '20vh', fontSize: '1.5em', fontWeight: '500' },
    logoutButton: { 
        marginTop: '40px', 
        padding: '12px 25px', 
        backgroundColor: '#dc3545', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    }
};

export default DashboardPage;