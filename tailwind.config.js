/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        voltz: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#1f5bd8',
          700: '#0A2D87',
          900: '#061d59',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
