// src/layouts/MainLayout.jsx
import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="bg-gray-800 shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center px-6">
          <Link to="/" className="text-2xl font-bold text-yellow-400">
            📚 TruyenWeb
          </Link>
          <nav className="space-x-6">
            <Link to="/" className="hover:text-yellow-400">Trang chủ</Link>
            <Link to="/truyen-hot" className="hover:text-yellow-400">Truyện Hot</Link>
            <Link to="/the-loai" className="hover:text-yellow-400">Thể loại</Link>
            <Link to="/login" className="hover:text-yellow-400">Đăng nhập</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-10">
        <Outlet />
      </main>

      <footer className="bg-gray-800 py-6 text-center text-gray-400 text-sm">
        © 2025 TruyenWeb — Đọc truyện online miễn phí
      </footer>
    </div>
  );
}
