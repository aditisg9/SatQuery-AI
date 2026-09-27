/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#F5F3EE",
        sidebar: "#182438",
        "sidebar-ink": "#FFFFFF",
        "sidebar-ink-muted": "#CBD5E1",
        "sidebar-active-bg": "#243451",
        panel: "#FFFFFF",
        "panel-raised": "#F8F6F1",
        "panel-border": "#D9D5CC",
        primary: "#315FA8",
        "primary-hover": "#3F70BC",
        teal: "#4F7F86",
        success: "#5E8C61",
        warning: "#B58B52",
        error: "#B85C5C",
        neutral: "#64748B",
        ink: "#172033",
        "ink-muted": "#59636E",
        "ink-faint": "#7A838C",
        grid: "#D9D5CC",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "ui-sans-serif", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(217, 213, 204, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(217, 213, 204, 0.4) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        scan: "scan 3s linear infinite",
        blink: "blink 1.6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
