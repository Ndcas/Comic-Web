import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function StoryList() {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🧩 Hàm lấy danh sách truyện
  async function fetchStories(url) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể tải danh sách truyện");

      const data = await res.json();

      // ✅ Cập nhật cấu trúc phù hợp backend mới
      const list = data.truyen?.result || data.result || [];
      setStories(list);

      setPage(data.truyen?.page || data.trangHienTai || 1);
      setMaxPage(data.truyen?.maxPage || data.tongTrang || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🧩 Lấy truyện mới khi vào trang hoặc chuyển trang
  useEffect(() => {
    fetchStories(`http://localhost:8080/truyen/truyenMoi?page=${page}`);
  }, [page]);

  // 🔍 Hàm tìm kiếm truyện theo từ khóa
  const handleSearch = () => {
    if (!keyword.trim()) return;
    fetchStories(
      `http://localhost:8080/truyen/truyenTheoTuKhoa?keyword=${encodeURIComponent(
        keyword
      )}&page=1`
    );
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">📚 Danh sách truyện</h1>

      {/* Ô tìm kiếm */}
      <div className="flex justify-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Tìm truyện..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border p-2 rounded-md w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          🔍 Tìm
        </button>
      </div>

      {/* Trạng thái */}
      {loading && <p className="text-center text-gray-500">Đang tải truyện...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && stories.length === 0 && (
        <p className="text-center text-gray-600">Không có truyện nào để hiển thị 😢</p>
      )}

      {/* Danh sách truyện */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stories.map((story) => (
          <Link
            to={`/truyen/${story.TID}`}
            key={story.TID}
            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <img
              src={story.AnhBia || "/default-cover.jpg"}
              alt={story.TenTruyen}
              className="w-full h-48 object-cover"
            />
            <div className="p-3 text-center">
              <h2 className="font-semibold text-lg truncate">{story.TenTruyen}</h2>
              <p className="text-gray-500 text-sm">
                {story.TacGia || "Chưa rõ tác giả"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ◀ Trang trước
        </button>
        <span className="font-medium">
          Trang {page} / {maxPage}
        </span>
        <button
          disabled={page >= maxPage}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Trang sau ▶
        </button>
      </div>
    </div>
  );
}
