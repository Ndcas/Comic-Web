import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function CategoryComics() {
  const { id } = useParams(); // TLID (mã thể loại)
  const [comics, setComics] = useState([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchByCategory() {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8080/truyen/truyenTheoTheLoai?TLID=${id}&page=${page}`
        );
        if (!res.ok) throw new Error("Không thể tải truyện theo thể loại");
        const data = await res.json();

        // backend trả về: { trangHienTai, trangToiDa, truyen: [...] }
        const list = data.truyen || [];
        if (!Array.isArray(list)) throw new Error("Dữ liệu truyện không hợp lệ");

        setComics(list);
        setMaxPage(data.trangToiDa || 1);
      } catch (err) {
        console.error("❌ Lỗi khi tải truyện theo thể loại:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchByCategory();
  }, [id, page]);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải truyện...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        📘 Thể loại #{id}
      </h1>

      {comics.length === 0 ? (
        <p className="text-center text-gray-500">
          Không có truyện trong thể loại này 😢
        </p>
      ) : (
        <>
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

          {/* Nút chuyển trang */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Trang trước
            </button>
            <span>
              {page} / {maxPage}
            </span>
            <button
              disabled={page >= maxPage}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
