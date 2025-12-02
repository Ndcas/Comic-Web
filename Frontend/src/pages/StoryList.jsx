import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import ComicCard from '../components/ComicCard';
import Pagination from '../components/Pagination';
import HeaderBar from '../components/HeaderBar';
import { FaSearch, FaFire, FaFeather, FaExclamationCircle, FaList, FaTag } from 'react-icons/fa';
import { get, post } from '../utils/request';

// CẤU HÌNH API
// 1. API_BASE_URL: Chỉ chứa Giao thức, Domain và Port.
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// 2. API_PREFIX: Chứa tiền tố định tuyến (route) chung của API, ví dụ: /api/v1 hoặc /truyen
// Giữ nguyên là '/truyen'
const API_PREFIX = '/truyen';

// Giới hạn mặc định cho trang danh sách truyện lớn
// const STORY_LIMIT_PER_PAGE = 18;

function StoryList() {
    // 1. Lấy thông tin từ URL
    const location = useLocation();
    // Lấy keyword từ param, nếu không có thì lấy từ state (khi điều hướng)
    const { keyword: paramKeyword, TLID } = useParams();

    // Lấy keyword từ location.state, nếu có, ưu tiên hơn cho các trường hợp tìm kiếm từ header/chỗ khác
    const keyword = location.state?.keyword || paramKeyword;

    const [genreName, setGenreName] = useState('');
    const [comics, setComics] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPages, setMaxPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Xây dựng Tiêu đề Trang và Base Path API
    const getPageContext = (pathname, currentKeyword, currentGenreName) => {
        // Chỉ định phần cuối của endpoint
        let path = '/all';
        let isValidSearch = true;
        let title = "Danh Sách Truyện Đầy Đủ";
        let icon = FaList;
        // Biến để cảnh báo cần TLID
        let requiresTlid = false;

        if (pathname.includes('/search')) {
            const trimmedKeyword = currentKeyword ? currentKeyword.trim() : '';
            // Kiểm tra từ khóa có hợp lệ không
            isValidSearch = trimmedKeyword.length > 0;

            title = isValidSearch ? `Kết quả tìm kiếm cho: "${trimmedKeyword}"` : "Tìm kiếm Truyện";
            // CHỈNH SỬA: Thay /search thành /truyenTheoTuKhoa để khớp với backend controller
            path = '/truyenTheoTuKhoa';
            icon = FaSearch;
        } else if (pathname === '/new') {
            title = "Truyện Mới Cập Nhật";
            path = '/truyenMoi';
            icon = FaFeather;
            // } else if (pathname === '/hot') {
            //     title = "Truyện Đang HOT Nhất";
            //     path = '/truyenHot';
            //     icon = FaFire;
        } else if (pathname.includes('/genre/')) {
            // Xử lý trang Thể loại
            title = `Truyện thuộc thể loại: ${currentGenreName}`;
            // CHỈNH SỬA: Thay /genre thành /truyenTheoTheLoai để khớp với backend controller
            path = '/truyenTheoTheLoai';
            icon = FaTag;
            requiresTlid = true; // Cần ID Thể loại (TLID) thay vì tên (genreName)
        }

        // Kết hợp Prefix và Path để tạo Endpoint hoàn chỉnh
        const endpoint = `${API_PREFIX}${path}`;

        // Trả về endpoint cần gọi (ví dụ: /truyen/truyenTheoTuKhoa)
        return { title, endpoint, icon, isValidSearch, requiresTlid };
    };

    const { title, endpoint, icon: Icon, isValidSearch, requiresTlid } = getPageContext(location.pathname, keyword, genreName);

    // 2. Hàm Fetch Dữ Liệu Chung (Sử dụng Axios 'params')
    const fetchStories = useCallback(async (page, currentEndpoint, currentKeyword, tlid) => {
        // KIỂM TRA TÌM KIẾM HỢP LỆ
        if (!isValidSearch && currentEndpoint.includes('/truyenTheoTuKhoa')) {
            setComics([]);
            setMaxPages(1);
            setCurrentPage(1);
            setLoading(false);
            setError("Vui lòng nhập ít nhất một từ khóa để tìm kiếm.");
            return;
        }

        // KIỂM TRA THỂ LOẠI (Cần TLID thay vì GenreName)
        if (requiresTlid && isNaN(parseInt(TLID))) {
            setComics([]);
            setMaxPages(1);
            setCurrentPage(1);
            setLoading(false);
            // Tạm thời báo lỗi vì frontend đang gửi tên (genreName) mà backend cần ID (TLID)
            setError(`LỖI THAM SỐ THỂ LOẠI: Backend yêu cầu ID thể loại (TLID) nhưng frontend đang truyền tên thể loại ("${currentGenreName}"). Bạn cần thay đổi logic để lấy TLID trước khi gọi.`);
            return;
        }

        setLoading(true);
        setError(null);

        const requestParams = {
            // limit: STORY_LIMIT_PER_PAGE,
            page: page, // ĐẢM BẢO 'page' LUÔN CÓ MẶT
        };

        // Thêm keyword nếu đang ở trang tìm kiếm
        if (currentEndpoint.includes('/truyenTheoTuKhoa') && currentKeyword && currentKeyword.trim().length > 0) {
            requestParams.keyword = currentKeyword.trim();
        }

        // Thêm TLID nếu đang ở trang thể loại
        if (currentEndpoint.includes('/truyenTheoTheLoai')) {
            // Backend controller yêu cầu TLID, nên ta giả định genreName hiện tại là TLID
            requestParams.TLID = parseInt(tlid);
        }

        // Xây dựng URL hoàn chỉnh
        const fullUrl = `${VITE_BACKEND_URL}${currentEndpoint}`;

        try {
            let url = new URL(fullUrl);
            for (let key in requestParams) {
                url.searchParams.append(key, requestParams[key]);
            }
            let response = null;
            if (localStorage.getItem('role') == 'NguoiDung' && localStorage.getItem('token')) {
                response = await get(url, false, true);
            } else {
                response = await get(url);
            }
            let data = await response.json();
            if (!response.ok) {
                return new Error(data.error);
            }
            // Axios sẽ tự động nối requestParams vào URL
            // const response = await axios.get(fullUrl, { params: requestParams });
            // const data = response.data.data || response.data;

            // Xử lý dữ liệu trả về từ API
            // Backend trả về `truyens` cho tất cả các endpoint (truyenMoi, truyenTheoTuKhoa, truyenTheoTheLoai)
            // const fetchedComics = data.truyens || data.results || [];
            if (data.theLoai) {
                setGenreName(data.theLoai.TenTheLoai);
            }
            const fetchedComics = data.truyens;

            // Xử lý trường hợp không có kết quả
            if (fetchedComics.length === 0) {
                setComics([]);
                setMaxPages(1);
                // Nếu là tìm kiếm không có kết quả, không báo lỗi, chỉ báo không tìm thấy
                if (currentEndpoint.includes('/truyenTheoTuKhoa') && currentKeyword && currentKeyword.trim().length > 0) {
                    setError(`Không tìm thấy kết quả nào cho từ khóa "${currentKeyword.trim()}"`);
                } else {
                    setError(null); // Clear lỗi nếu không có lỗi thực sự
                }
            } else {
                setComics(fetchedComics);
                // Cập nhật phân trang từ response backend
                setCurrentPage(data.trangHienTai || page);
                setMaxPages(data.trangToiDa || 1);
                setError(null); // Reset lỗi sau khi tải thành công
            }

        } catch (error) {
            // // Lấy URL thực tế mà Axios đã tạo để báo lỗi chi tiết
            // const failedUrl = `${fullUrl}?${new URLSearchParams(requestParams).toString()}`;
            // console.error("Lỗi tải danh sách truyện:", err);

            // // THÔNG BÁO LỖI RÕ RÀNG VỀ 404
            // if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
            //     setError(`LỖI 404 (NOT FOUND): Server không tìm thấy endpoint "${currentEndpoint}". Vui lòng kiểm tra lại định tuyến Backend. API đã gọi: ${failedUrl}`);
            // } else {
            //     setError(`Lỗi kết nối API: ${err.message}. API đã gọi: ${failedUrl}`);
            // }
            setError(error.message || 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    }, [isValidSearch, requiresTlid]);

    // 3. Effect Tải Dữ Liệu
    useEffect(() => {
        // Reset về trang 1 và tải lại khi đường dẫn/keyword/genreName thay đổi
        setCurrentPage(1);
        fetchStories(1, endpoint, keyword, TLID);
    }, [endpoint, keyword, TLID, fetchStories]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchStories(page, endpoint, keyword, TLID); // Tải dữ liệu cho trang mới
        window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* HeaderBar cần được đảm bảo là Component đã import và hoạt động đúng */}
            <HeaderBar />

            <div className="container mx-auto p-4 max-w-7xl pt-8">

                {/* HIỂN THỊ LOADING */}
                {loading && (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        <p className="ml-4 text-xl text-gray-600">Đang tải {title}...</p>
                    </div>
                )}

                {/* HIỂN THỊ LỖI HOẶC KHÔNG CÓ KẾT QUẢ TÌM KIẾM */}
                {!loading && error && (
                    <div className="text-center p-8 text-xl text-red-600 flex flex-col items-center justify-center bg-red-50 border border-red-200 m-4 rounded-lg shadow-md">
                        <FaExclamationCircle className="mr-2 text-4xl mb-3" />
                        <p className="font-bold">THÔNG BÁO LỖI HOẶC KẾT QUẢ:</p>
                        <p className="text-sm break-all mt-1 font-mono text-gray-800">{error}</p>

                        {/* HƯỚNG DẪN DEBUG NẾU LÀ LỖI 404 */}
                        {error.includes('LỖI 404 (NOT FOUND)') && (
                            <p className="text-sm mt-3 text-red-500">Vui lòng kiểm tra file định tuyến (routing) trên server backend (cổng 8080) để đảm bảo đường dẫn **"{endpoint}"** là hợp lệ. Nếu vẫn lỗi, hãy thử thay đổi `API_PREFIX` trong code.</p>
                        )}
                        {/* HIỂN THỊ KHÔNG TÌM THẤY */}
                        {comics.length === 0 && !error.includes('LỖI 404 (NOT FOUND)') && (
                            <p className="text-sm mt-3 text-gray-500">Hãy thử lại với một từ khóa hoặc thể loại khác.</p>
                        )}
                    </div>
                )}

                {/* RENDER KHI TẢI XONG VÀ CÓ DỮ LIỆU */}
                {!loading && !error && comics.length > 0 && (
                    <>
                        {/* Tiêu đề Trang Chuyên nghiệp */}
                        <div className="flex items-center mb-6 pb-2 border-b-2 border-red-100">
                            {Icon && <Icon className="text-3xl text-red-600 mr-3" />}
                            <h1 className="text-3xl font-extrabold text-gray-800">
                                {title}
                            </h1>
                        </div>

                        {/* Danh sách truyện: Bố cục Grid Responsive */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 
                                            sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {comics.map(comic => (
                                <ComicCard key={comic.TID} comic={comic} />
                            ))}
                        </div>

                        {/* Phân trang */}
                        <div className="mt-10 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                maxPages={maxPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default StoryList;