import { createContext, useContext, useEffect, useState } from "react";

// 🛠️ SỬA LỖI: Thêm giá trị mặc định vào createContext
const AuthContext = createContext({
    user: null, 
    login: () => { console.error("login function called outside AuthProvider"); }, 
    logout: () => {}, 
    updateToken: () => {}, // 🚨 Thêm hàm mặc định cho updateToken
    loading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hàm lấy thông tin user từ Local Storage
    const getUserFromLocalStorage = () => {
        // Lưu ý: Backend của bạn sử dụng 'token' thay vì 'accessToken'
        const token = localStorage.getItem("token"); 
        const role = localStorage.getItem("role");
        const email = localStorage.getItem("email"); 
        const exp = localStorage.getItem("exp");     

        // Chúng ta giả định TenTaiKhoan cũng được lưu ở đây sau khi đăng nhập/đăng ký
        const tenTaiKhoan = localStorage.getItem("tenTaiKhoan"); 

        if (token && role && email && exp) {
            console.log("DEBUG: AuthContext read success:", { token: token.substring(0, 10) + '...', role, email });
            // Trả về đối tượng user có các trường cần thiết
            return { token, role, email: email || 'User', exp, TenTaiKhoan: tenTaiKhoan || email }; 
        }
        
        console.log("DEBUG: AuthContext read failed (some keys missing).");
        return null;
    };

    // Hàm được gọi từ Login.jsx
    const login = () => {
        const loggedInUser = getUserFromLocalStorage();
        setUser(loggedInUser);
        console.log("DEBUG: login() called, user state updated:", loggedInUser);
    };

    /**
     * Cập nhật Access Token và TenTaiKhoan sau khi Đổi tên thành công.
     * @param {string} newToken - Access Token mới.
     * @param {number} newExpiry - Thời gian hết hạn mới (timestamp).
     * @param {string} [newTenTaiKhoan] - Tên tài khoản mới (Tùy chọn).
     */
    const updateToken = (newToken, newExpiry, newTenTaiKhoan = null) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('exp', newExpiry);

        // Cập nhật tên tài khoản nếu được cung cấp (từ Profile.jsx)
        if (newTenTaiKhoan) {
            localStorage.setItem('tenTaiKhoan', newTenTaiKhoan);
        }

        // Cập nhật state user
        setUser(prevUser => {
            if (prevUser) {
                return {
                    ...prevUser,
                    token: newToken,
                    exp: newExpiry,
                    ...(newTenTaiKhoan && { TenTaiKhoan: newTenTaiKhoan }) // Thêm TenTaiKhoan nếu có
                };
            }
            // Trường hợp hy hữu: updateToken được gọi khi user là null
            return getUserFromLocalStorage(); 
        });

        console.log("DEBUG: Token và thông tin người dùng đã được cập nhật.");
    };


    // Hàm Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("exp"); 
        localStorage.removeItem("email"); 
        localStorage.removeItem("tenTaiKhoan"); // 🚨 Thêm xóa TenTaiKhoan
        setUser(null); 
    };

    // Khởi tạo: Kiểm tra Local Storage khi ứng dụng load
    useEffect(() => {
        setUser(getUserFromLocalStorage());
        setLoading(false);
    }, []);

    const value = {
        user, 
        logout, 
        login, 
        loading,
        updateToken, // 🚨 Cần expose hàm này
    };

    return (
        <AuthContext.Provider value={value}> 
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// 💡 NAMED EXPORT cho Hook (Giữ nguyên)
export const useAuth = () => useContext(AuthContext);