import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaFire, FaFeather } from 'react-icons/fa';

function SectionHeader({ title, linkTo, iconType }) {
    
    let IconComponent;
    if (iconType === 'hot') {
        IconComponent = FaFire;
    } else if (iconType === 'new') {
        IconComponent = FaFeather;
    } else {
        IconComponent = FaFire;
    }
    
    return (
        <div className="flex justify-between items-center mb-6 pt-4 border-b-4 border-red-600">
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
                <IconComponent className="text-red-600 mr-3 text-2xl animate-pulse" />
                {title}
            </h2>
            
            <Link 
                to={linkTo} 
                className="flex items-center text-sm font-semibold text-gray-600 hover:text-red-700 
                            bg-gray-100 px-3 py-1 rounded-full transition-all duration-300 hover:shadow-md"
                title={`Xem tất cả truyện trong mục ${title}`}
            >
                TẤT CẢ
                <FaChevronRight className="ml-1 text-xs" />
            </Link>
        </div>
    );
}

export default SectionHeader;