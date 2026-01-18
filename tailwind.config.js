/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,svelte}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Paleta Azul
          blue: {
            light: '#8ED5F9',
            DEFAULT: '#5EC2F6',
            dark: '#0C4A6E',
            muted: '#3B82F6',
          },
          // Paleta Verde Principal
          green: {
            light: '#8FDE3F',
            DEFAULT: '#6FC30A',
            dark: '#365E05',
          },
          // Paleta Verde Secundario (Pistacho)
          pistachio: {
            DEFAULT: '#96CE4D',
            dark: '#4D7818',
          },
          // Fondos
          surface: {
            light: '#FDFDFD',
            dark: '#0F172A', // Slate 900
          }
        }
      }
    },
  },
  plugins: [],
};
