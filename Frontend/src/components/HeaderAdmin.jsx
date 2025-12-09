// Trong file src/components/AdminLayout.jsx

// ... (các imports khác)
import HeaderAdmin from './HeaderAdmin';

const AdminLayout = () => {
  // ... (logic kiểm tra token)
  
  if (!isAuthenticated) {
      return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pl-64">
        
        <HeaderAdmin title={currentTitle} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;