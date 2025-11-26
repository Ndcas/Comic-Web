import React from 'react';

const Pagination = ({ currentPage, maxPages, onPageChange }) => {
    // Tạo mảng các số trang để hiển thị (ví dụ: tối đa 7 nút)
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 7; 
        
        // Logic để hiển thị các nút gần trang hiện tại
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(maxPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <div className="flex justify-center space-x-1">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
                Trước
            </button>

            {getPageNumbers().map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 border rounded-md font-semibold transition-colors ${
                        number === currentPage
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                >
                    {number}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === maxPages}
                className="px-3 py-1 border rounded-md text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
                Sau
            </button>
        </div>
    );
};

export default Pagination;