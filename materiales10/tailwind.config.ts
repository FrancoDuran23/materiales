import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oscura con acentos amarillos
        brand: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        dark: {
          50: "#374151",
          100: "#1F2937",
          200: "#111827",
          300: "#0D1117",
          400: "#0A0E14",
          500: "#050709",
          600: "#030405",
          700: "#020303",
          800: "#010202",
          900: "#000000",
        },
        surface: "#0D1117",
        background: "#000000",
        border: "#1F2937",
        text: {
          primary: "#FFFFFF",
          secondary: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(0, 0, 0, 0.3)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
        "elevated": "0 4px 12px rgba(0, 0, 0, 0.5)",
        "glow": "0 0 20px rgba(251, 191, 36, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
