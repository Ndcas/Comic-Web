import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = 'http://localhost:8080';
const proxyConfig = {
    target: BACKEND_TARGET,
    changeOrigin: true,
    secure: false,
};

export default defineConfig({
    plugins: [react()],

    server: {
        historyApiFallback: true, 
        proxy: {
            '/api': {
                ...proxyConfig,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/nguoiDung': proxyConfig,
            '/baoCao': proxyConfig,
        },
    },

    build: {
        chunkSizeWarningLimit: 1000,
    },
});