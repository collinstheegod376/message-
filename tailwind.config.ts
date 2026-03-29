import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd2ff',
          300: '#8fb5ff',
          400: '#5c8fff',
          500: '#3b6ef6',
          600: '#2550eb',
          700: '#1c3fd8',
          800: '#1d34ae',
          900: '#1d3189',
          950: '#161e55',
        },
        surface: {
          DEFAULT: '#0d0f1a',
          50:  '#f7f8ff',
          100: '#eef0ff',
          200: '#dde2ff',
          700: '#1e2235',
          800: '#161826',
          900: '#0d0f1a',
          950: '#070810',
        },
        accent: '#a855f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark': `
          radial-gradient(at 0% 0%, rgba(59,110,246,0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(168,85,247,0.10) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(59,110,246,0.08) 0px, transparent 50%)
        `,
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounce 1.2s infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(59,110,246,0.35)',
        'glow-sm': '0 0 10px rgba(59,110,246,0.20)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4)',
        'message': '0 2px 8px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
