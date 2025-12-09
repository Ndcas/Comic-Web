// src/pages/ReportManagementPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, MessageSquare, Check, Eye, Trash2, Clock } from 'lucide-react';
// import { toast } from 'react-toastify'; 

// Dữ liệu mẫu báo cáo
const MOCK_REPORTS = {
  comic: [
    { ID: 1, Type: "Comic", TargetID: 35, TargetName: "Truyện A: Nội dung bạo lực", Reporter: "User 101", Reason: "Bạo lực quá mức", Status: "Pending", ReportedDate: "2025-11-28" },
    { ID: 2, Type: "Comic", TargetID: 88, TargetName: "Truyện B: Vi phạm bản quyền", Reporter: "User 105", Reason: "Copy truyện khác", Status: "Pending", ReportedDate: "2025-11-27" },
  ],
  comment: [
    { ID: 101, Type: "Comment", TargetID: 501, TargetContent: "Bình luận xúc phạm tác giả.", Reporter: "User 201", Reason: "Ngôn ngữ không phù hợp", Status: "Pending", ReportedDate: "2025-11-29" },
    { ID: 102, Type: "Comment", TargetID: 502, TargetContent: "Spam quảng cáo link ngoài.", Reporter: "User 205", Reason: "Spam/Quảng cáo", Status: "Pending", ReportedDate: "2025-11-29" },
  ],
};

const ReportManagementPage = () => {
  const [reportType, setReportType] = useState('comic'); // 'comic' hoặc 'comment'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // 💡 TODO: Hàm lấy dữ liệu báo cáo từ API
  const fetchReports = async () => {
    // try {
    //   setLoading(true);
    //   // Gọi API backend để lấy báo cáo theo loại (comic/comment)
    //   // const response = await axios.get(`/admin/reports/list?type=${reportType}`);
    //   // setReports(response.data);
    // } catch (error) {
    //   // toast.error("Lỗi tải danh sách báo cáo");
    // } finally {
    //   setLoading(false);
    // }
    
    // Dùng dữ liệu mẫu
    setReports(MOCK_REPORTS[reportType] || []);
  };
  
  useEffect(() => {
    fetchReports();
  }, [reportType]);

  // Xử lý hành động: Đánh dấu đã xử lý (Mark As Resolved)
  const handleResolve = (reportId) => {
      if (window.confirm(`Bạn có chắc chắn muốn đánh dấu Báo cáo ID ${reportId} là ĐÃ XỬ LÝ không?`)) {
          // 💡 TODO: Gọi API /admin/reports/resolve để đánh dấu là resolved
          // Sau đó, lọc bỏ báo cáo đó khỏi danh sách hiển thị (hoặc gọi fetchReports)
          setReports(reports.filter(r => r.ID !== reportId));
          alert(`Báo cáo ID ${reportId} đã được đánh dấu là Đã Xử lý.`);
      }
  }

  // Xử lý hành động: Xem mục tiêu (View Target)
  const handleViewTarget = (targetType, targetId) => {
      alert(`Chuyển hướng đến trang chi tiết: ${targetType} ID: ${targetId}`);
      // 💡 TODO: Dùng navigate để chuyển hướng đến trang xem truyện hoặc xem bình luận
      // Ví dụ: navigate(`/story/${targetId}`) hoặc hiển thị modal chi tiết
  }

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🚨 Quản lý Báo cáo</h1>

      {/* Thanh Công cụ & Chuyển đổi loại báo cáo */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="text-xl font-semibold text-gray-700">
            {reportType === 'comic' ? 'Báo cáo Truyện' : 'Báo cáo Bình luận'} chưa xử lý
        </div>
        
        {/* Nút Chuyển đổi */}
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType('comic')}
            className={`flex items-center px-4 py-2 rounded-lg transition duration-200 text-sm font-semibold 
                        ${reportType === 'comic' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <BookOpen className="w-5 h-5 mr-2" /> Truyện
          </button>
          <button
            onClick={() => setReportType('comment')}
            className={`flex items-center px-4 py-2 rounded-lg transition duration-200 text-sm font-semibold 
                        ${reportType === 'comment' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <MessageSquare className="w-5 h-5 mr-2" /> Bình luận
          </button>
        </div>
      </div>

      {/* Bảng Danh sách Báo cáo */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        {loading ? (
          <p className="text-center p-10">Đang tải danh sách báo cáo...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-green-500 text-lg">
             <Check className="w-6 h-6 inline-block mr-2"/> 🎉 Tuyệt vời! Không có báo cáo nào cần xử lý.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Báo cáo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mục tiêu bị báo cáo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý do</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.ID} <span className="text-xs text-gray-500 block">({new Date(report.ReportedDate).toLocaleDateString('vi-VN')})</span>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {report.Type === 'Comic' ? (
                        <span className="font-semibold">{report.TargetName} (ID: {report.TargetID})</span>
                    ) : (
                        <span className="italic text-gray-600">"{report.TargetContent.substring(0, 50)}..." (ID: {report.TargetID})</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{report.Reason}</td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.Reporter}</td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    
                    {/* Nút Xem chi tiết mục tiêu */}
                    <button
                        title={`Xem chi tiết ${report.Type}`}
                        onClick={() => handleViewTarget(report.Type, report.TargetID)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    
                    {/* Nút Đánh dấu Đã xử lý */}
                    <button
                        title="Đánh dấu đã xử lý"
                        onClick={() => handleResolve(report.ID)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                    
                    {/* Nút Xóa Báo cáo (Dữ liệu mẫu, có thể không cần thiết) */}
                    <button
                        title="Xóa Báo cáo"
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportManagementPage;