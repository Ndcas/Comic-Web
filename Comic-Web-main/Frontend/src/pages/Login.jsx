import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { post } from "../utils/request";
import { useAuth } from "../utils/AuthContext"; 

// Biến môi trường
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const navigate = useNavigate();
  // Khắc phục lỗi: Đảm bảo useAuth trả về object chứa { login }
  const { login } = useAuth(); 
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let errorUser = ''; 

    try {
      // 1. THỬ ĐĂNG NHẬP VỚI TÀI KHOẢN NGƯỜI DÙNG (NguoiDung)
      let res = await post(
        `${VITE_BACKEND_URL}/nguoiDung/dangNhap`, 
        'application/json', 
        JSON.stringify({
          Email: form.email,
          MatKhau: form.password,
          ghiNho: true
        })
      );
      
      let data = await res.json(); 
      
      if (res.ok) {
        // Đăng nhập User thành công
        localStorage.setItem("email", form.email); 
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "NguoiDung");
        localStorage.setItem("exp", data.hanDung); 
        
        login(); 
        navigate("/");
        return;
      }

      // LƯU LỖI USER (nếu res.ok là false)
      errorUser = data.error || 'Tài khoản hoặc mật khẩu không đúng.';
      
      // --- 2. Nếu đăng nhập User thất bại, thử Admin ---
      
      let adminRes = await post(
        `${VITE_BACKEND_URL}/admin/dangNhap`, 
        'application/json', 
        JSON.stringify({
          Email: form.email,
          MatKhau: form.password
        })
      );
      
      let adminData = await adminRes.json();
      
      if (adminRes.ok) {
        // Đăng nhập Admin thành công
        // Sử dụng adminData.accessToken hoặc adminData.token tùy theo API
        localStorage.setItem("token", adminData.accessToken || adminData.token); 
        localStorage.setItem("role", "Admin");
        localStorage.setItem("exp", adminData.hanDung);
        localStorage.setItem("email", form.email); 
        
        login(); 
        navigate("/admin-dashboard");
        return;
      }
      
      // 3. Nếu Admin cũng thất bại, ném lỗi User đã lưu
      // Chúng ta ưu tiên hiển thị lỗi của User vì đó là cổng đăng nhập chính
      throw new Error(errorUser);

    } catch (err) {
      // Bắt lỗi mạng hoặc lỗi đã được ném ở trên (errorUser)
      setError(err.message || 'Lỗi hệ thống, vui lòng thử lại sau.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        {/* Hiển thị lỗi */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold p-3 rounded-lg hover:bg-red-700 transition"
          >
            Đăng nhập
          </button>
        </form>
        
        <p className="text-center mt-4">
          Quên mật khẩu?{" "}
          <Link to="/forgot-password" className="text-red-600 hover:underline">
            Lấy lại
          </Link>
        </p>
        <p className="text-center mt-2">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-red-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}