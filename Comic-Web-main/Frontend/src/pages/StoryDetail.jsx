import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function StoryDetail() {
  const { id } = useParams(); // Lấy ID truyện từ URL
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStory() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/truyen/${id}`);
        if (!res.ok) throw new Error("Không thể tải chi tiết truyện");
        const data = await res.json();

        // Kiểm tra dữ liệu trả về từ backend
        setStory(data.truyen || data);
        setChapters(data.chuongTruyen || data.ChuongTruyens || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStory();
  }, [id]);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải dữ liệu truyện...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!story) return <p className="text-center mt-10">Không tìm thấy truyện.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Ảnh bìa và thông tin */}
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={story.AnhBia || "/default-cover.jpg"}
          alt={story.TenTruyen}
          className="w-full md:w-1/3 h-72 object-cover rounded-xl shadow"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{story.TenTruyen}</h1>
          <p className="text-gray-600 mb-3 italic">
            ✍️ Tác giả: {story.TacGia || "Chưa rõ"}
          </p>

          {story.GioiHan18Tuoi ? (
            <p className="text-red-500 font-semibold mb-3">
              ⚠️ Truyện giới hạn 18+
            </p>
          ) : null}

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {story.MoTa || "Chưa có mô tả cho truyện này."}
          </p>
        </div>
      </div>

      {/* Danh sách chương */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">📖 Danh sách chương</h2>
      {chapters.length > 0 ? (
        <ul className="divide-y divide-gray-200 border rounded-lg">
          {chapters.map((chapter, index) => (
            <li key={chapter.CTID || index} className="p-3 hover:bg-gray-100">
              <Link
                to={`/truyen/${story.TID}/chuong/${chapter.CTID}`}
                className="block text-blue-600 hover:underline"
              >
                {chapter.TenChuongTruyen ||
                  chapter.TieuDe ||
                  `Chương ${index + 1}`}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">Chưa có chương nào được đăng.</p>
      )}

      {/* Nút quay lại */}
      <div className="mt-8 text-center">
        <Link
          to="/truyen"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          ← Quay lại danh sách truyện
        </Link>
      </div>
    </div>
  );
}
