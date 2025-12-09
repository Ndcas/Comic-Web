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


            { path: '*', element: <NotFound /> },
        ]
    },


    { path: '/login', element: <Login />, errorElement: <NotFound /> },
    { path: '/register', element: <Register />, errorElement: <NotFound /> },

    { path: '/read/:TID/:CTID', element: <ChapterReader />, errorElement: <NotFound /> },

    // 🌟 THÊM ROUTE KẾT QUẢ THANH TOÁN (Không Layout)
    // Route này phải khớp với đường dẫn trả về (returnPath) trong backend
    { path: '/xuLyKetQuaNapDiem/:NDID', element: <PaymentResultPage />, errorElement: <NotFound /> },

    // 404 tổng
    { path: '*', element: <NotFound /> }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Bổ sung AuthProvider để sử dụng token */}
        <AuthProvider> 
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>,
);