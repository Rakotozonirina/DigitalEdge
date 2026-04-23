/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury dark mode with gold/neon accent
        dark: {
          900: '#0f1115', // Main bg
          800: '#1a1d24', // Card bg
          700: '#2b2f3a', // Border / Hover
        },
        accent: {
          DEFAULT: '#9d7cfa', // Neon Purple / Cyan-ish
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
