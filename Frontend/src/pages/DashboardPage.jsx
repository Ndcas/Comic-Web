import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAuthAxios } from '../utils/AuthContext'; 
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

const DashboardPage = () => {
    const { logout } = useAuth(); 
    const authAxios = useAuthAxios(); 
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async (force = false) => {
        setLoading(true);
        try {
            const url = force ? '/admin/baoCaoHeThong?force=true' : '/admin/baoCaoHeThong';
            const response = await authAxios.get(url); 
            const rawData = response.data;

            const d = rawData.report ? rawData.report : rawData;

            const formatDataForChart = (arr) => (arr || []).map(item => ({
                ...item,
                displayDate: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
            }));

            setReport({
                ...d,
                viewsChartData: formatDataForChart(d.viewsByDays),
                profitChartData: formatDataForChart(d.profitPointsByDays)
            });
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    }, [authAxios, logout, navigate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading && !report) return <div style={styles.center}>Đang tải dữ liệu báo cáo...</div>;

    return (
        <div style={styles.container}>
            {/* Header section */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.headerTitle}>Quản Trị Hệ Thống</h2>
                    <p style={styles.subTitle}>Thời gian báo cáo: {new Date(report?.reportTime).toLocaleString('vi-VN')}</p>
                </div>
                <div style={styles.actionGroup}>
                    <button onClick={() => fetchReport(true)} style={styles.refreshBtn}>🔄 Làm mới</button>
                    <button onClick={logout} style={styles.logoutBtn}>🚪 Đăng xuất</button>
                </div>
            </div>
            
            {/* First Metrics Grid */}
            <div style={styles.grid}>
                <Card title="Người dùng hoạt động" metric={report?.numOfUsers} color="#4318FF" icon="👤" />
                <Card title="Tổng số chương" metric={report?.numOfChapters} color="#2B3674" icon="📖" />
                <Card title="Truyện đã duyệt" metric={report?.verifiedComics} color="#05CD99" icon="✅" />
                <Card title="Truyện chờ duyệt" metric={report?.unverifiedComics} color="#FFB547" icon="⏳" />
            </div>

            {/* Second Metrics Grid */}
            <div style={{...styles.grid, marginTop: '20px'}}>
                <Card title="Truyện bị từ chối" metric={report?.rejectedComics} color="#EE5D50" icon="❌" />
                <Card title="Báo cáo truyện" metric={report?.unprocessedComicReports} color="#E31A1A" icon="⚠️" />
                <Card title="Báo cáo bình luận" metric={report?.unprocessedCommentReports} color="#E31A1A" icon="💬" />
                {/* Thêm một card trống hoặc card khác để giữ grid 4 cột cân đối nếu cần */}
                <div style={{visibility: 'hidden'}}><Card title="" metric={0} color="#fff" icon="" /></div>
            </div>

            {/* Charts Section */}
            <div style={styles.chartsWrapper}>
                <div style={styles.chartBox}>
                    <h3 style={styles.chartTitle}>Thống kê Lượt xem (30 ngày)</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report?.viewsChartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                                <XAxis dataKey="displayDate" tick={{fontSize: 12, fill: '#A3AED0'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#A3AED0'}} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.1)'}} />
                                <Area type="monotone" dataKey="views" name="Lượt xem" stroke="#4318FF" fill="url(#colorViews)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={styles.chartBox}>
                    <h3 style={styles.chartTitle}>Thống kê Điểm lời (30 ngày)</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={report?.profitChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                                <XAxis dataKey="displayDate" tick={{fontSize: 12, fill: '#A3AED0'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#A3AED0'}} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.1)'}} />
                                <Legend verticalAlign="top" align="right" height={36}/>
                                <Bar dataKey="points" name="Điểm lời" fill="#05CD99" radius={[10, 10, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Card = ({ title, metric, color, icon }) => (
    <div style={styles.card}>
        <div style={{...styles.iconBox, backgroundColor: color + '1A', color: color}}>{icon}</div>
        <div>
            <p style={styles.cardLabel}>{title}</p>
            <p style={styles.cardValue}>{(metric || 0).toLocaleString('vi-VN')}</p>
        </div>
    </div>
);

const styles = {
    // Ép container rộng tối đa và khử khoảng cách thừa
    container: { 
        padding: '20px', 
        backgroundColor: '#F4F7FE', 
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        width: '100%'
    },
    headerTitle: { color: '#2B3674', fontSize: '26px', fontWeight: 'bold', margin: 0 },
    subTitle: { color: '#707EAE', fontSize: '14px', margin: '5px 0 0 0' },
    actionGroup: { display: 'flex', gap: '12px' },
    refreshBtn: { 
        padding: '10px 20px', 
        backgroundColor: '#fff', 
        border: '1px solid #E0E5F2', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        color: '#2B3674',
        transition: '0.3s'
    },
    logoutBtn: { 
        padding: '10px 25px', 
        backgroundColor: '#EE5D50', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 'bold' 
    },
    // Grid cho các Card thống kê: Dùng 1fr để tự động lấp đầy chiều ngang
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        width: '100%'
    },
    card: { 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)',
        width: '100%',
        boxSizing: 'border-box'
    },
    iconBox: { 
        width: '56px', 
        height: '56px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '24px',
        flexShrink: 0
    },
    cardLabel: { color: '#A3AED0', fontSize: '15px', margin: 0, fontWeight: '500' },
    cardValue: { color: '#2B3674', fontSize: '24px', fontWeight: 'bold', margin: 0 },
    
    // Wrapper biểu đồ: Tận dụng chiều ngang rộng
    chartsWrapper: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '25px', 
        marginTop: '30px',
        width: '100%'
    },
    chartBox: { 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '20px', 
        boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)',
        width: '100%',
        boxSizing: 'border-box'
    },
    chartTitle: { color: '#2B3674', fontSize: '18px', fontWeight: 'bold', marginBottom: '25px' },
    center: { 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#2B3674'
    }
};

export default DashboardPage;