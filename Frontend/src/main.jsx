import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';


import { AuthProvider } from './utils/AuthContext'; 
import Profile from './pages/Profile'; 
import FavoriteList from './pages/FavoriteList';
import HistoryList from './pages/HistoryList';


import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import App from './App';


import Home from './pages/Home';
import StoryDetail from './pages/StoryDetail';
import ChapterReader from './pages/ChapterReader';
import CategoryComics from './pages/CategoryComics';
import Categories from './pages/Categories';
import StoryList from './pages/StoryList';
import UploadComic from './pages/UploadComic';
 
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import PaymentResultPage from './pages/PaymentResultPage'; 


import AdminLayout from './components/AdminLayout'; 
import AdminProtectedRoute from './components/AdminProtectedRoute'; 
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import ComicManagementPage from './pages/ComicManagementPage'; 
import UserManagementPage from './pages/UserManagementPage';  
import ReportManagementPage from './pages/ReportManagementPage'; 


const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <NotFound />,
        children: [
            { index: true, element: <Home /> },
            { path: '/dev-menu', element: <App /> },
            { path: '/categories', element: <Categories /> },
            { path: '/new', element: <StoryList /> },
            { path: '/hot', element: <StoryList /> },
            { path: '/genre/:TLID', element: <StoryList /> },
            { path: '/search/:keyword?', element: <StoryList /> },
            { path: '/category/:TLID', element: <CategoryComics /> },
            { path: '/story/:TID', element: <StoryDetail /> },
            
            { path: '/change-password', element: <ChangePassword /> },
            { path: '/forgot-password', element: <ForgotPassword /> },
            { path: '/upload', element: <UploadComic /> },
            { path: '/profile', element: <Profile /> },
            { path: '/favorites', element: <FavoriteList /> },
            { path: '/history', element: <HistoryList /> },
        ]
    },

    { path: '/login', element: <Login />, errorElement: <NotFound /> },
    { path: '/register', element: <Register />, errorElement: <NotFound /> },
    { path: '/read/:TID/:CTID', element: <ChapterReader />, errorElement: <NotFound /> },
    { path: '/xuLyKetQuaNapDiem/:NDID', element: <PaymentResultPage />, errorElement: <NotFound /> },

    
    { 
        path: '/admin/login', 
        element: <AdminLoginPage />, 
        errorElement: <NotFound /> 
    },

    {
        path: '/admin', 
        errorElement: <NotFound />,
        element: <AdminProtectedRoute element={<AdminLayout />} />, 
        children: [
            { index: true, element: <DashboardPage /> },             
            { path: 'comics', element: <ComicManagementPage /> },      
            { path: 'users', element: <UserManagementPage /> },        
            { path: 'reports', element: <ReportManagementPage /> },    
        ],
    },

    { path: '*', element: <NotFound /> }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider> 
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>,
);