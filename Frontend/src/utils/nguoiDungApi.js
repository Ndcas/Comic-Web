const BASE_URL = 'http://localhost:8080'; 

const apiCall = async (endpoint, method = 'GET', token = null, body = null) => {
    
    const url = `${BASE_URL}${endpoint}`; 
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    
    if (body && method !== 'GET') config.body = JSON.stringify(body);

    const response = await fetch(url, config);
    if (!response.ok) {
        const errorText = await response.text(); 
        try {
             const errorJson = JSON.parse(errorText);
             const error = new Error(errorJson.error || `Lỗi từ server (${response.status}): ${errorText}`);
             error.status = response.status;
             throw error;
        } catch (e) {
             const error = new Error(`Lỗi từ server (${response.status}): ${errorText}`);
             error.status = response.status;
             throw error;
        }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {}; 
};

export const layLichSuDoc = async (token) =>
    apiCall('/nguoiDung/lichSuDoc', 'GET', token);

export const xoaLichSuDoc = async (token, tid) =>
    apiCall(`/nguoiDung/xoaLichSuDoc`, 'POST', token, { tid });

export const xoaTatCaLichSuDoc = async (token) =>
    apiCall('/nguoiDung/xoaTatCaLichSuDoc', 'POST', token);

export const ghiNhanLichSuDoc = async (token, tid, ctid) =>
    apiCall('/nguoiDung/ghiNhanLichSuDoc', 'POST', token, { tid, ctid });

export const layDanhSachYeuThich = async (token) =>
    apiCall('/truyen/danhSachYeuThich', 'GET', token); 

export const themVaoDanhSachYeuThich = async (token, TID) =>
    apiCall('/truyen/themVaoDanhSachYeuThich', 'POST', token, { TID }); 

export const xoaKhoiDanhSachYeuThich = async (token, TID) =>
    apiCall('/truyen/xoaKhoiDanhSachYeuThich', 'POST', token, { TID }); 

export const napDiem = async (token, diem) => {
    
    const endpoint = `/nguoiDung/napDiem?diem=${diem}`;
    return apiCall(endpoint, 'GET', token);
}

export const rutDiem = async (token, diem) =>
    apiCall('/nguoiDung/rutDiem', 'POST', token, { diem });

export const xuLyKetQuaNapDiem = async (ndid, queryParams) => {
    console.warn("Hàm này không được gọi từ Frontend. Nó là endpoint redirect của cổng thanh toán.");
};