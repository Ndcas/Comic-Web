import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ĐÃ SỬA: Loại bỏ '/api' để khớp với Backend (app.use('/truyen', ...))
const API_BASE_URL = 'http://localhost:8080/truyen';

function UploadComic() {
    const [formData, setFormData] = useState({
        TenTruyen: '',
        TacGia: '',
        MoTa: '',
        TrangThai: 1, // 1: Còn tiếp, 2: Hoàn thành
        GioiHan18Tuoi: 0, // 0: Không 18+, 1: 18+
        TheLoais: [], // Mảng ID thể loại được chọn
    });
    const [coverFile, setCoverFile] = useState(null);
    const [chapterFiles, setChapterFiles] = useState(null); // File zip/rar/hoặc nhiều ảnh chương
    const [allCategories, setAllCategories] = useState([]); // Danh sách thể loại từ Backend
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('accessToken');

    // Lấy danh sách thể loại để hiển thị checkbox/select
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Sửa lỗi 404 cho API /theLoai
                const response = await axios.get(`${API_BASE_URL}/theLoai`);
                // Điều chỉnh cách đọc dữ liệu để khớp với phản hồi
                const categoriesData = response.data.theLoais || response.data.data.theLoais;
                if (Array.isArray(categoriesData)) {
                    // Chuyển TLID về kiểu String để khớp với value của checkbox
                    setAllCategories(categoriesData.map(cat => ({
                        ...cat,
                        TLID: String(cat.TLID)
                    })));
                } else {
                    console.error("Dữ liệu thể loại trả về không phải là mảng.");
                    setAllCategories([]);
                }
            } catch (error) {
                console.error("Lỗi tải thể loại:", error.response || error);
                setMessage("Lỗi: Không thể tải danh sách thể loại. Vui lòng kiểm tra Backend.");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'GioiHan18Tuoi') {
            setFormData(prev => ({
                ...prev,
                [name]: checked ? 1 : 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCategoryChange = (e) => {
        // TLID đã được chuyển sang String ở useEffect
        const value = e.target.value;
        setFormData(prev => {
            const current = prev.TheLoais;
            if (current.includes(value)) {
                return { ...prev, TheLoais: current.filter(id => id !== value) };
            } else {
                return { ...prev, TheLoais: [...current, value] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (!token) {
            setMessage("Lỗi: Bạn cần đăng nhập để thực hiện chức năng này.");
            setLoading(false);
            return;
        }

        if (!coverFile || !chapterFiles || formData.TheLoais.length === 0 || !formData.TenTruyen || !formData.MoTa || !formData.TacGia) {
            setMessage("Vui lòng điền đủ thông tin, chọn ảnh bìa, file chương và ít nhất một thể loại.");
            setLoading(false);
            return;
        }

        const data = new FormData();

        // Append dữ liệu form
        Object.keys(formData).forEach(key => {
            if (key === 'TheLoais') {
                // Backend cần mảng ID thể loại, không phải chuỗi JSON
                // FormData tự động xử lý mảng nếu bạn gọi append nhiều lần
                // Tuy nhiên, nếu Backend yêu cầu một trường duy nhất, ta dùng JSON.stringify
                // Tốt nhất là gửi dưới dạng một chuỗi JSON (như code gốc của bạn), nhưng nên thử gửi dưới dạng mảng đơn giản trước
                data.append('TheLoais', JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Append file
        data.append('AnhBia', coverFile);

        // Append các file chương (multiple files)
        if (chapterFiles && chapterFiles.length > 0) {
            for (let i = 0; i < chapterFiles.length; i++) {
                // Tên trường 'ChapterFiles' phải khớp với tên trường mà Backend (multer) đang chờ đợi
                data.append('ChapterFiles', chapterFiles[i]);
            }
        }

        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                // Không cần tự set 'Content-Type': 'multipart/form-data', Axios và trình duyệt sẽ tự đặt chính xác boundary
            };

            // Sửa lỗi 404 cho API /uploadTruyen
            const response = await axios.post(`${API_BASE_URL}/uploadTruyen`, data, { headers });

            const uploadedStory = response.data.data.truyen || response.data.truyen;

            setMessage(`Truyện "${uploadedStory.TenTruyen}" đã được tải lên thành công!`);

            // Reset form sau khi upload
            setFormData({
                TenTruyen: '', TacGia: '', MoTa: '', TrangThai: 1, GioiHan18Tuoi: 0, TheLoais: [],
            });
            setCoverFile(null);
            setChapterFiles(null);
            // Dùng cú pháp JS thuần để reset input type="file"
            document.getElementById('coverFile').value = '';
            document.getElementById('chapterFiles').value = '';

        } catch (error) {
            console.error("Lỗi upload:", error.response || error);
            setMessage(`Lỗi khi tải truyện lên: ${error.response?.data?.message || error.message || error.response?.statusText}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-red-600 border-b-2 pb-2">
                ⬆️ Tải Truyện Lên Hệ Thống
            </h1>

            {message && (
                <div className={`p-3 mb-4 rounded ${message.includes("Lỗi") ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Đổi ID form để tránh xung đột với document.getElementById('uploadForm').reset() cũ */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl">

                {/* Thông tin cơ bản */}
                <h2 className="text-xl font-semibold mb-3 border-b pb-1">Thông tin cơ bản</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Tên Truyện *</label>
                    <input type="text" name="TenTruyen" value={formData.TenTruyen} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:border-red-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Tác Giả *</label>
                    <input type="text" name="TacGia" value={formData.TacGia} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:border-red-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Mô Tả *</label>
                    <textarea name="MoTa" value={formData.MoTa} onChange={handleChange} required rows="4" className="w-full p-2 border border-gray-300 rounded-lg focus:border-red-500"></textarea>
                </div>

                {/* Trạng thái & Giới hạn */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Trạng Thái</label>
                        <select name="TrangThai" value={formData.TrangThai} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:border-red-500">
                            <option value={1}>Còn tiếp</option>
                            <option value={2}>Đã hoàn thành</option>
                        </select>
                    </div>
                    <div className="flex items-center pt-5">
                        <input type="checkbox" name="GioiHan18Tuoi" checked={formData.GioiHan18Tuoi === 1} onChange={handleChange} id="ageCheck" className="mr-2 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                        <label htmlFor="ageCheck" className="text-gray-700 font-medium">Giới hạn 18+ (Có nội dung nhạy cảm)</label>
                    </div>
                </div>

                {/* Thể loại */}
                <h2 className="text-xl font-semibold mb-3 border-b pb-1">Chọn Thể Loại</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6 border p-3 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                    {allCategories.map(cat => (
                        <div key={cat.TLID} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`cat-${cat.TLID}`}
                                value={cat.TLID}
                                checked={formData.TheLoais.includes(cat.TLID)}
                                onChange={handleCategoryChange}
                                className="mr-2 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <label htmlFor={`cat-${cat.TLID}`} className="text-sm text-gray-700">{cat.TenTheLoai}</label>
                        </div>
                    ))}
                </div>

                {/* Tải File */}
                <h2 className="text-xl font-semibold mb-3 border-b pb-1">Tải File</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Ảnh Bìa * (Tải 1 file ảnh)</label>
                    <input
                        type="file"
                        onChange={(e) => setCoverFile(e.target.files[0])}
                        accept="image/*"
                        required
                        id="coverFile"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-red-500"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1">File Chương Truyện * (Tải file Zip/Rar hoặc nhiều file ảnh)</label>
                    <input
                        type="file"
                        onChange={(e) => setChapterFiles(e.target.files)}
                        multiple
                        id="chapterFiles"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lưu ý: Nếu tải nhiều chương, nên nén thành file Zip/Rar và đặt tên file theo thứ tự.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    {loading ? 'Đang Tải Lên...' : 'Gửi Yêu Cầu Tải Lên'}
                </button>
            </form>
        </div>
    );
}

export default UploadComic;