import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04080F',
          900: '#07101E',
          800: '#0D1B2E',
          700: '#102236',
          600: '#1A3350',
        },
        teal: {
          900: '#002E27',
          700: '#004D40',
          500: '#00C9A7',
          400: '#00E4BF',
          300: '#6EFCE8',
        },
        signal: {
          green: '#34D399',
          amber: '#FBBF24',
          red: '#F87171',
          blue: '#60A5FA',
        },
        slate: {
          100: '#F0F4F8',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', '"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"DM Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      width: {
        sidebar: '240px',
      },
      maxWidth: {
        content: '1400px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        'teal-sm': '0 0 12px rgba(0, 201, 167, 0.15)',
        'teal-md': '0 0 24px rgba(0, 201, 167, 0.25)',
        'teal-lg': '0 0 48px rgba(0, 201, 167, 0.35)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(16, 34, 54, 0.8)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(0, 201, 167, 0.2)',
        elevated: '0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-teal': 'pulseTeal 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        counter: 'counter 1.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseTeal: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0, 201, 167, 0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 201, 167, 0.35)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        shimmer: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.04) 50%, transparent 75%)',
        'glow-teal': 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,201,167,0.12) 0%, transparent 70%)',
        'glow-subtle': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,201,167,0.06) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
