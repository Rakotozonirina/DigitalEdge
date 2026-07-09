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
        // Luxury dark mode
        dark: {
          900: '#0f1115', // Main bg
          800: '#1a1d24', // Card bg
          700: '#2b2f3a', // Border / Hover
        },
        // Light mode colors
        light: {
          900: '#f8fafc', // Main bg
          800: '#ffffff', // Card bg
          700: '#e2e8f0', // Border / Hover
        },
        accent: {
          DEFAULT: '#9d7cfa',
          hover: '#8a65f0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
