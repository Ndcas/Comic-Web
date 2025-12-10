// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình chung cho proxy backend
const BACKEND_TARGET = 'http://localhost:8080';
const proxyConfig = {
    target: BACKEND_TARGET,
    changeOrigin: true,
    secure: false,
};

export default defineConfig({
    plugins: [react()],

    server: {
        // ⚡ QUAN TRỌNG: Fix lỗi 404 khi F5 trang /admin, /admin/dashboard,...
        historyApiFallback: true,

        proxy: {
            // 1. Proxy /api → http://localhost:8080
            '/api': {
                ...proxyConfig,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },

            // 2. Proxy đường dẫn backend cũ
            '/admin': proxyConfig,
            '/truyen': proxyConfig,
            '/nguoiDung': proxyConfig,
            '/baoCao': proxyConfig,
        },
    },

    build: {
        chunkSizeWarningLimit: 1000,
    },
});
