/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#05060a',
          900: '#0a0b10',
          800: '#0d0f16',
          700: '#12141d',
          600: '#181b26',
          500: '#232634',
        },
        accent: {
          violet: '#8b5cf6',
          indigo: '#6366f1',
          cyan: '#22d3ee',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'aurora-gradient':
          'radial-gradient(60% 60% at 20% 20%, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0) 60%), radial-gradient(50% 50% at 80% 30%, rgba(34,211,238,0.30) 0%, rgba(34,211,238,0) 60%), radial-gradient(60% 60% at 50% 90%, rgba(236,72,153,0.20) 0%, rgba(236,72,153,0) 60%)',
        'accent-line': 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #22d3ee 100%)',
      },
      boxShadow: {
        glow: '0 0 50px -12px rgba(139, 92, 246, 0.55)',
        'glow-cyan': '0 0 50px -12px rgba(34, 211, 238, 0.45)',
        'glow-sm': '0 0 20px -6px rgba(139, 92, 246, 0.5)',
        card: '0 8px 30px -12px rgba(0,0,0,0.45)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        blob: 'blob 14s infinite ease-in-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'spin-slow': 'spin-slow 6s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
