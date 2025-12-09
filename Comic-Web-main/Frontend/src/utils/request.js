const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Hàm GET cơ bản với logic làm mới Access Token tự động.
 * @param {string} url - Đường dẫn API.
 * @param {boolean} isAdmin - Là request của Admin hay không.
 * @param {boolean} needToken - Cần Access Token hay không.
 * @returns {Promise<Response>} - Đối tượng Response từ fetch.
 */
export async function get(url, isAdmin = false, needToken = false) {
    let token = null;
    if (needToken && !localStorage.getItem('token')) {
        throw new Error('Cần đăng nhập');
    }
    if (needToken) {
        let exp = parseInt(localStorage.getItem('exp'));
        // Kiểm tra token có sắp hết hạn (còn dưới 30 giây) hoặc đã hết hạn không
        if (!exp || exp - 30000 <= Date.now()) {
            let result = await fetch(`${VITE_BACKEND_URL}/${isAdmin ? 'admin' : 'nguoiDung'}/lamMoiAccessToken`, {
                method: 'GET',
                credentials: 'include'
            });
            switch (result.status) {
                case 400:
                    throw new Error('Thiếu thông tin, vui lòng đăng nhập lại');
                case 401:
                    throw new Error('Thông tin đăng nhập không hợp lệ, vui lòng đăng nhập lại');
                case 403:
                    // Đây là trường hợp Refresh Token hết hạn hoặc không hợp lệ
                    throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
                case 429:
                    throw new Error('Thao tác quá nhanh, vui lòng thử lại sau');
                case 500:
                    throw new Error('Lỗi hệ thống');
            }
            let data = await result.json();
            token = data.accessToken;
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('exp', data.hanDung); // Lưu thời gian hết hạn mới
        } else {
            token = localStorage.getItem('token');
        }
    }
    let headers = needToken ? { Authorization: `Bearer ${token}` } : {};
    let result = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
    });
    return result;
}

/**
 * Hàm POST cơ bản với logic làm mới Access Token tự động.
 * @param {string} url - Đường dẫn API.
 * @param {string} contentType - Loại nội dung (ví dụ: 'application/json').
 * @param {*} body - Dữ liệu gửi đi.
 * @param {boolean} isAdmin - Là request của Admin hay không.
 * @param {boolean} needToken - Cần Access Token hay không.
 * @returns {Promise<Response>} - Đối tượng Response từ fetch.
 */
export async function post(url, contentType, body, isAdmin = false, needToken = false) {
    let token = null;
    if (needToken && !localStorage.getItem('token')) {
        throw new Error('Cần đăng nhập');
    }
    if (needToken) {
        let exp = parseInt(localStorage.getItem('exp'));
        if (!exp || exp - 30000 <= Date.now()) {
            let result = await fetch(`${VITE_BACKEND_URL}/${isAdmin ? 'admin' : 'nguoiDung'}/lamMoiAccessToken`, {
                method: 'GET',
                credentials: 'include'
            });
            switch (result.status) {
                case 400:
                    throw new Error('Thiếu thông tin, vui lòng đăng nhập lại');
                case 401:
                    throw new Error('Thông tin đăng nhập không hợp lệ, vui lòng đăng nhập lại');
                case 403:
                    throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
                case 429:
                    throw new Error('Thao tác quá nhanh, vui lòng thử lại sau');
                case 500:
                    throw new Error('Lỗi hệ thống');
            }
            let data = await result.json();
            token = data.accessToken;
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('exp', data.hanDung);
        } else {
            token = localStorage.getItem('token');
        }
    }
    let headers = {
        'Content-Type': contentType
    };
    if (needToken) {
        headers.Authorization = `Bearer ${token}`;
    }
    let result = await fetch(url, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: body
    });
    return result;
}

// ----------------------------------------------------
//           HÀM API ĐẶC THÙ (Sử dụng hàm GET/POST cơ bản)
// ----------------------------------------------------

/**
 * Lấy thông tin tài khoản người dùng đã đăng nhập.
 * Endpoint: GET /nguoiDung/thongTinTaiKhoan
 * @returns {Promise<{nguoiDung: object}>} - Thông tin người dùng.
 * @throws {Error} - Lỗi xác thực hoặc lỗi hệ thống.
 */
export async function getProfile() {
    try {
        const url = `${VITE_BACKEND_URL}/nguoiDung/thongTinTaiKhoan`;
        const response = await get(url, false, true); // needToken = true

        if (response.status === 401) {
             throw new Error('Chưa được ủy quyền, vui lòng đăng nhập.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi khi lấy thông tin tài khoản: ${response.status}`);
        }
        
        return response.json(); // Trả về { nguoiDung: {...} }
    } catch (error) {
        // Ném lại các lỗi từ hàm get (bao gồm 'Phiên đăng nhập hết hạn')
        throw error; 
    }
}

/**
 * Đổi tên tài khoản (TenTaiKhoan) của người dùng.
 * Endpoint: POST /nguoiDung/doiTenTaiKhoan
 * @param {string} TenTaiKhoan - Tên tài khoản mới.
 * @returns {Promise<{token: string, hanDung: number}>} - Access Token mới.
 * @throws {Error} - Lỗi định dạng tên hoặc lỗi xác thực.
 */
export async function doiTenTaiKhoan(TenTaiKhoan) {
    try {
        const url = `${VITE_BACKEND_URL}/nguoiDung/doiTenTaiKhoan`;
        const body = JSON.stringify({ TenTaiKhoan });
        
        // POST request với Content-Type: application/json và cần Token
        const response = await post(url, 'application/json', body, false, true); 

        if (!response.ok) {
            const errorData = await response.json();
            // Lỗi 400 từ backend: 'Thiếu tên tài khoản hoặc tên tài khoản không đúng định dạng'
            throw new Error(errorData.error || `Lỗi khi đổi tên: ${response.status}`);
        }
        
        // Backend trả về { token: newAccessToken, hanDung: expiry }
        return response.json(); 
    } catch (error) {
        // Ném lại các lỗi từ hàm post (bao gồm 'Phiên đăng nhập hết hạn')
        throw error;
    }
}