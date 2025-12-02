// src/utils/nguoiDungApi.js
const BASE_URL = 'http://localhost:8080';

const apiCall = async (endpoint, method = 'GET', token = null, body = null) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(url, config);
    if (!response.ok) {
        // Lấy thông báo lỗi từ server để hiển thị ở frontend
        const errorText = await response.text(); 
        try {
             // Cố gắng parse JSON nếu server trả về JSON lỗi
             const errorJson = JSON.parse(errorText);
             throw new Error(errorJson.error || `Lỗi từ server (${response.status}): ${errorText}`);
        } catch (e) {
             // Nếu không phải JSON, trả về lỗi thô
             throw new Error(`Lỗi từ server (${response.status}): ${errorText}`);
        }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    // Trả về đối tượng rỗng nếu không có content type hoặc không phải json (ví dụ: thao tác xóa thành công 204 No Content)
    return {}; 
};

// ===================== API LỊCH SỬ ĐỌC =====================
// Trả về { lichSuDoc: [...] }
export const layLichSuDoc = async (token) =>
    apiCall('/nguoiDung/lichSuDoc', 'GET', token);

// Xóa 1 mục lịch sử đọc (Sẽ xóa TẤT CẢ mục của truyện có TID này)
export const xoaLichSuDoc = async (token, tid) =>
    apiCall(`/nguoiDung/xoaLichSuDoc`, 'POST', token, { tid });

// Xóa tất cả lịch sử đọc
export const xoaTatCaLichSuDoc = async (token) =>
    apiCall('/nguoiDung/xoaTatCaLichSuDoc', 'POST', token);

// Ghi nhận chương đã đọc (dùng khi người dùng đọc một chương)
export const ghiNhanLichSuDoc = async (token, tid, ctid) =>
    apiCall('/nguoiDung/ghiNhanLichSuDoc', 'POST', token, { tid, ctid });

// ===================== API YÊU THÍCH =====================
// Trả về mảng truyện yêu thích [...]
export const layDanhSachYeuThich = async (token) =>
    apiCall('/nguoiDung/danhSachYeuThich', 'GET', token);

// Thêm truyện vào danh sách yêu thích
export const themVaoDanhSachYeuThich = async (token, TID) =>
    apiCall('/nguoiDung/themVaoDanhSachYeuThich', 'POST', token, { TID });

// Xóa truyện khỏi danh sách yêu thích
export const xoaKhoiDanhSachYeuThich = async (token, TID) =>
    apiCall('/nguoiDung/xoaKhoiDanhSachYeuThich', 'POST', token, { TID });