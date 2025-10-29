import { useState } from "react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Gửi OTP đến email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể gửi OTP");
      setMessage("Đã gửi mã OTP tới email của bạn.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đặt lại mật khẩu thất bại");
      setMessage("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập lại.");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input
              type="email"
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600"
            >
              Gửi mã OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600"
            >
              Đặt lại mật khẩu
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full border border-gray-400 text-gray-600 font-semibold p-3 rounded-lg hover:bg-gray-100"
            >
              Gửi lại email khác
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
