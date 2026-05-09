/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef3f0',
          100: '#fde8e1',
          200: '#fbc5b3',
          300: '#f89576',
          400: '#f46239',
          500: '#e8420f',
          600: '#c4340b',
          700: '#9c290a',
          800: '#7a2009',
          900: '#5c1807',
        },
        accent: {
          DEFAULT: '#ff6b35',
          light: '#ff8f65',
          dark: '#e04e1a',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8f7f4',
          tertiary: '#f0ede8',
        },
        dark: {
          DEFAULT: '#0f0e0d',
          secondary: '#1a1917',
          tertiary: '#242220',
          card: '#1e1c1a',
        },
        text: {
          primary: '#0f0e0d',
          secondary: '#5c5652',
          muted: '#a09b96',
          inverse: '#ffffff',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.14)',
        glow: '0 0 32px rgba(232,66,15,0.25)',
        glass: '0 8px 32px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};