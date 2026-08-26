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
        slateBase: '#0b0f19',
        slatePanel: '#111827',
        slateBorder: '#1f2937',
        accentCyan: '#06b6d4',
        accentRed: '#ef4444',
        accentAmber: '#f59e0b',
        accentGreen: '#10b981'
      }
    }
  },
  plugins: [],
}
