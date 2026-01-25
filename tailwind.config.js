/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,svelte}",
    "./index.html"
  ],
  darkMode: 'selector',
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
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.4)',
          dark: 'rgba(15, 23, 42, 0.6)',
          border: 'rgba(255, 255, 255, 0.2)',
          'border-dark': 'rgba(255, 255, 255, 0.1)',
        }
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        xl: '24px',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass-lg': '20px 20px 40px -10px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
};
