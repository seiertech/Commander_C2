import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  corePlugins: {
    preflight: false, // DO NOT reset existing styles — Tabler pages stay pixel-identical
  },
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#061936', '2': '#071f43' },
        gold: '#ffd21f',
        cream: '#f4f1eb',
        critical: '#d92d20',
        warning: '#e8a317',
        success: '#1a7a3f',
        info: '#2563aa',
        neutral: '#68758b',
      },
      fontFamily: {
        body: ["'Inter'", 'system-ui', 'sans-serif'],
        display: ["'Bebas Neue'", 'Impact', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      fontSize: {
        h1: '24px',
        h2: '20px',
        h3: '16px',
        body: '14px',
        caption: '12px',
        micro: '11px',
        kpi: '24px',
      },
      borderRadius: {
        sm: '0px',
        md: '2px',
        lg: '2px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
      },
    },
  },
  plugins: [],
};

export default config;
