import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchComics() {
      try {
        const res = await fetch("http://localhost:8080/truyen/truyenMoi");
        if (!res.ok) throw new Error("Không thể tải danh sách truyện");
        const data = await res.json();
        setComics(data.truyen || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchComics();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải truyện...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 border-b pb-2">📚 Truyện mới cập nhật</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {comics.map((comic) => (
          <Link
            key={comic.TID}
            to={`/truyen/${comic.TID}`}
            className="block bg-white shadow rounded overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={comic.AnhBia || "/default-cover.jpg"}
              alt={comic.TenTruyen}
              className="w-full h-56 object-cover"
            />
            <div className="p-2">
              <h2 className="font-semibold text-sm line-clamp-2">{comic.TenTruyen}</h2>
              <p className="text-xs text-gray-500">Tác giả: {comic.TacGia || "Đang cập nhật"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
