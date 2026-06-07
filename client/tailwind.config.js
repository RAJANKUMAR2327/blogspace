/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        dark: {
          50:  '#f8f8ff',
          100: '#e8e8f0',
          200: '#c8c8d8',
          300: '#a8a8c0',
          400: '#7878a0',
          500: '#484870',
          600: '#282850',
          700: '#181830',
          800: '#0d0d1a',
          900: '#080810',
          950: '#04040c',
        },
        purple: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          teal: '#34d399',
        }
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #7c3aed, #2563eb)',
        'grad-text': 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%)',
        'grad-hero': 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 60%)',
        'grid-dots': 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-sm': '0 0 16px rgba(124,58,237,0.3)',
        'glow': '0 0 24px rgba(124,58,237,0.4)',
        'glow-lg': '0 0 40px rgba(124,58,237,0.5)',
        'card': '0 16px 40px rgba(124,58,237,0.15)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'blink': 'blink 2s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
        'fade-up': 'fadeUp 0.6s ease both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}