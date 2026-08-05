/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        industrial: {
          50: '#f0f6ff',
          100: '#e0edff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          900: '#0b1329',
          950: '#050a17',
        },
        slate: {
          850: '#111927',
          900: '#0d131f',
        },
        amber: {
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
