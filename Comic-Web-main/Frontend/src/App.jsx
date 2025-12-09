import { Link } from "react-router-dom";
import './App.css';

function App() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Trang chính</h1>

      <div className="flex flex-col gap-3 w-64">
        <Link to="/login" className="btn">Đăng nhập</Link>
        <Link to="/register" className="btn">Đăng ký</Link>
        <Link to="/forgot-password" className="btn">Quên mật khẩu</Link>
        <Link to="/change-password" className="btn">Đổi mật khẩu</Link>
        <Link to="/test" className="btn">Đi đến Test</Link>
      </div>
    </div>
  );
}

export default App;
