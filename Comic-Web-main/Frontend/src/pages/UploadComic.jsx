import { useState } from "react";

export default function UploadComic() {
  const [form, setForm] = useState({
    TenTruyen: "",
    MoTa: "",
    TacGia: "",
    GioiHan18Tuoi: false,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8080/truyen/themTruyen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-center">🆕 Thêm truyện mới</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="TenTruyen"
          value={form.TenTruyen}
          onChange={handleChange}
          placeholder="Tên truyện"
          className="border p-2 rounded"
          required
        />
        <input
          name="TacGia"
          value={form.TacGia}
          onChange={handleChange}
          placeholder="Tác giả"
          className="border p-2 rounded"
          required
        />
        <textarea
          name="MoTa"
          value={form.MoTa}
          onChange={handleChange}
          placeholder="Mô tả"
          rows="4"
          className="border p-2 rounded"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="GioiHan18Tuoi"
            checked={form.GioiHan18Tuoi}
            onChange={handleChange}
          />
          Giới hạn 18+
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm truyện
        </button>
      </form>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}
