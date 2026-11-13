/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        foreground: 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        brand: {
          DEFAULT: 'var(--brand)',
          solid: 'var(--brand-solid)',
          fg: 'var(--brand-fg)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          fg: 'var(--accent-fg)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          fg: 'var(--sidebar-fg)',
          muted: 'var(--sidebar-muted)',
          active: 'var(--sidebar-active)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          bg: 'var(--danger-bg)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg: 'var(--success-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg: 'var(--warning-bg)',
        },
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
      borderRadius: {
        control: '8px',
        card: '12px',
        dialog: '16px',
      },
    },
  },
  plugins: [],
};
