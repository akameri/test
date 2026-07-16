import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Zurückhaltende Enterprise-Palette – Vertrauen & Seriosität
        brand: {
          50: '#eef4ff',
          100: '#dce7fd',
          500: '#3b5bdb',
          600: '#2f4ac2',
          700: '#273da0',
          900: '#1b2a6b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
