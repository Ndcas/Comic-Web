// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, BookOpen, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify'; // Sử dụng toast để hiển thị lỗi

// --- 1. COMPONENT: THẺ THỐNG KÊ (Stat Card) ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg flex items-center justify-between transition duration-300 hover:shadow-xl border-l-4 ${colorClass}`}>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${colorClass.replace('border-l-4', 'bg-opacity-20')}`}>
      <Icon className={`w-8 h-8 ${colorClass.replace('border-l-4', 'text-')}`} />
    </div>
  </div>
);

// --- 2. COMPONENT: BIỂU ĐỒ DOANH THU/LƯỢT XEM ---
const DataChart = ({ data, dataKey, title, strokeColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip 
            formatter={(value) => [value.toLocaleString(), title.split(' ')[0]]}
            labelFormatter={(label) => `Ngày: ${label}`}
        />
        <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={strokeColor} 
            strokeWidth={3} 
            dot={{ r: 4 }} 
            activeDot={{ r: 7 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);


// --- 3. TRANG DASHBOARD CHÍNH ---
const DashboardPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 💡 TODO: Thay thế bằng URL API Backend thực tế của bạn
  const API_URL = '/admin/baoCaoHeThong'; 

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    // 💡 TODO: Lấy access token từ AuthContext hoặc nơi bạn lưu trữ
    const accessToken = "YOUR_ADMIN_ACCESS_TOKEN"; 

    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Định dạng lại dữ liệu ngày cho Biểu đồ
      const formattedProfit = response.data.profitPointsByDays.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('vi-VN'),
      }));
       const formattedViews = response.data.viewsByDays.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('vi-VN'),
      }));
      
      setReportData({
          ...response.data,
          profitPointsByDays: formattedProfit,
          viewsByDays: formattedViews,
      });

    } catch (error) {
      console.error("Lỗi lấy báo cáo:", error);
      toast.error("Không thể tải báo cáo hệ thống.");
      // Trường hợp lỗi: Gán dữ liệu mẫu để thấy giao diện
      setReportData({
        reportTime: new Date().toISOString(),
        numOfUsers: 1240,
        verifiedComics: 450,
        unverifiedComics: 15,
        rejectedComics: 5,
        numOfChapters: 12000,
        unprocessedComicReports: 7,
        unprocessedCommentReports: 25,
        profitPointsByDays: [
          { date: "01/12", points: 12000 }, { date: "03/12", points: 20100 }, 
          { date: "05/12", points: 15000 }, { date: "07/12", points: 22000 },
        ],
        viewsByDays: [
          { date: "01/12", views: 50000 }, { date: "03/12", views: 75000 }, 
          { date: "05/12", views: 60000 }, { date: "07/12", views: 92000 },
        ],
      });
      
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-lg">Đang tải dữ liệu báo cáo...</div>;
  }
  
  // Xử lý dữ liệu không tồn tại (Fallback)
  if (!reportData) {
      return <div className="text-center p-10 text-red-500 text-lg">Không có dữ liệu báo cáo để hiển thị.</div>;
  }

  // Lấy thời gian báo cáo
  const reportTime = new Date(reportData.reportTime).toLocaleString('vi-VN');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">Cập nhật lần cuối: <span className="font-semibold text-gray-700">{reportTime}</span></p>
        <button 
            onClick={() => fetchReportData(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
        >
            Làm mới Báo cáo
        </button>
      </div>

      {/* THẺ THỐNG KÊ (STAT CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
            title="Tổng Số Người Dùng" 
            value={reportData.numOfUsers.toLocaleString()} 
            icon={Users} 
            colorClass="border-l-4 border-blue-500 text-blue-500"
        />
        <StatCard 
            title="Tổng Số Truyện Đã Duyệt" 
            value={reportData.verifiedComics.toLocaleString()} 
            icon={BookOpen} 
            colorClass="border-l-4 border-green-500 text-green-500"
        />
        <StatCard 
            title="Tổng Số Chương" 
            value={reportData.numOfChapters.toLocaleString()} 
            icon={BookOpen} 
            colorClass="border-l-4 border-purple-500 text-purple-500"
        />
        <StatCard 
            title="Truyện Chờ Duyệt" 
            value={reportData.unverifiedComics.toLocaleString()} 
            icon={AlertTriangle} 
            colorClass="border-l-4 border-yellow-500 text-yellow-500"
        />
      </div>

      {/* CẢNH BÁO BÁO CÁO CHƯA XỬ LÝ */}
      {(reportData.unprocessedComicReports > 0 || reportData.unprocessedCommentReports > 0) && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md flex justify-between items-center">
          <p className="font-bold">
            CẢNH BÁO: Có {reportData.unprocessedComicReports} báo cáo truyện và {reportData.unprocessedCommentReports} báo cáo bình luận chưa được xử lý!
          </p>
          <Link to="/admin/reports" className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 text-sm font-semibold">
            Xem Báo cáo
          </Link>
        </div>
      )}


      {/* BIỂU ĐỒ XU HƯỚNG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataChart
          data={reportData.profitPointsByDays}
          dataKey="points"
          title="Xu hướng Điểm Lời (Profit Points)"
          strokeColor="#3b82f6" // Blue-500
        />
        <DataChart
          data={reportData.viewsByDays}
          dataKey="views"
          title="Xu hướng Lượt Xem (Views)"
          strokeColor="#10b981" // Green-500
        />
      </div>
      
    </div>
  );
};

export default DashboardPage;