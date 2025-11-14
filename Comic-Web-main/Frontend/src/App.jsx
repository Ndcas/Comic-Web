import { Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-indigo-600">
        📖 Trang chính
      </h1>

      {/* --- Khu vực tài khoản --- */}
      <section className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-center text-gray-700">Tài khoản</h2>
        <div className="flex flex-col gap-3">
          <Link to="/login" className="btn">Đăng nhập</Link>
          <Link to="/register" className="btn">Đăng ký</Link>
          <Link to="/forgot-password" className="btn">Quên mật khẩu</Link>
          <Link to="/change-password" className="btn">Đổi mật khẩu</Link>
        </div>
      </section>

      {/* --- Khu vực truyện --- */}
      <section className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-center text-gray-700">Truyện</h2>
        <div className="flex flex-col gap-3">
          <Link to="/home" className="btn">📚 Truyện mới cập nhật</Link>
          <Link to="/truyen-hot" className="btn">🔥 Truyện hot</Link>
          <Link to="/the-loai" className="btn">🏷️ Thể loại</Link>
          <Link to="/story/1" className="btn">📖 Chi tiết truyện (StoryDetail)</Link>
          <Link to="/chapter/1" className="btn">📜 Đọc chương (ChapterReader)</Link>
        </div>
      </section>

      {/* --- Khu vực khác --- */}
      <section className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-center text-gray-700">Khác</h2>
        <div className="flex flex-col gap-3">
          <Link to="/test" className="btn">🧪 Trang Test</Link>
        </div>
      </section>
    </div>
  );
}

export default App;
