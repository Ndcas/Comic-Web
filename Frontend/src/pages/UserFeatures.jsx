import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, List, Edit3, Save, LogIn, X, BookOpen, Heart, DollarSign, ArrowUpCircle, ArrowDownCircle, Trash2, Key, LogOut, Shield, Users } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, addDoc, serverTimestamp, deleteDoc, runTransaction } from 'firebase/firestore'; // Thêm runTransaction

// --- CẤU HÌNH FIREBASE VÀ KHỞI TẠO TỰ ĐỘNG ---

// Biến toàn cục bắt buộc phải có trong môi trường Canvas
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Khởi tạo Firebase
let app, db, auth;
if (Object.keys(firebaseConfig).length > 0) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  // import { setLogLevel } from "firebase/firestore"; setLogLevel('debug'); 
}

// --- DỮ LIỆU GIẢ LẬP & HẰNG SỐ ---
const MOCK_USER_PROFILE = {
  name: 'Người dùng mới',
  email: 'chưa_xác định@example.com',
  location: 'Vị trí Mặc định',
  bio: 'Xin chào! Hãy cập nhật hồ sơ của tôi.',
  balance: 100000,
  role: 'user', // Thêm vai trò mặc định
};

const ADMIN_ID = 'example-admin-id'; // ID người dùng giả lập là Admin.
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Áo phông Basic', price: 250000, description: 'Chất liệu cotton thoáng mát, phù hợp hàng ngày.', imageUrl: 'https://placehold.co/100x100/4F46E5/FFFFFF?text=Product+1', type: 'Sản phẩm' },
  { id: 'p2', name: 'Tai nghe không dây X1', price: 1200000, description: 'Âm thanh sống động, pin 8 giờ liên tục.', imageUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=Product+2', type: 'Sản phẩm' },
  { id: 'p3', name: 'Sách "Kỹ năng Lãnh đạo"', price: 150000, description: 'Tuyển tập các bài học quản lý và phát triển bản thân.', imageUrl: 'https://placehold.co/100x100/EF4444/FFFFFF?text=Product+3', type: 'Truyện/Sách' },
  { id: 'p4', name: 'Chương 1: Khởi đầu mới', price: 0, description: 'Chương đầu của bộ tiểu thuyết giả tưởng.', imageUrl: 'https://placehold.co/100x100/FACC15/000000?text=Chapter', type: 'Truyện/Sách' },
];


// Component chính
const App = () => {
  // States chính
  const [profile, setProfile] = useState(MOCK_USER_PROFILE);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // States cho tính năng
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(MOCK_USER_PROFILE);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [depositAmount, setDepositAmount] = useState(50000);
  const [withdrawAmount, setWithdrawAmount] = useState(10000);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States cho Admin
  const [allUsers, setAllUsers] = useState([]); // Chứa danh sách người dùng (tatCaNguoiDung)
  const [editingUser, setEditingUser] = useState(null); // User đang được Admin chỉnh sửa
  const [adminEditForm, setAdminEditForm] = useState(null); // Form chỉnh sửa của Admin

  const isAdmin = profile.role === 'admin';


  // --- LOGIC KHỞI TẠO VÀ LẮNG NGHE FIRESTORE ---
  useEffect(() => {
    if (!db || !auth) {
      console.error("Firebase is not initialized. Using mock data only.");
      setIsLoading(false);
      return;
    }

    const signInAndListen = async () => {
      try {
        // 1. Đăng nhập
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Lỗi xác thực Firebase:", error);
      }

      // 2. Lắng nghe trạng thái Auth
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        const currentUserId = user ? user.uid : crypto.randomUUID();
        // Giả lập role admin nếu ID khớp
        const initialRole = currentUserId === ADMIN_ID ? 'admin' : 'user';

        setUserId(currentUserId);
        setIsAuthReady(true);
        setIsLoading(false);

        if (!currentUserId) return;

        const userPath = `/artifacts/${appId}/users/${currentUserId}`;

        // 3. Setup Listener cho Profile
        const profileDocRef = doc(db, userPath, 'profile_data', 'main');
        const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
          let data = MOCK_USER_PROFILE;
          if (docSnap.exists()) {
            data = docSnap.data();
          }
          // Đảm bảo role luôn tồn tại
          if (!data.role) {
            data.role = initialRole;
            setDoc(profileDocRef, { role: initialRole }, { merge: true }).catch(console.error);
          }
          // Đảm bảo balance luôn tồn tại
          if (data.balance === undefined) {
            setDoc(profileDocRef, { balance: MOCK_USER_PROFILE.balance }, { merge: true }).catch(console.error);
          }

          setProfile(data);
          if (!isEditing) setEditForm(data);

          // Cập nhật Profile vào Public Data để Admin có thể xem (tatCaNguoiDung)
          const publicProfileRef = doc(db, `/artifacts/${appId}/public/data/user_profiles`, currentUserId);
          setDoc(publicProfileRef, {
            uid: currentUserId,
            name: data.name || MOCK_USER_PROFILE.name,
            email: data.email || MOCK_USER_PROFILE.email,
            balance: data.balance || MOCK_USER_PROFILE.balance,
            role: data.role || initialRole,
            lastSeen: serverTimestamp()
          }, { merge: true }).catch(console.error);

        }, (error) => console.error("Lỗi Profile snapshot:", error));

        // 4. Setup Listener cho Cart Items (Giữ nguyên)
        const cartCollectionRef = collection(db, userPath, 'cart_items');
        const unsubscribeCart = onSnapshot(cartCollectionRef, (snapshot) => {
          const items = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }));
          setCartItems(items);
        }, (error) => console.error("Lỗi Cart snapshot:", error));

        // 5. Setup Listener cho Reading History (Giữ nguyên)
        const historyCollectionRef = collection(db, userPath, 'reading_history');
        const unsubscribeHistory = onSnapshot(historyCollectionRef, (snapshot) => {
          const rawItems = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            rawTimestamp: d.data().timestamp,
            timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toLocaleTimeString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
          }));
          rawItems.sort((a, b) => (b.rawTimestamp?.toMillis() || 0) - (a.rawTimestamp?.toMillis() || 0));
          setReadingHistory(rawItems);
        }, (error) => console.error("Lỗi Reading History snapshot:", error));

        // 6. Setup Listener cho Favorites (Giữ nguyên)
        const favoritesCollectionRef = collection(db, userPath, 'favorites');
        const unsubscribeFavorites = onSnapshot(favoritesCollectionRef, (snapshot) => {
          const items = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }));
          setFavorites(items);
        }, (error) => console.error("Lỗi Favorites snapshot:", error));

        // 7. Setup Listener cho Activity Log (Giữ nguyên)
        const activityCollectionRef = collection(db, userPath, 'activity_log');
        const unsubscribeActivity = onSnapshot(activityCollectionRef, (snapshot) => {
          const rawLogs = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            rawTimestamp: d.data().timestamp,
            timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toLocaleTimeString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
          }));
          rawLogs.sort((a, b) => (b.rawTimestamp?.toMillis() || 0) - (a.rawTimestamp?.toMillis() || 0));
          setActivityLog(rawLogs);
        }, (error) => console.error("Lỗi Activity Log snapshot:", error));

        // 8. Setup Listener cho All Users (tatCaNguoiDung) - Chỉ chạy nếu là Admin
        let unsubscribeAllUsers = () => { };
        if (initialRole === 'admin') {
          const allUsersCollectionRef = collection(db, `/artifacts/${appId}/public/data/user_profiles`);
          unsubscribeAllUsers = onSnapshot(allUsersCollectionRef, (snapshot) => {
            const users = snapshot.docs.map(d => ({
              id: d.id,
              ...d.data(),
              lastSeen: d.data().lastSeen?.toDate ? d.data().lastSeen.toDate().toLocaleTimeString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Không rõ'
            }));
            // Sắp xếp để Admin thấy tài khoản của mình đầu tiên
            users.sort((a, b) => (a.uid === currentUserId ? -1 : 1));
            setAllUsers(users);
            if (activeTab === 'admin') setActiveTab('admin'); // Force refresh admin tab
          }, (error) => console.error("Lỗi All Users snapshot:", error));
        }

        // Dọn dẹp listener khi component unmount
        return () => {
          unsubscribeProfile();
          unsubscribeCart();
          unsubscribeHistory();
          unsubscribeFavorites();
          unsubscribeActivity();
          unsubscribeAllUsers();
        };
      });

      // Dọn dẹp listener Auth
      return () => unsubscribeAuth();
    };

    signInAndListen();
  }, []);

  // --- CÁC CHỨC NĂNG HỆ THỐNG ---

  // Chức năng: Lưu thông tin người dùng (doiTenTaiKhoan đã bao gồm ở đây)
  const handleSaveProfile = async () => {
    if (!db || !userId) return;

    try {
      const profilePath = `/artifacts/${appId}/users/${userId}/profile_data`;
      const profileDocRef = doc(db, profilePath, 'main');

      // Chỉ cho phép cập nhật name, bio, location
      await setDoc(profileDocRef, {
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location
      }, { merge: true });

      const activityPath = `/artifacts/${appId}/users/${userId}/activity_log`;
      await addDoc(collection(db, activityPath), {
        action: 'Cập nhật thông tin cá nhân (doiTenTaiKhoan)',
        timestamp: serverTimestamp(),
      });

      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công!");

    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
    }
  };

  // Chức năng: Đổi Mật khẩu (doiMatKhau) - Mô phỏng (Giữ nguyên)
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    // Mô phỏng logic đổi mật khẩu thành công.
    try {
      const activityPath = `/artifacts/${appId}/users/${userId}/activity_log`;
      await addDoc(collection(db, activityPath), {
        action: `Đổi mật khẩu thành công (doiMatKhau)`,
        timestamp: serverTimestamp(),
        type: 'security'
      });

      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert("Đổi mật khẩu thành công!");

    } catch (error) {
      console.error("Lỗi khi mô phỏng đổi mật khẩu:", error);
      alert("Lỗi khi đổi mật khẩu. Vui lòng thử lại.");
    }
  };

  // Chức năng: Đăng xuất (dangXuat) - Mô phỏng (Giữ nguyên)
  const handleSignOut = async () => {
    if (!auth) return;

    try {
      // Ghi log trước khi Auth bị reset
      const activityPath = `/artifacts/${appId}/users/${userId}/activity_log`;
      await addDoc(collection(db, activityPath), {
        action: `Người dùng đã Đăng xuất (dangXuat)`,
        timestamp: serverTimestamp(),
        type: 'security'
      }).catch(e => console.error("Lỗi khi ghi log Đăng xuất:", e));

      await signOut(auth);

      // Reset tất cả state
      setProfile(MOCK_USER_PROFILE);
      setCartItems([]);
      setActivityLog([]);
      setReadingHistory([]);
      setFavorites([]);
      setUserId(null);
      setIsAuthReady(false);
      setIsLoading(true);

      alert("Bạn đã đăng xuất thành công. Ứng dụng sẽ tự động đăng nhập ẩn danh lại.");

    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      alert("Đăng xuất thất bại. Vui lòng kiểm tra console.");
    }
  };

  // Chức năng: Cập nhật người dùng khác (capNhatNguoiDung)
  const handleAdminUpdateUser = async () => {
    if (!db || !isAdmin || !editingUser || !adminEditForm) return;

    const targetUid = editingUser.uid;
    const oldBalance = editingUser.balance || 0;
    const newBalance = parseInt(adminEditForm.balance) || 0;
    const balanceChange = newBalance - oldBalance;
    const actionType = balanceChange > 0 ? 'deposit_admin' : (balanceChange < 0 ? 'withdraw_admin' : 'update_admin');

    // Cập nhật Profile trong Public Collection
    const publicProfileRef = doc(db, `/artifacts/${appId}/public/data/user_profiles`, targetUid);

    // Cập nhật Profile trong Private Collection
    const privateProfileRef = doc(db, `/artifacts/${appId}/users/${targetUid}/profile_data`, 'main');

    try {
      await runTransaction(db, async (transaction) => {

        // 1. Cập nhật Public Profile
        transaction.set(publicProfileRef, {
          name: adminEditForm.name,
          balance: newBalance,
          role: adminEditForm.role,
        }, { merge: true });

        // 2. Cập nhật Private Profile (chỉ name, role, balance)
        transaction.set(privateProfileRef, {
          name: adminEditForm.name,
          balance: newBalance,
          role: adminEditForm.role,
        }, { merge: true });
      });

      // 3. Ghi log hoạt động của Admin
      const adminActivityPath = `/artifacts/${appId}/users/${userId}/activity_log`;
      await addDoc(collection(db, adminActivityPath), {
        action: `Admin đã Cập nhật người dùng ${targetUid} (capNhatNguoiDung): Tên='${adminEditForm.name}', Điểm=${newBalance.toLocaleString('vi-VN')}`,
        timestamp: serverTimestamp(),
        type: actionType
      });

      alert(`Cập nhật thông tin người dùng ${targetUid} thành công!`);
      setEditingUser(null);
      setAdminEditForm(null);

    } catch (error) {
      console.error("Lỗi khi Admin cập nhật người dùng:", error);
      alert("Cập nhật thất bại. Vui lòng kiểm tra console.");
    }
  };

  // Các chức năng khác (Giữ nguyên)
  const handleAddToCart = async (product) => { /* ... giữ nguyên logic ... */ };
  const handleRemoveFromCart = async (itemId) => { /* ... giữ nguyên logic ... */ };
  const handleReadItem = async (item) => { /* ... giữ nguyên logic ... */ };
  const handleToggleFavorite = async (item) => { /* ... giữ nguyên logic ... */ };
  const handleDeposit = async () => { /* ... giữ nguyên logic ... */ };
  const handleWithdraw = async () => { /* ... giữ nguyên logic ... */ };

  // --- CÁC COMPONENT PHỤ (Modal và Tab Content) ---

  // Component Modal Đổi Mật khẩu (Giữ nguyên)
  const PasswordModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4" onClick={() => setShowPasswordModal(false)}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 p-6">
          <h3 className="text-2xl font-bold text-indigo-700 flex items-center">
            <Key className="w-6 h-6 mr-2" /> Đổi Mật khẩu
          </h3>
          <button
            onClick={() => setShowPasswordModal(false)}
            className="text-gray-500 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="password"
            placeholder="Mật khẩu hiện tại (Mô phỏng: Bất kỳ)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới (Tối thiểu 6 ký tự)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Xác nhận Mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleChangePassword}
            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
          >
            <Save className="w-5 h-5 mr-2" /> Xác nhận Đổi Mật khẩu
          </button>
        </div>
      </div>
    </div>
  );

  // Component Modal Giỏ hàng (Giữ nguyên)
  const CartModal = () => {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 transition-opacity p-4" onClick={() => setShowCart(false)}>
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Modal */}
          <div className="flex justify-between items-center border-b pb-3 p-6">
            <h3 className="text-2xl font-bold text-indigo-700 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2" /> Giỏ Hàng Của Bạn
            </h3>
            <button
              onClick={() => setShowCart(false)}
              className="text-gray-500 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Đóng giỏ hàng"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-10 px-6">
              <p className="text-gray-500 text-lg">Giỏ hàng trống.</p>
            </div>
          ) : (
            <>
              {/* Danh sách Sản phẩm */}
              <div className="flex-1 overflow-y-auto space-y-4 p-6 pt-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md mr-3"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/CCCCCC/000000?text=P"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x {item.price.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="text-right ml-4 flex flex-col items-end">
                      <p className="font-bold text-red-500">{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</p>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 text-xs mt-1 underline"
                      >
                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tổng cộng và Thanh toán */}
              <div className="p-6 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Tổng Cộng:</span>
                  <span className="text-indigo-600">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <button
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150"
                  onClick={() => {
                    alert('Chức năng Thanh toán (API /napDiem) sẽ được triển khai ở bước tiếp theo!');
                    setShowCart(false);
                  }}
                >
                  Tiến Hành Thanh Toán
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Component Modal Admin Edit User
  const AdminEditUserModal = () => {
    if (!editingUser || !adminEditForm) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4" onClick={() => setEditingUser(null)}>
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b pb-3 p-6">
            <h3 className="text-2xl font-bold text-green-700 flex items-center">
              <Shield className="w-6 h-6 mr-2" /> Cập nhật Người dùng ({editingUser.uid === userId ? 'Bạn' : editingUser.name})
            </h3>
            <button
              onClick={() => setEditingUser(null)}
              className="text-gray-500 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Đóng"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-500 font-mono break-all mb-4">UID: {editingUser.uid}</p>

            {/* Trường Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên người dùng:</label>
              <input
                type="text"
                value={adminEditForm.name || ''}
                onChange={(e) => setAdminEditForm({ ...adminEditForm, name: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Tên"
              />
            </div>

            {/* Trường Điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Số dư Điểm:</label>
              <input
                type="number"
                value={adminEditForm.balance || 0}
                onChange={(e) => setAdminEditForm({ ...adminEditForm, balance: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Điểm"
              />
            </div>

            {/* Trường Vai trò */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Vai trò:</label>
              <select
                value={adminEditForm.role || 'user'}
                onChange={(e) => setAdminEditForm({ ...adminEditForm, role: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              onClick={handleAdminUpdateUser}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150"
            >
              <Save className="w-5 h-5 mr-2" /> Xác nhận Cập nhật (capNhatNguoiDung)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Component Admin Tab (tatCaNguoiDung & capNhatNguoiDung)
  const AdminTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[400px]">
      <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
        <Users className="w-6 h-6 mr-2 text-green-500" />
        Bảng điều khiển Admin (tatCaNguoiDung)
      </h2>

      <div className="space-y-4">
        {allUsers.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Đang tải danh sách người dùng...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">HĐ Gần nhất</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {allUsers.map(user => (
                  <tr key={user.uid} className={user.uid === userId ? 'bg-yellow-50 font-bold' : ''}>
                    <td className="px-3 py-4 whitespace-nowrap text-gray-900">{user.name} {user.uid === userId && '(Bạn)'}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-gray-500 font-mono text-xs break-all">{user.uid}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                      {user.balance ? user.balance.toLocaleString('vi-VN') : 0}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-gray-500 text-center">{user.lastSeen}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setAdminEditForm({
                            name: user.name,
                            balance: user.balance,
                            role: user.role
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 transition"
                      >
                        <Edit3 className="w-4 h-4 inline-block mr-1" /> Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );


  // Component Wallet Tab (Giữ nguyên)
  const WalletTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[400px]">
      <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
        <DollarSign className="w-6 h-6 mr-2 text-green-500" />
        Ví Điểm (Nạp: `napDiem`, Rút: `rutDiem`)
      </h2>

      {/* Số dư hiện tại */}
      <div className="bg-green-50 p-4 rounded-xl shadow-md mb-6 border border-green-200">
        <p className="text-sm font-medium text-green-700">Số dư hiện tại:</p>
        <p className="text-3xl font-extrabold text-green-600">
          {profile.balance ? profile.balance.toLocaleString('vi-VN') : 0} Điểm
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Nạp Điểm */}
        <div className="p-4 border border-indigo-200 rounded-xl bg-indigo-50">
          <h3 className="flex items-center text-xl font-bold text-indigo-700 mb-4">
            <ArrowUpCircle className="w-5 h-5 mr-2" /> Nạp Điểm
          </h3>
          <div className="space-y-3">
            <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">Số điểm cần nạp:</label>
            <input
              id="depositAmount"
              type="number"
              min="1000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Math.max(1000, parseInt(e.target.value) || 0))}
              className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleDeposit}
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
              Nạp {depositAmount.toLocaleString('vi-VN')} Điểm
            </button>
          </div>
        </div>

        {/* Form Rút Điểm */}
        <div className="p-4 border border-red-200 rounded-xl bg-red-50">
          <h3 className="flex items-center text-xl font-bold text-red-700 mb-4">
            <ArrowDownCircle className="w-5 h-5 mr-2" /> Rút Điểm
          </h3>
          <div className="space-y-3">
            <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700">Số điểm cần rút:</label>
            <input
              id="withdrawAmount"
              type="number"
              min="1000"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Math.max(1000, parseInt(e.target.value) || 0))}
              className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleWithdraw}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150"
            >
              Rút {withdrawAmount.toLocaleString('vi-VN')} Điểm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Hiển thị nội dung Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        // Component Hồ Sơ (Profile)
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[400px]">
            <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
              <User className="w-6 h-6 mr-2 text-indigo-500" />
              Thông tin Cá nhân (Realtime)
            </h2>

            {isEditing ? (
              // Chế độ Chỉnh sửa
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tên (doiTenTaiKhoan)"
                />
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                  placeholder="Tiểu sử"
                />
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Vị trí"
                />
                <button
                  onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                >
                  <Save className="w-5 h-5 mr-2" /> Lưu Thay Đổi
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditForm(profile); }}
                  className="w-full flex items-center justify-center px-4 py-2 mt-2 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition duration-150"
                >
                  <X className="w-5 h-5 mr-2" /> Hủy
                </button>
              </div>
            ) : (
              // Chế độ Xem
              <div className="space-y-4">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-700">Số dư Điểm:</p>
                  <p className="text-xl font-bold text-yellow-600">{profile.balance ? profile.balance.toLocaleString('vi-VN') : 0} Điểm</p>
                </div>
                <p className="text-gray-900">
                  <span className="font-semibold block text-sm text-gray-500">Tên:</span>
                  <span className="text-lg">{profile.name}</span>
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold block text-sm text-gray-500">Vai trò:</span>
                  <span className={`text-lg font-bold ${profile.role === 'admin' ? 'text-red-600' : 'text-green-600'}`}>{profile.role}</span>
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold block text-sm text-gray-500">Email:</span>
                  <span className="text-lg">{profile.email}</span>
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold block text-sm text-gray-500">Vị trí:</span>
                  <span className="text-lg">{profile.location}</span>
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold block text-sm text-gray-500">Tiểu sử:</span>
                  <span className="text-md italic text-gray-600">{profile.bio}</span>
                </p>

                {/* Các nút Hành động */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-indigo-500 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition duration-150"
                  >
                    <Edit3 className="w-5 h-5 mr-2" /> Chỉnh sửa Hồ sơ (doiTenTaiKhoan)
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg shadow-md hover:bg-yellow-600 transition duration-150"
                  >
                    <Key className="w-5 h-5 mr-2" /> Đổi Mật khẩu (doiMatKhau)
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-150"
                  >
                    <LogOut className="w-5 h-5 mr-2" /> Đăng xuất (dangXuat)
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 'wallet':
        return <WalletTab />;
      case 'history':
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[400px]">
            <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
              <BookOpen className="w-6 h-6 mr-2 text-indigo-500" />
              Lịch sử Đọc/Xem (`lichSuDoc`)
            </h2>
            <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
              {readingHistory.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Chưa có mục nào trong lịch sử.</p>
              ) : (
                readingHistory.map(item => (
                  <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm border-l-4 border-indigo-400">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md mr-3"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/CCCCCC/000000?text=I"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Đọc lần cuối: {item.timestamp}</p>
                      <span className="text-xs text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">{item.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'favorites':
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[400px]">
            <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
              <Heart className="w-6 h-6 mr-2 text-red-500" />
              Danh sách Yêu thích (`danhSachYeuThich`)
            </h2>
            <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
              {favorites.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Chưa có mục nào được yêu thích.</p>
              ) : (
                favorites.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg shadow-sm border-l-4 border-red-400">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md mr-3"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/CCCCCC/000000?text=I"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <span className="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full">{item.type}</span>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(item)}
                      className="text-red-400 hover:text-red-600 transition"
                      title="Xóa khỏi Yêu thích"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'admin':
        return <AdminTab />;
      default:
        return null;
    }
  };


  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading || !isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="ml-4 text-lg text-indigo-600">Đang khởi tạo ứng dụng và xác thực người dùng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-indigo-100">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          Ứng Dụng Người Dùng (Admin & Public Data)
        </h1>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className="text-sm text-gray-600 flex items-center">
            <LogIn className="w-4 h-4 mr-1 text-green-500" />
            UserID: <span className="font-mono text-xs ml-1 bg-gray-200 p-1 rounded break-all">{userId}</span>
            {isAdmin && <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">ADMIN</span>}
          </div>
          {/* Nút Giỏ hàng */}
          <div
            className="relative p-2 bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition duration-150"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="text-indigo-600 w-6 h-6" />
            {totalCartQuantity > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 ring-2 ring-white text-xs text-white flex items-center justify-center font-bold">
                {totalCartQuantity}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cột 1: Chức năng và Chi tiết Tài khoản (Tabs) */}
        <section className="lg:col-span-2">
          <div className="flex border-b border-gray-300 mb-6 overflow-x-auto">
            {[
              { key: 'profile', label: 'Hồ Sơ & QL TK', icon: User },
              { key: 'wallet', label: 'Ví Điểm', icon: DollarSign },
              { key: 'history', label: 'Lịch Sử Đọc', icon: BookOpen },
              { key: 'favorites', label: 'Yêu Thích', icon: Heart },
              ...(isAdmin ? [{ key: 'admin', label: 'Admin Panel', icon: Shield }] : []) // Thêm tab Admin
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center flex-shrink-0 px-4 py-3 text-lg font-medium transition-colors duration-200 ${isActive
                      ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                    } rounded-t-lg`}
                >
                  <Icon className="w-5 h-5 mr-2" /> {tab.label}
                </button>
              );
            })}
          </div>
          {renderTabContent()}
        </section>

        {/* Cột 2: Sản phẩm và Hoạt động (Giữ nguyên) */}
        <section className="lg:col-span-1 space-y-8">
          {/* Danh sách Sản phẩm */}
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
              <List className="w-6 h-6 mr-2 text-indigo-500" />
              Các Mục Nội dung/Sản phẩm
            </h2>

            <div className="space-y-4">
              {MOCK_PRODUCTS.map((product) => {
                const isFavorite = favorites.some(fav => fav.id === product.id);
                return (
                  <div key={product.id} className="flex p-3 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md mr-3"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60x60/CCCCCC/000000?text=P"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-1 truncate">{product.description}</p>
                      <p className="text-sm font-bold text-red-500">{product.price.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="flex flex-col space-y-1 ml-3 items-end">
                      <button
                        onClick={() => handleToggleFavorite(product)}
                        className={`p-1 rounded-full transition ${isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-red-500 hover:bg-gray-300'}`}
                        title={isFavorite ? "Xóa khỏi Yêu thích" : "Thêm vào Yêu thích"}
                      >
                        <Heart className="w-4 h-4" fill={isFavorite ? 'white' : 'none'} />
                      </button>
                      <button
                        onClick={() => {
                          handleAddToCart(product);
                          if (product.type === 'Truyện/Sách') {
                            handleReadItem(product);
                          }
                        }}
                        className="px-2 py-1 text-xs bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition duration-150"
                        title="Thêm vào Giỏ hàng"
                      >
                        <ShoppingCart className="w-3 h-3 inline-block" />
                      </button>
                      {product.type === 'Truyện/Sách' && (
                        <button
                          onClick={() => handleReadItem(product)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-150"
                          title="Đánh dấu đã đọc"
                        >
                          <BookOpen className="w-3 h-3 inline-block" /> Đọc
                        </button>
                      )}
                    </div>
                  </div>
                )
              }
              )}
            </div>
          </div>

          {/* Lịch sử Hoạt động */}
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            <h2 className="flex items-center text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
              <List className="w-6 h-6 mr-2 text-indigo-500" />
              Lịch sử Hoạt động
            </h2>
            <div className="h-64 overflow-y-auto space-y-3 pr-2">
              {activityLog.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Chưa có hoạt động nào được ghi lại.</p>
              ) : (
                activityLog.map((log) => {
                  const isDeposit = log.type === 'deposit';
                  const isWithdraw = log.type === 'withdraw';
                  const isSecurity = log.type === 'security';
                  const isAdminUpdate = log.type && log.type.includes('admin');
                  let borderColor = 'border-indigo-400';
                  let icon = null;
                  let textClass = 'text-gray-800';

                  if (isDeposit) {
                    borderColor = 'border-green-400';
                    icon = <ArrowUpCircle className="w-4 h-4 mr-1 text-green-600" />;
                    textClass = 'text-green-700';
                  } else if (isWithdraw) {
                    borderColor = 'border-red-400';
                    icon = <ArrowDownCircle className="w-4 h-4 mr-1 text-red-600" />;
                    textClass = 'text-red-700';
                  } else if (isSecurity) {
                    borderColor = 'border-yellow-400';
                    icon = <Key className="w-4 h-4 mr-1 text-yellow-600" />;
                  } else if (isAdminUpdate) {
                    borderColor = 'border-teal-400';
                    icon = <Shield className="w-4 h-4 mr-1 text-teal-600" />;
                  }

                  return (
                    <div key={log.id} className={`p-3 bg-gray-100 rounded-lg shadow-sm border-l-4 ${borderColor}`}>
                      <p className="text-xs font-mono text-gray-500 mb-1">{log.timestamp}</p>
                      <p className={`text-sm font-medium flex items-center ${textClass}`}>
                        {icon} {log.action}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Hiển thị Modal Giỏ hàng */}
      {showCart && <CartModal />}

      {/* Hiển thị Modal Đổi Mật khẩu */}
      {showPasswordModal && <PasswordModal />}

      {/* Hiển thị Modal Admin Edit User */}
      {isAdmin && editingUser && <AdminEditUserModal />}
    </div>
  );
};

export default App;