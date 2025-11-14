import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:8080/theloai");
        if (!res.ok) throw new Error("Không thể tải danh sách thể loại");
        const data = await res.json();
        setCategories(data.theloai || data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải thể loại...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
        📚 Danh sách thể loại
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.TLID}
            to={`/the-loai/${cat.TLID}`}
            className="p-4 bg-white shadow rounded-lg hover:bg-blue-100 transition text-center"
          >
            {cat.TenTheLoai}
          </Link>
        ))}
      </div>
    </div>
  );
}
