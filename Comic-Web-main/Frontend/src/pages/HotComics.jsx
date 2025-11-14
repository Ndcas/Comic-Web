import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HotComics() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHot() {
      try {
        const res = await fetch("http://localhost:8080/truyen/truyenHot");
        if (!res.ok) throw new Error("Không thể tải truyện hot");
        const data = await res.json();
        const list = data.truyen?.result || data.truyen || [];
        if (!Array.isArray(list)) throw new Error("Dữ liệu truyện không hợp lệ");
        setComics(list);
      } catch (err) {
        console.error("❌ Lỗi khi tải truyện hot:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHot();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải truyện hot...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">🔥 Truyện hot nhất</h1>
      {comics.length === 0 ? (
        <p className="text-center text-gray-500">Hiện chưa có truyện hot nào.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {comics.map((comic) => (
            <Link
              key={comic.TID}
              to={`/truyen/${comic.TID}`}
              className="block bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={comic.AnhBia || "/default-cover.jpg"}
                alt={comic.TenTruyen}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-lg">{comic.TenTruyen}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">{comic.MoTa}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
