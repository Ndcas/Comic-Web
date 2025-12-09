// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false, 
      },
      '/truyen': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false, 
      },
      '/nguoiDung': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false, 
      },
      '/baoCao': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false, 
      },
    },
  },
})