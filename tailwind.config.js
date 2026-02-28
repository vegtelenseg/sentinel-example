/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060a14',
          900: '#0a0f1e',
          800: '#111827',
          700: '#1a2236',
          600: '#243049',
          500: '#2a3a5c',
        },
        steel: {
          700: '#2a3a5c',
          600: '#3b4f73',
          500: '#4e6389',
          400: '#6b82a6',
          300: '#8fa3c0',
          200: '#b3c2d6',
        },
        accent: {
          cyan: '#06b6d4',
          'cyan-bright': '#22d3ee',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
