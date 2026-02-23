/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#e8f5ee',
          100: '#c6e8d3',
          200: '#9cd4b5',
          300: '#6bbc93',
          400: '#3da473',
          500: '#2d8a5e',
          600: '#2d6a4f',
          700: '#245a41',
          800: '#1a4231',
          900: '#112c21',
        },
      },
    },
  },
  plugins: [],
}
