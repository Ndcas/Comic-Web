import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import Home from "./pages/Home";
import StoryDetail from "./pages/StoryDetail";
import ChapterReader from "./pages/ChapterReader";
import HotComics from "./pages/HotComics";
import CategoryComics from "./pages/CategoryComics";
import Categories from "./pages/Categories"; 
import UploadComic from "./pages/UploadComic";

import MainLayout from "./layouts/MainLayout";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Các route nằm trong layout chung */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/home" element={<Home />} />
          <Route path="/truyen/:id" element={<StoryDetail />} />
          <Route path="/truyen/:id/chuong/:cid" element={<ChapterReader />} />
          <Route path="/truyen-hot" element={<HotComics />} />

          {/* ✅ Các route về thể loại */}
          <Route path="/the-loai" element={<Categories />} />
          <Route path="/the-loai/:id" element={<CategoryComics />} />
          <Route path="/upload" element={<UploadComic />} />
        </Route>

        {/* Các trang độc lập (không dùng layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
