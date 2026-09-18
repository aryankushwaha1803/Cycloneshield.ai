/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        disaster: {
          bg: '#0a0f1d',
          surface: '#111827',
          card: '#1a2236',
          border: '#2a364f',
          accent: '#00f0ff',
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#22c55e'
        }
      }
    },
  },
  plugins: [],
}
