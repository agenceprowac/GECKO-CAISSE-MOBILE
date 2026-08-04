/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
        },
        primary: '#3B82F6',
        accent: {
          beer: '#F59E0B',
          cocktail: '#8B5CF6',
          soft: '#10B981',
          snack: '#EF4444',
          wine: '#EC4899'
        }
      }
    },
  },
  plugins: [],
}
