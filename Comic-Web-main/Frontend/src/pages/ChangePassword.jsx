import { useState } from "react";

// Khai báo biến môi trường (theo yêu cầu của bạn)
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // 🚨 ĐÃ SỬA: SỬ DỤNG TIỀN TỐ '/nguoiDung' ĐỂ KHỚP VỚI BACKEND
      const API_URL = `${VITE_BACKEND_URL}/nguoiDung/change-password`;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // 🚨 ĐÃ SỬA: DÙNG 'oldPassword' ĐỂ KHỚP VỚI HÀM doiMatKhau() TRONG BACKEND
          oldPassword: form.currentPassword, 
          newPassword: form.newPassword,
        }),
      });

      // Xử lý lỗi Parse JSON (HTML response)
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const errorText = await res.text();
        // Thông báo lỗi cụ thể cho người dùng biết lỗi không phải do frontend
        throw new Error("Lỗi phản hồi từ server: Không nhận được JSON. (Kiểm tra lỗi 404/500 trên server)");
      }
      
      if (!res.ok) {
          throw new Error(data.error || data.message || "Đổi mật khẩu thất bại");
      } 
      
      setSuccess("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="currentPassword"
            placeholder="Mật khẩu hiện tại"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="Mật khẩu mới"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu mới"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600"
          >
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}