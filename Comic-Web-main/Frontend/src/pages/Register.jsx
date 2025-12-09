import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Bạn có thể cần import VITE_BACKEND_URL nếu bạn dùng nó trong môi trường dev
// const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"; 

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", // Sẽ được gửi là TenTaiKhoan
    email: "",    // Sẽ được gửi là Email
    password: "", // Sẽ được gửi là MatKhau
    otp: "",      // Cần thiết cho Backend của bạn
    namSinh: ""   // Cần thiết cho Backend của bạn
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false); // Trạng thái để kiểm soát việc gửi OTP

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // HÀM MỚI: Yêu cầu OTP
  const handleRequestOTP = async () => {
    setError("");
    setSuccess("");
    if (!form.email) {
      setError("Vui lòng nhập Email trước khi yêu cầu OTP.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/nguoiDung/yeuCauOTPDangKy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: form.email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gửi OTP thất bại.");
      
      setSuccess("Mã OTP đã được gửi đến Email của bạn.");
      setIsOTPSent(true);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Kiểm tra đã có OTP chưa
    if (!isOTPSent || !form.otp) {
        setError("Vui lòng nhập Email và nhấn 'Gửi OTP' trước khi đăng ký.");
        return;
    }
    
    try {
      // Sửa URL API: Dùng /nguoiDung/dangKy để khớp với Backend
      const res = await fetch("http://localhost:8080/nguoiDung/dangKy", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Gửi dữ liệu theo định dạng Backend yêu cầu
        body: JSON.stringify({
            TenTaiKhoan: form.username,
            Email: form.email,
            MatKhau: form.password,
            NamSinh: form.namSinh || 2000, // Thêm NamSinh, bạn có thể thay đổi trường input nếu cần
            OTP: form.otp
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");
      
      setSuccess("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1500);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            type="text"
            name="username"
            placeholder="Tên tài khoản"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          
          <div className="flex space-x-2">
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="flex-grow border rounded-lg p-3"
                required
                disabled={isOTPSent} // Khóa trường Email sau khi gửi OTP
            />
            <button
                type="button"
                onClick={handleRequestOTP}
                disabled={!form.email || isOTPSent} // Không cho phép gửi nếu chưa nhập email hoặc đã gửi
                className={`p-3 rounded-lg text-white font-semibold ${isOTPSent ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
                {isOTPSent ? 'Đã gửi' : 'Gửi OTP'}
            </button>
          </div>
          
          <input
            type="text"
            name="otp"
            placeholder="Mã OTP"
            value={form.otp}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required={isOTPSent} // Bắt buộc nhập OTP sau khi gửi
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
          
          {/* Thêm trường NamSinh nếu Backend của bạn yêu cầu */}
          <input
            type="number"
            name="namSinh"
            placeholder="Năm sinh (Ví dụ: 2000)"
            value={form.namSinh}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600"
          >
            Đăng ký
          </button>
        </form>
        <p className="text-center mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}