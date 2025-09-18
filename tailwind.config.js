/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'archive-teal': '#008080',
        'archive-teal-dark': '#006666',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['EB Garamond', 'serif'],
        garamond: ['EB Garamond', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}