/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B1220",
        panel: "#101A2B",
        "panel-raised": "#16243A",
        "panel-border": "#223148",
        signal: "#4FD1C5",
        "signal-dim": "#2E7D75",
        change: "#F2A65A",
        alert: "#F2555A",
        ink: "#E8EDF4",
        "ink-muted": "#7C8BA3",
        grid: "#1A2942",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(79, 209, 197, 0.35)",
        "glow-change": "0 0 24px -6px rgba(242, 166, 90, 0.35)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, #1A2942 1px, transparent 1px), linear-gradient(to bottom, #1A2942 1px, transparent 1px)",
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
      },
      animation: {
        scan: "scan 3s linear infinite",
        blink: "blink 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
