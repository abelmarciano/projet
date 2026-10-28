import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        brand: {
          50: "#eef4ff", 100: "#dbe6fe", 200: "#bfd3fe", 300: "#93b4fd", 400: "#6090fa",
          500: "#3b6ef6", 600: "#2554eb", 700: "#1d41d8", 800: "#1e36af", 900: "#1e338a",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
        float: "0 12px 32px -8px rgba(16,24,40,.18), 0 4px 8px -4px rgba(16,24,40,.08)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } },
        "slide-in": { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
      },
      animation: { "fade-in": "fade-in .18s ease-out", "slide-in": "slide-in .25s cubic-bezier(.2,.8,.2,1)" },
    },
  },
  plugins: [],
} satisfies Config;
