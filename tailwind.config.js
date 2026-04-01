/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#121212',
          card: '#1a1a1a',
          elevated: '#222',
        },
        accent: {
          yellow: '#f5c518',
          blue: '#3498db',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(52, 152, 219, 0.15)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
