// src/pages/PaymentResultPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

function PaymentResultPage() {
    const { NDID } = useParams(); // Lấy NDID từ URL path
    const location = useLocation(); 

    // Các tham số này được Backend Controller xử lý, ta chỉ dùng để hiển thị thông báo.
    const query = new URLSearchParams(location.search);
    const status = query.get('status'); // Mã trạng thái VTC Pay (1 là Thành công)

    const [message, setMessage] = useState('Đang kiểm tra kết quả giao dịch...');
    const [isSuccess, setIsSuccess] = useState(false);
    
    useEffect(() => {
        // Kiểm tra mã trạng thái VTC Pay. Backend đã xác nhận và cộng điểm.
        if (status === '1') {
            setIsSuccess(true);
            setMessage('🎉 Nạp điểm thành công! Số điểm của bạn đã được cập nhật.');
        } else if (status) {
            setIsSuccess(false);
            // Có thể hiển thị mã lỗi chi tiết hơn nếu cần
            setMessage(`❌ Giao dịch thất bại (Status: ${status}). Vui lòng kiểm tra lại.`);
        } else {
            setIsSuccess(false);
            setMessage('Đã xảy ra lỗi không xác định khi xử lý giao dịch.');
        }

    }, [status]);


    return (
        <div className={`payment-result-page ${isSuccess ? 'success' : 'failure'}`}>
            <h1>{isSuccess ? 'Giao Dịch Thành Công' : 'Giao Dịch Thất Bại'}</h1>
            <p className="result-message">**{message}**</p>
            <p>Mã người dùng: {NDID}</p>

            <Link to="/profile" className="back-button">
                Quay lại Trang Cá Nhân
            </Link>
        </div>
    );
}

export default PaymentResultPage;