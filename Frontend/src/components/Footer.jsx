import React from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaFacebook, FaTwitter, FaEnvelope } from 'react-icons/fa';

function Footer() {
    return (
        // Footer dùng màu tối (dark mode style) để phân biệt với nội dung chính
        <footer className="bg-gray-900 text-gray-300 mt-10 border-t-4 border-red-600">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    
                    {/* 1. Logo và Mô Tả Ngắn */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-3">
                            <FaBookOpen className="text-3xl text-red-600" />
                            <span className="text-2xl font-black text-white">
                                Comic<span className="text-red-600">Web</span>
                            </span>
                        </Link>
                        <p className="text-sm">
                            Nền tảng đọc truyện tranh trực tuyến chuyên nghiệp. Cập nhật liên tục các chương mới nhất.
                        </p>
                    </div>

                    {/* 2. Liên Kết Nhanh */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4 border-b border-red-600 pb-1">Liên Kết</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-red-600 transition-colors">Trang Chủ</Link></li>
                            <li><Link to="/categories" className="hover:text-red-600 transition-colors">Thể Loại</Link></li>
                            <li><Link to="/search" className="hover:text-red-600 transition-colors">Tìm Kiếm</Link></li>
                            <li><Link to="/new" className="hover:text-red-600 transition-colors">Truyện Mới</Link></li>
                        </ul>
                    </div>

                    {/* 3. Hỗ Trợ */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4 border-b border-red-600 pb-1">Hỗ Trợ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/faq" className="hover:text-red-600 transition-colors">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-red-600 transition-colors">Liên Hệ</Link></li>
                            <li><Link to="/policy" className="hover:text-red-600 transition-colors">Chính sách</Link></li>
                            <li><Link to="/terms" className="hover:text-red-600 transition-colors">Điều khoản</Link></li>
                        </ul>
                    </div>

                    {/* 4. Theo Dõi Chúng Tôi */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4 border-b border-red-600 pb-1">Theo Dõi</h4>
                        <div className="flex space-x-4 mb-4">
                            <a href="#" target="_blank" className="text-xl hover:text-red-600 transition-colors"><FaFacebook /></a>
                            <a href="#" target="_blank" className="text-xl hover:text-red-600 transition-colors"><FaTwitter /></a>
                            <a href="mailto:support@comicweb.vn" className="text-xl hover:text-red-600 transition-colors"><FaEnvelope /></a>
                        </div>
                        <p className="text-sm">Email: support@comicweb.vn</p>
                    </div>
                </div>

                {/* Bản Quyền */}
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} ComicWeb. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;