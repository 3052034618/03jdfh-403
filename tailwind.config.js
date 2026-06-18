/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        horror: {
          bg: '#0a0a0f',
          panel: '#14141f',
          border: '#2a2a3a',
          text: '#b8b8c8',
          heading: '#e8e8f0',
          accent: '#dc2626',
          accent2: '#7c3aed',
          warning: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}

