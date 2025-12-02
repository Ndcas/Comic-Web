const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function get(url, isAdmin = false, needToken = false) {
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
    let headers = needToken ? { Authorization: `Bearer ${token}` } : {};
    let result = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
    });
    return result;
}

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