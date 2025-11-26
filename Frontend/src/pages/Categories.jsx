import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen, FaChevronRight } from 'react-icons/fa';

// ĐÃ SỬA: Loại bỏ '/api'
const API_BASE_URL = 'http://localhost:8080/truyen';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch danh sách thể loại
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Sửa lỗi 404 cho API /theLoai
                const response = await axios.get(`${API_BASE_URL}/theLoai`);

                // Đọc dữ liệu theo cấu trúc phổ biến của Backend
                const categoriesData = response.data.theLoais || response.data.data.theLoais;

                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi tải thể loại:", err);
                setError("Không thể tải danh sách thể loại. Vui lòng kiểm tra kết nối.");
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div className="text-center p-8 text-xl">Đang tải danh sách thể loại...</div>;
    if (error) return <div className="text-center p-8 text-xl text-red-600">{error}</div>;
    if (categories.length === 0) return <div className="text-center p-8 text-gray-500">Chưa có thể loại nào được thêm.</div>;

    return (
        <div className="container mx-auto p-4 max-w-7xl">

            {/* Tiêu đề Trang: Chuẩn thiết kế truyènull.vn */}
            <div className="flex items-center mb-6 pb-2 border-b border-red-100">
                <FaBookOpen className="text-3xl text-red-600 mr-3" />
                <h1 className="text-3xl font-extrabold text-gray-800">
                    Tất Cả Thể Loại
                </h1>
            </div>

            {/* Bố cục Grid cho Thể Loại: Hiện đại và responsive */}
            <div className="grid grid-cols-2 gap-3 
                        sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                {categories.map(cat => (
                    // Link đến trang truyện theo thể loại (CategoryComics.jsx)
                    <Link
                        key={cat.TLID}
                        to={`/category/${cat.TLID}`}
                        className="group block"
                    >
                        <div className="p-4 bg-white rounded-lg shadow-md border 
                                        border-gray-200 transition-all duration-300 
                                        hover:shadow-lg hover:border-red-500 hover:bg-red-50">

                            <div className="flex justify-between items-center">
                                {/* Tên thể loại */}
                                <span className="text-lg font-bold text-gray-800 
                                                group-hover:text-red-600 transition-colors">
                                    {cat.TenTheLoai}
                                </span>

                                {/* Icon mũi tên hoặc số lượng truyện */}
                                <FaChevronRight className="w-4 h-4 text-gray-400 
                                                        group-hover:text-red-600 transition-all"/>
                            </div>

                            {/* Có thể thêm mô tả ngắn hoặc số lượng truyện tại đây */}
                            {/* <p className="text-sm text-gray-500 mt-1">
                                {cat.SoLuongTruyen || 0} truyện
                            </p> */}
                        </div>
                    </Link>
                ))}
            </div>

            {/* LƯU Ý QUAN TRỌNG: Để áp dụng chuẩn truyènull.vn, bạn cần tạo một "Mô tả Thể loại" 
            lớn ở cuối trang (như một khối SEO) */}
            <div className="mt-10 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold mb-3 text-red-600">Giới thiệu về các Thể loại Truyện</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Đây là nơi chứa tất cả các thể loại truyện của hệ thống. Từ các thể loại phổ biến như Tiên Hiệp, Huyền Huyễn, Ngôn Tình, Đô Thị cho đến các thể loại đặc biệt hơn như Cổ Đại, Trùng Sinh. Bạn có thể dễ dàng lọc và tìm kiếm truyện yêu thích của mình. Bấm vào một thể loại để khám phá ngay bộ sưu tập truyện tương ứng!
                </p>
            </div>

        </div>
    );
}

export default Categories;