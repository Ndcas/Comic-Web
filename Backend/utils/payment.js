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
    let status = query.status;
    let trans_ref_no = query.trans_ref_no;
    let website_id = query.website_id;
    let signature = query.signature;
    if (!amount || !reference_number || !status || !trans_ref_no || !website_id || !signature || status != 1) {
        return false;
    }
    let checkSumString = `${amount}|${message}|${payment_type}|${reference_number}|${status}|${trans_ref_no}|${website_id}|${VTC_PAY_SECRET_KEY}`;
    if (sha256(checkSumString).toUpperCase() != signature) {
        return false;
    }
    return true;
}

module.exports = { getURL, verify };