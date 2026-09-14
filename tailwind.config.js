/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A2D87",
          50: "#EEF1FA",
          100: "#DCE2F5",
          200: "#B4C0E7",
          300: "#8C9ED9",
          400: "#5670C0",
          500: "#0A2D87",
          600: "#092774",
          700: "#071F5E",
          800: "#051649",
          900: "#030D33",
        },
        gold: {
          DEFAULT: "#C88A2E",
          light: "#F4C978",
        },
        bg: "#F4F6FB",
        panel: "#FFFFFF",
        line: "#E6E9F2",
        ink: "#1B2340",
        muted: "#6B7794",
        good: "#2E9E5B",
        warn: "#D9A017",
        bad: "#D9483A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 45, 135, 0.04), 0 6px 20px rgba(10, 45, 135, 0.06)",
      },
    },
  },
  plugins: [],
};
