import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth, useAuthAxios } from '../utils/AuthContext'; 

const API_PATH = '/admin/baoCaoHeThong'; 

const DashboardPage = () => {
    const { logout } = useAuth(); 
    
    const authAxios = useAuthAxios(); 

    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authAxios.get(API_PATH); 
            setReport(response.data);
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Không thể tải báo cáo hệ thống. Vui lòng kiểm tra lại kết nối.';
            setError(errorMessage);

            if (err.response?.status === 403) {
                alert("Bạn không có quyền truy cập trang này.");
                logout(); 
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
        const intervalId = setInterval(fetchReport, 300000); 

        return () => clearInterval(intervalId); 
    }, [authAxios]); 

    if (loading) return <div style={styles.center}>Đang tải Báo cáo Hệ thống...</div>;
    if (error && !report) return <div style={{...styles.center, color: 'red'}}>Lỗi: {error}</div>;

    const formatNumber = (num) => (num || 0).toLocaleString('vi-VN');
    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

    if (!report) {
           return <div style={styles.center}>Không có dữ liệu báo cáo để hiển thị.</div>;
    }


    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.headerTitle}>📊 Dashboard Tổng quan Hệ thống</h2>
                <span style={styles.updateTime}>Cập nhật: {formatDate(report.reportTime)}</span>
            </header>

            <div style={styles.grid}>
                <Card title="Tổng số Người dùng" metric={formatNumber(report.numOfUsers)} color="#007bff" />
                <Card title="Tổng số Truyện" metric={formatNumber(report.numOfComics)} color="#17a2b8" />
                <Card title="Tổng số Chương" metric={formatNumber(report.numOfChapters)} color="#28a745" />
                <Card title="Truyện Đã Duyệt" metric={formatNumber(report.verifiedComics)} color="#28a745" />
                <Card title="Truyện Chờ Duyệt" metric={formatNumber(report.unverifiedComics)} color="#ffc107" />
                <Card title="Truyện Bị Từ Chối" metric={formatNumber(report.rejectedComics)} color="#dc3545" />
                <Card title="Báo cáo Truyện chưa xử lý" metric={formatNumber(report.unprocessedComicReports)} color="#ff5722" />
                <Card title="Báo cáo Bình luận chưa xử lý" metric={formatNumber(report.unprocessedCommentReports)} color="#ff5722" />
            </div>

            <div style={styles.dataSection}>
                <h3>Dữ liệu Lợi nhuận & Lượt xem (30 Ngày)</h3>
                <div style={styles.dataContainer}>
                    <DataBox title="Lợi nhuận (Điểm)" data={report.profitPointsByDays} />
                    <DataBox title="Lượt xem" data={report.viewsByDays} />
                </div>
                
                <button onClick={logout} style={styles.logoutButton}>Đăng Xuất</button>
            </div>
            
        </div>
    );
};

const Card = ({ title, metric, color }) => (
    <div style={{...styles.card, borderLeft: `5px solid ${color}`}}>
        <h4 style={{color: color}}>{title}</h4>
        <p style={styles.metric}>{metric}</p>
    </div>
);

const DataBox = ({ title, data }) => (
    <div style={styles.dataBox}>
        <h4>{title}</h4>
        <pre style={styles.preCode}>{JSON.stringify(data, null, 2)}</pre>
    </div>
);


const styles = {
    container: { padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '30px' },
    headerTitle: { color: '#343a40' },
    updateTime: { fontSize: '0.9em', color: '#6c757d' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)', textAlign: 'left' },
    metric: { fontSize: '2em', fontWeight: 'bold', margin: '10px 0 0 0', color: '#343a40' },
    dataSection: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' },
    dataContainer: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' },
    dataBox: { flex: 1, minWidth: '300px', backgroundColor: '#f4f7f6', padding: '15px', borderRadius: '6px' },
    preCode: { whiteSpace: 'pre-wrap', overflowX: 'auto', fontSize: '0.8em', maxHeight: '300px' },
    center: { textAlign: 'center', marginTop: '20vh', fontSize: '1.2em' },
    logoutButton: { marginTop: '30px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default DashboardPage;