/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,svelte}",
    "./index.html"
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        md: '12px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
