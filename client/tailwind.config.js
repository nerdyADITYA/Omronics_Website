/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F3F9FB',  // Soft Ice / Main Background
          100: '#E4F1F5', // Ice Tint
          200: '#CBE2E8', // Light Aqua Tint
          300: '#87C0CD', // Slate Aqua Accent
          400: '#5296AA', // Medium Ocean Blue
          500: '#226597', // Ocean Steel Blue Primary
          600: '#1A527B', // Dark Steel Blue
          700: '#113F67', // Deep Industrial Navy Header/Text
          800: '#0B2C49', // Dark Navy Shadow
          900: '#061C30', // Deepest Navy
        },
        industrial: {
          50: '#F3F9FB',
          100: '#E4F1F5',
          500: '#226597',
          600: '#1A527B',
          700: '#113F67',
          900: '#061C30',
          950: '#030E1A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
