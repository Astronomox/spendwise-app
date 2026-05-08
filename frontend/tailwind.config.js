/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Forge dark base ─────────────────────────
        forge: {
          bg:       '#0A0908',
          surface:  '#161210',
          elevated: '#211A14',
          muted:    '#2E221A',
          card:     '#1A130E',
        },
        // ── Rust accent ──────────────────────────────
        rust: {
          DEFAULT: '#B7410E',
          light:   '#D4541A',
          dim:     '#8B3A1D',
          faint:   '#2A1208',
          copper:  '#B87333',
        },
        // ── Text ─────────────────────────────────────
        cream: '#F5F1EB',
        // ── Semantic ─────────────────────────────────
        success: '#2DB37A',
        danger:  '#F43F5E',
        warning: '#FBBF24',
        // ── Category colors ──────────────────────────
        cat: {
          food:          '#F59E0B',
          transport:     '#3B82F6',
          airtime:       '#8B5CF6',
          shopping:      '#EC4899',
          utilities:     '#06B6D4',
          health:        '#10B981',
          entertainment: '#F43F5E',
          savings:       '#00E5A0',
          other:         '#94A3B8',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rust-gradient':  'linear-gradient(135deg, #D4541A, #8B3A1D)',
        'hero-mesh':      'linear-gradient(135deg, #2A1208 0%, #1C0D06 55%, #0A0908 100%)',
        'card-accent':    'linear-gradient(135deg, rgba(183,65,14,0.1), rgba(184,115,51,0.04))',
        'progress-rust':  'linear-gradient(90deg, #D4541A, #B87333)',
      },
      boxShadow: {
        'rust':    '0 4px 20px rgba(183,65,14,0.35)',
        'rust-lg': '0 8px 40px rgba(183,65,14,0.45)',
        'rust-sm': '0 2px 10px rgba(183,65,14,0.22)',
        'card':    '0 2px 8px rgba(0,0,0,0.25)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        '4xl': '28px',
        '5xl': '36px',
      },
      spacing: {
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      animation: {
        'shimmer': 'shimmer 1.8s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition:  '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
