/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heart: {
          pink: '#FF69B4',
          'soft-pink': '#FFB6C1',
          purple: '#9370DB',
          violet: '#8A2BE2',
          'deep-violet': '#4B0082',
          neon: '#00FFFF',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px #00FFFF' },
          '50%': { opacity: .7, boxShadow: '0 0 5px #00FFFF' },
        }
      }
    },
  },
  plugins: [],
}
