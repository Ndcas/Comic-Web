import { useState } from "react";

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
      const res = await fetch("http://localhost:8080/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");
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
