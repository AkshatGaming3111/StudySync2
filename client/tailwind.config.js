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
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e'
        },
        dark: {
          base: '#0B0F17',
          surface: '#111827',
          card: '#1A2234',
          border: '#243048',
          hover: '#1F2B42'
        }
      },
      boxShadow: {
        'specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'specular-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 16px 36px -10px rgba(0, 0, 0, 0.65), 0 0 24px -6px rgba(20, 184, 166, 0.18)',
        'specular-lg': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 40px -12px rgba(0, 0, 0, 0.7)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'aurora': 'aurora 10s ease-in-out infinite alternate',
        'spin-slow': 'spin 40s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(20, 184, 166, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(20, 184, 166, 0.6)' },
        },
        aurora: {
          '0%': { transform: 'translate(0px, 0px) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translate(25px, -20px) scale(1.08)', opacity: '0.9' },
          '100%': { transform: 'translate(-20px, 15px) scale(0.95)', opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
