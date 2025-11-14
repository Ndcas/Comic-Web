import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function ChapterReader() {
  const { id, cid } = useParams(); // id = TID, cid = CTID
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchChapter() {
      try {
        const res = await fetch(`http://localhost:8080/truyen/chuong/${cid}`);
        if (!res.ok) throw new Error("Không thể tải nội dung chương");
        const data = await res.json();
        setChapter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchChapter();
  }, [cid]);

  if (loading) return <p className="text-center mt-10">Đang tải nội dung...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!chapter) return <p className="text-center mt-10">Không tìm thấy chương.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl mt-8">
      <h1 className="text-2xl font-bold text-center mb-2">{chapter.TieuDe}</h1>
      <p className="text-center text-gray-500 mb-4">
        {chapter.TenTruyen} • Đăng ngày:{" "}
        {new Date(chapter.NgayDang).toLocaleDateString()}
      </p>

      <hr className="my-4" />

      <div className="text-gray-800 leading-relaxed whitespace-pre-line text-justify">
        {chapter.NoiDung || "Chưa có nội dung chương này."}
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() =>
            navigate(`/truyen/${id}/chuong/${parseInt(cid) - 1}`)
          }
          disabled={parseInt(cid) <= 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ← Chương trước
        </button>

        <Link
          to={`/truyen/${id}`}
          className="text-blue-600 hover:underline font-semibold"
        >
          Quay lại truyện
        </Link>

        <button
          onClick={() =>
            navigate(`/truyen/${id}/chuong/${parseInt(cid) + 1}`)
          }
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Chương sau →
        </button>
      </div>
    </div>
  );
}
