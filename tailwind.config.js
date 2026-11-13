/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        tavera: {
          green: {
            DEFAULT: '#166534',
            light: '#22c55e',
            dark: '#14532d',
          },
          graphite: {
            DEFAULT: '#27272A',
            dark: '#18181B',
            light: '#3F3F46',
          },
          orange: {
            DEFAULT: '#EA580C',
            light: '#F97316',
            dark: '#C2410C',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
