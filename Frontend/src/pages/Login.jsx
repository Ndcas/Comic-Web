import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { post } from "../utils/request";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res = await post(`${VITE_BACKEND_URL}/nguoiDung/dangNhap`, 'application/json', JSON.stringify({
        Email: form.email,
        MatKhau: form.password,
        ghiNho: true
      }));
      let data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "NguoiDung");
        localStorage.setItem("exp", data.hanDung);
        navigate("/");
        return;
      }
      res = await post(`${VITE_BACKEND_URL}/admin/dangNhap`, 'application/json', JSON.stringify({
        Email: form.email,
        MatKhau: form.password
      }), true);
      data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", "Admin");
      localStorage.setItem("exp", data.hanDung);
      // Xử lý chuyển tới trang quản trị chưa có
    } catch (err) {
      setError(err.message || 'Lỗi hệ thống');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
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
            className="w-full bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600"
          >
            Đăng nhập
          </button>
        </form>
        <p className="text-center mt-4">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
