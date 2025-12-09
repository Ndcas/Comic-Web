// src/components/WalletSection.jsx

import React, { useState } from 'react';
import { Loader2, DollarSign, AlertTriangle, Minus, Plus } from 'lucide-react'; 
import { napDiem, rutDiem } from '../utils/nguoiDungApi.js'; 

const WalletSection = ({ currentDiem, updateDiem, userToken }) => {
    // State để quản lý hành động hiện tại ('nap' hoặc 'rut')
    const [currentAction, setCurrentAction] = useState('nap'); 
    
    const [amount, setAmount] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Xử lý chuyển đổi tab và reset thông báo
    const switchAction = (action) => {
        setCurrentAction(action);
        setMessage('');
        setIsError(false);
        setAmount(100); // Reset amount
    };

    // --- HÀM XỬ LÝ NẠP ĐIỂM (Sử dụng GET /napDiem?diem=X) ---
    const handleNapDiem = async () => {
        if (!userToken || userToken.length === 0) {
             setMessage('❌ Vui lòng đăng nhập để nạp điểm.');
             setIsError(true);
             return;
        }
        if (amount <= 0 || amount < 10) { 
            setMessage('Số điểm nạp phải lớn hơn 10.');
            setIsError(true);
            return;
        }

        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await napDiem(userToken, amount); 
            
            if (response.url) {
                // Chuyển hướng người dùng đến cổng thanh toán
                window.location.href = response.url;
            } else {
                throw new Error('Không nhận được URL thanh toán từ máy chủ.');
            }

        } catch (error) {
            console.error('Lỗi khi nạp điểm:', error);
            // Lỗi 401 được xử lý trong apiCall, hiển thị thông báo yêu cầu đăng nhập lại
            setMessage(error.message || 'Lỗi không xác định khi yêu cầu thanh toán.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- HÀM XỬ LÝ RÚT ĐIỂM (Sử dụng POST /rutDiem) ---
    const handleRutDiem = async () => {
        if (!userToken || userToken.length === 0) {
             setMessage('❌ Vui lòng đăng nhập để rút điểm.');
             setIsError(true);
             return;
        }
        if (amount <= 0 || amount < 10) { 
            setMessage('Số điểm rút phải lớn hơn 10.');
            setIsError(true);
            return;
        }
        if (amount > currentDiem) {
            setMessage('Số điểm rút không được vượt quá số dư hiện tại.');
            setIsError(true);
            return;
        }

        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            await rutDiem(userToken, amount); 
            
            // Cập nhật số dư ở Profile cha và hiển thị thông báo thành công
            updateDiem(currentDiem - amount);
            setMessage('Yêu cầu rút điểm đã được ghi nhận. Admin sẽ xử lý thủ công.');
            setIsError(false);

        } catch (error) {
            console.error('Lỗi khi rút điểm:', error);
            setMessage(error.message || 'Lỗi không xác định khi yêu cầu rút điểm.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="border border-green-500 rounded-xl p-5 mt-6 bg-green-50 dark:bg-gray-700/50">
            <h3 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400 flex items-center">
                <DollarSign className="mr-2" size={24} /> Quản Lý Điểm
            </h3>

            {/* TAB CHUYỂN ĐỔI */}
            <div className="flex mb-4 border-b dark:border-gray-600">
                <button
                    onClick={() => switchAction('nap')}
                    className={`px-4 py-2 text-lg font-semibold transition ${
                        currentAction === 'nap' 
                            ? 'text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Nạp Điểm
                </button>
                <button
                    onClick={() => switchAction('rut')}
                    className={`px-4 py-2 text-lg font-semibold transition ${
                        currentAction === 'rut' 
                            ? 'text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Rút Điểm
                </button>
            </div>
            {/* KẾT THÚC TAB CHUYỂN ĐỔI */}

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm ${isError ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                    {isError ? <AlertTriangle className="inline mr-1" size={16} /> : null} {message}
                </div>
            )}
            
            {/* ------------------ GIAO DIỆN NẠP ĐIỂM ------------------ */}
            {currentAction === 'nap' && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        1 Điểm = 1,000 VNĐ (Quy ước có thể thay đổi)
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
                            min="10"
                            disabled={isLoading}
                        />
                        
                        <button
                            onClick={handleNapDiem}
                            disabled={isLoading || amount < 10}
                            className="flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Plus size={20} className="mr-2" />}
                            {isLoading ? 'Đang xử lý...' : `Nạp ${amount.toLocaleString()} Điểm`}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        *Số điểm nạp tối thiểu là 10.
                    </p>
                </div>
            )}
            {/* ------------------ KẾT THÚC GIAO DIỆN NẠP ĐIỂM ------------------ */}

            {/* ------------------ GIAO DIỆN RÚT ĐIỂM ------------------ */}
            {currentAction === 'rut' && (
                <div className="mt-4">
                    <p className="text-sm text-red-500 dark:text-red-400 mb-2">
                        *Lưu ý: Yêu cầu rút điểm sẽ được Admin xử lý thủ công.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
                            min="10"
                            disabled={isLoading}
                        />
                        
                        <button
                            onClick={handleRutDiem}
                            disabled={isLoading || amount < 10 || amount > currentDiem}
                            className="flex items-center justify-center px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Minus size={20} className="mr-2" />}
                            {isLoading ? 'Đang xử lý...' : `Rút ${amount.toLocaleString()} Điểm`}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        *Số điểm rút tối thiểu là 10. Số dư hiện tại: {currentDiem?.toLocaleString() || 0} Điểm.
                    </p>
                </div>
            )}
            {/* ------------------ KẾT THÚC GIAO DIỆN RÚT ĐIỂM ------------------ */}
        </div>
    );
};

export default WalletSection;