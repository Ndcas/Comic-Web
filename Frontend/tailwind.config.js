// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Rất quan trọng: Phải bao gồm các file chứa code React/JSX/TSX của bạn
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}