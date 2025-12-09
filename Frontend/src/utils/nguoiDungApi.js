// src/utils/nguoiDungApi.js

// 💡 LƯU Ý: Đặt BASE_URL là cổng gốc, giả định Router Back-end gắn dưới /nguoiDung
const BASE_URL = 'http://localhost:8080';

const apiCall = async (endpoint, method = 'GET', token = null, body = null) => {
    // endpoint có thể là: /nguoiDung/napDiem?diem=100
    const url = `${BASE_URL}${endpoint}`; 
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    
    // Chỉ thêm body khi method không phải là GET và có body
    if (body && method !== 'GET') config.body = JSON.stringify(body);

    const response = await fetch(url, config);
    if (!response.ok) {
        const errorText = await response.text(); 
        try {
             const errorJson = JSON.parse(errorText);
             throw new Error(errorJson.error || `Lỗi từ server (${response.status}): ${errorText}`);
        } catch (e) {
             throw new Error(`Lỗi từ server (${response.status}): ${errorText}`);
        }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {}; 
};

// ===================== API LỊCH SỬ ĐỌC =====================
export const layLichSuDoc = async (token) =>
    apiCall('/nguoiDung/lichSuDoc', 'GET', token);

export const xoaLichSuDoc = async (token, tid) =>
    apiCall(`/nguoiDung/xoaLichSuDoc`, 'POST', token, { tid });

export const xoaTatCaLichSuDoc = async (token) =>
    apiCall('/nguoiDung/xoaTatCaLichSuDoc', 'POST', token);

export const ghiNhanLichSuDoc = async (token, tid, ctid) =>
    apiCall('/nguoiDung/ghiNhanLichSuDoc', 'POST', token, { tid, ctid });

// ===================== API YÊU THÍCH =====================
export const layDanhSachYeuThich = async (token) =>
    apiCall('/nguoiDung/danhSachYeuThich', 'GET', token);

export const themVaoDanhSachYeuThich = async (token, TID) =>
    apiCall('/nguoiDung/themVaoDanhSachYeuThich', 'POST', token, { TID });

export const xoaKhoiDanhSachYeuThich = async (token, TID) =>
    apiCall('/nguoiDung/xoaKhoiDanhSachYeuThich', 'POST', token, { TID });

// ===================== API ĐIỂM =====================

/**
 * Tạo yêu cầu nạp điểm và nhận về URL thanh toán.
 * Back-end mong muốn: GET /nguoiDung/napDiem?diem=X
 */
export const napDiem = async (token, diem) => {
    // 💡 ĐÃ SỬA: Chuyển sang GET và tạo endpoint với Query Parameter
    const endpoint = `/nguoiDung/napDiem?diem=${diem}`;
    return apiCall(endpoint, 'GET', token);
}

/**
 * Rút điểm của người dùng.
 */
export const rutDiem = async (token, diem) =>
    apiCall('/nguoiDung/rutDiem', 'POST', token, { diem });

/**
 * Endpoint xử lý kết quả thanh toán từ cổng VTC Pay.
 */
export const xuLyKetQuaNapDiem = async (ndid, queryParams) => {
    console.warn("Hàm này không được gọi từ Frontend. Nó là endpoint redirect của cổng thanh toán.");
};