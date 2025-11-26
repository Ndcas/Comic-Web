import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// Components/Layout
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import App from './App';

// Page components
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

// ⭐ Thêm giao diện UserFeatures
import UserFeatures from './pages/UserFeatures';

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
            { path: '/search/:keyword?', element: <StoryList /> },

            { path: '/category/:TLID', element: <CategoryComics /> },
            { path: '/story/:TID', element: <StoryDetail /> },

            { path: '/change-password', element: <ChangePassword /> },
            { path: '/forgot-password', element: <ForgotPassword /> },
            { path: '/upload', element: <UploadComic /> },

            // ⭐⭐ Route giao diện người dùng đọc truyện (UserFeatures)
            { path: '/user', element: <UserFeatures /> },

            // 404 trong Layout
            { path: '*', element: <NotFound /> },
        ]
    },

    // Không Layout
    { path: '/login', element: <Login />, errorElement: <NotFound /> },
    { path: '/register', element: <Register />, errorElement: <NotFound /> },

    { path: '/read/:TID/:CTID', element: <ChapterReader />, errorElement: <NotFound /> },

    // 404 tổng
    { path: '*', element: <NotFound /> }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
