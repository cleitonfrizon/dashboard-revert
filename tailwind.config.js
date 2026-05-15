/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#0F1116',
        surface: {
          DEFAULT: '#0F1116',
          1: '#15171D',
          2: '#1B1E26',
          3: '#222530'
        },
        navy: { DEFAULT: '#0D1B2A', light: '#1C2636' },
        gold: { DEFAULT: '#C8A84E', light: '#D4B96A', dark: '#A8883A', soft: '#E8D592' },
        bgCard: '#15171D',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif']
      },
      boxShadow: {
        gold: '0 0 40px rgba(200,168,78,0.2), 0 4px 20px rgba(0,0,0,0.5)',
        goldSm: '0 0 20px rgba(200,168,78,0.2)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
