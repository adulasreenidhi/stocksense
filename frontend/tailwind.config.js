/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base canvas & Discord dark obsidian surfaces
        canvas: {
          DEFAULT: '#0A0A0B',
          subtle: '#111113',
        },
        // Elevated surfaces: 1 step up for cards, 2 steps for popovers
        surface: {
          DEFAULT: '#141519',
          subtle: '#181A1F',
          elevated: '#1D1F26',
          hover: '#242731',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.18)',
        },
        // Premium deliberate accent: Signal Orange (Nike-inspired high contrast & industrial precision)
        accent: {
          DEFAULT: '#FF5500',
          hover: '#FF6B1A',
          active: '#E04B00',
          muted: '#8A3205',
          subtle: 'rgba(255, 85, 0, 0.12)',
          border: 'rgba(255, 85, 0, 0.28)',
          glow: 'rgba(255, 85, 0, 0.45)',
        },
        // Status colors
        status: {
          success: {
            DEFAULT: '#10B981', // Done / Stock-in
            subtle: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.28)',
          },
          warning: {
            DEFAULT: '#F59E0B', // Waiting / In-transit
            subtle: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.28)',
          },
          danger: {
            DEFAULT: '#EF4444', // Late / Stock-out / Error
            subtle: 'rgba(239, 68, 68, 0.12)',
            border: 'rgba(239, 68, 68, 0.28)',
          },
          info: {
            DEFAULT: '#38BDF8',
            subtle: 'rgba(56, 189, 248, 0.12)',
            border: 'rgba(56, 189, 248, 0.28)',
          },
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
        'stat-xl': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'stat-lg': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        'stat-md': ['2.125rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        'glass-nav': '0 12px 40px -8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 24px 0 rgba(255, 255, 255, 0.02)',
        'card-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 28px -4px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.16)',
        'accent-glow': '0 0 24px -2px rgba(255, 85, 0, 0.45)',
        'accent-glow-sm': '0 0 14px -2px rgba(255, 85, 0, 0.35)',
        'danger-glow': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'success-glow': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'inner-soft': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
