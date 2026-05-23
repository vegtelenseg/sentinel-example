/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          alt: "var(--bg-alt)",
          soft: "var(--bg-soft)",
          elv: "var(--bg-elv)",
        },
        ink: {
          DEFAULT: "var(--text-1)",
          secondary: "var(--text-2)",
          muted: "var(--text-3)",
        },
        divider: "var(--divider)",
        border: "var(--border)",
        accent: {
          cyan: "var(--accent)",
          "cyan-bright": "var(--accent-light)",
        },
        "accent-emerald": "var(--allow)",
        "accent-rose": "var(--deny)",
        "accent-amber": "var(--warning)",
        navy: {
          950: "var(--bg)",
          900: "var(--bg)",
          800: "var(--bg-alt)",
          700: "var(--bg-soft)",
          600: "var(--bg-soft)",
          500: "var(--border)",
        },
        steel: {
          700: "var(--border)",
          600: "var(--text-3)",
          500: "var(--text-3)",
          400: "var(--text-2)",
          300: "var(--text-2)",
          200: "var(--text-1)",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        sentinel: "var(--radius)",
        "sentinel-sm": "var(--radius-sm)",
      },
    },
  },
  plugins: [],
};
