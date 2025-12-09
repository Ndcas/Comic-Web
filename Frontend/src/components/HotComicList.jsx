import React from 'react';
import { Link } from 'react-router-dom';

const HotComicList = ({ comics }) => {
    if (!comics || comics.length === 0) {
        return <div className="text-gray-500 italic">Không có truyện hot nào được tìm thấy.</div>;
    }

    return (
        <ol className="list-decimal pl-5 space-y-3">
            {comics.map((comic, index) => (
                <li key={comic.TID} className="relative group">
                    <Link to={`/story/${comic.TID}`} className="block">
                        <span className={`absolute -left-5 top-0.5 text-lg font-bold ${
                            index < 3 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                            {index + 1}.
                        </span>
                        <div className="ml-0">
                            <h4 className="text-gray-800 font-medium hover:text-red-600 transition-colors truncate">
                                {comic.TenTruyen}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                                Tác giả: {comic.TacGia}
                            </p>
                        </div>
                    </Link>
                </li>
            ))}
        </ol>
    );
};

export default HotComicList;