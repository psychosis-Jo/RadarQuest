import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 夜空基底
        ink: {
          900: '#0F1424',
          800: '#1A2138',
          700: '#2A3149',
          600: '#3A4263'
        },
        // 文字
        bone: {
          50: '#F4E9D8',
          200: '#A8B0C8',
          400: '#6B7390'
        },
        // 点缀
        gold: '#D4A574',
        // 主题色
        celestial: '#5FE0C7',     // AI
        amber: '#E8B86F',         // 一人公司
        mist: '#B8A4D4',          // 自我管理
        // 状态
        flame: '#F4A261',         // streak
        warning: '#C77B7B'        // 负向
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px rgba(212, 165, 116, 0.3)',
        'glow-celestial': '0 0 20px rgba(95, 224, 199, 0.3)'
      },
      borderRadius: {
        // 命名 token —— per DESIGN.md §4 / §15
        button: '8px',
        card:   '8px',
        modal:  '12px'
        // chip / tag / input 仍用默认 4px (rounded)
      },
      fontSize: {
        // type scale —— per DESIGN.md §3
        'display':    ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '500' }],
        'heading-lg': ['40px', { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '500' }],
        'heading':    ['28px', { lineHeight: '1.2',  letterSpacing: '-0.015em', fontWeight: '500' }],
        'heading-sm': ['20px', { lineHeight: '1.3',  letterSpacing: '-0.01em',  fontWeight: '500' }],
        'subheading': ['18px', { lineHeight: '1.4',  letterSpacing: '-0.005em', fontWeight: '500' }],
        'body':       ['15px', { lineHeight: '1.55', letterSpacing: '0',        fontWeight: '400' }],
        'caption':    ['13px', { lineHeight: '1.45', letterSpacing: '0',        fontWeight: '400' }]
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        'xp-rise': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        'xp-rise': 'xp-rise 400ms ease-out'
      }
    }
  },
  plugins: []
};

export default config;
