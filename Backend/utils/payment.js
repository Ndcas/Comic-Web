const { sha256 } = require('js-sha256');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const VTC_PAY_SECRET_KEY = process.env.VTC_PAY_SECRET_KEY || 'ocvc!t7$JQoKcRon'
const VTC_PAY_WEBSITE_ID = parseInt(process.env.VTC_PAY_WEBSITE_ID) || 200797;
const VTC_PAY_URL = process.env.VTC_PAY_URL || 'https://alpha1.vtcpay.vn/portalgateway/checkout.html';

function getURL(amount, returnPath) {
    let url = new URL(VTC_PAY_URL);
    let currency = 'VND';
    let currentDate = new Date();
    let second = currentDate.getSeconds().toString().padStart(2, '0');
    let minute = currentDate.getMinutes().toString().padStart(2, '0');
    let hour = currentDate.getHours().toString().padStart(2, '0');
    let day = currentDate.getDate().toString().padStart(2, '0');
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    let year = currentDate.getFullYear();
    let random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    let reference_number = `${hour}${minute}${second}${day}${month}${year}${random}`;
    let url_return = `${BASE_URL}${returnPath}`;
    let signature = sha256(`${amount}|${currency}|${reference_number}|${url_return}|${VTC_PAY_WEBSITE_ID}|${VTC_PAY_SECRET_KEY}`);
    url.searchParams.set('amount', amount);
    url.searchParams.set('currency', currency);
    url.searchParams.set('reference_number', reference_number);
    url.searchParams.set('url_return', url_return);
    url.searchParams.set('website_id', VTC_PAY_WEBSITE_ID);
    url.searchParams.set('signature', signature);
    return url.toString();
}

function verify(query) {
    let amount = parseInt(query.amount);
    let message = query.message || '';
    let payment_type = query.payment_type || '';
    let reference_number = query.reference_number;
    let status = parseInt(query.status);
    let trans_ref_no = query.trans_ref_no;
    let website_id = query.website_id;
    let signature = query.signature;
    if (!amount || !reference_number || !status || !trans_ref_no || !website_id || !signature) {
        return {
            ok: false,
            error: 'Thiếu dữ liệu',
            transID: reference_number
        };
    }
    let error = null;
    switch (status) {
        case 7:
            error = 'Giao dịch đang được bộ phận quản trị thanh toán của VTC sẽ duyệt để quyết định giao dịch thành công hay thất bại';
            break;
        case 0:
            error = 'Giao dịch ở trạng thái khởi tạo';
            break;
        case -1:
            error = 'Giao dịch thất bại';
            break;
        case -3:
            error = 'Quản trị VTC hủy giao dịch';
            break;
        case -4:
            error = 'Thẻ/tài khoản không đủ điều kiện giao dịch';
            break;
        case -5:
            error = 'Số dư tài khoản khách hàng không đủ để thực hiện giao dịch';
            break;
        case -6:
            error = 'Lỗi giao dịch tại VTC';
            break;
        case -7:
            error = 'Khách hàng nhập sai thông tin thanh toán';
            break;
        case -8:
            error = 'Quá hạn mức giao dịch trong ngày';
            break;
        case -9:
            error = 'Khách hàng tự hủy giao dịch';
            break;
        case -21:
            error = 'Trùng mã giao dịch';
            break;
        case -22:
            error = 'Số tiền thanh toán đơn hàng quá nhỏ';
            break;
        case -23:
            error = 'WebsiteID không tồn tại';
            break;
        case -24:
            error = 'Đơn vị tiền tệ thanh toán đơn hàng không hợp lệ';
            break;
        case -25:
            error = 'Tài khoản VTC Pay nhận tiền không tồn tại';
            break;
        case -28:
            error = 'Thiếu tham số bắt buộc phải có trong một đơn hàng thanh toán online';
            break;
        case -29:
            error = 'Tham số request không hợp lệ';
            break;
        case -99:
            error = 'Lỗi chưa rõ nguyên nhân và chưa biết trạng thái giao dịch';
            break;
    }
    if (error) {
        return {
            ok: false,
            error: error,
            transID: trans_ref_no
        };
    }
    let checkSumString = `${amount}|${message}|${payment_type}|${reference_number}|${status}|${trans_ref_no}|${website_id}|${VTC_PAY_SECRET_KEY}`;
    if (sha256(checkSumString).toUpperCase() != signature) {
        return {
            ok: false,
            error: 'Yêu cầu không khớp với chuỗi ký',
            transID: trans_ref_no
        };
    }
    return {
        ok: true,
        transID: trans_ref_no
    };
}

module.exports = { getURL, verify };