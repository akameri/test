import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Österreich-Palette: Rot-Weiß-Rot (Austria-Rot #C8102E)
        brand: {
          50: '#fdf2f3',
          100: '#fbe0e3',
          500: '#e01e37',
          600: '#c8102e',
          700: '#a30d26',
          900: '#6e0a1c',
        },
      },
    },
  },
  plugins: [],
};

export default config;
