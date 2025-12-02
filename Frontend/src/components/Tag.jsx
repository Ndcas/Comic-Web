// src/components/Tag.jsx
import React from 'react';

// Component này nhận prop 'name' (Tên thể loại)
function Tag({ name }) {
    if (!name) return null;

    return (
        <span 
            className="inline-block bg-red-100 text-red-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full border border-red-300"
        >
            {name}
        </span>
    );
}

export default Tag;