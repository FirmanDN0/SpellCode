import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spell: {
          purple: {
            50: "#FAF5FF",
            100: "#F3E8FF",
            200: "#E9D5FF",
            300: "#D8B4FE",
            400: "#A855F7",
            500: "#8B5CF6",
            600: "#7C3AED",
            700: "#5B21B6",
            800: "#2E165B",
            900: "#1A0B36",
            950: "#0F0622",
          },
          teal: {
            50: "#F0FDFA",
            100: "#CCFBF1",
            200: "#99F6E4",
            300: "#5EEAD4",
            400: "#2DD4BF",
            500: "#14B8A6",
            600: "#0D9488",
            700: "#0F766E",
            800: "#115E59",
            900: "#042F2E",
          },
          gold: {
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
          coral: {
            400: "#FB7185",
            500: "#F43F5E",
            600: "#E11D48",
          },
          emerald: {
            400: "#34D399",
            500: "#10B981",
            600: "#059669",
          },
        },
      },
      borderRadius: {
        rune: "16px",
        card: "22px",
        dialog: "28px",
      },
      boxShadow: {
        "rune-purple": "0 4px 0 #452482, 0 8px 16px rgba(124, 58, 237, 0.25)",
        "rune-teal": "0 4px 0 #0F766E, 0 8px 16px rgba(20, 184, 166, 0.25)",
        "rune-gold": "0 4px 0 #B45309, 0 8px 16px rgba(245, 158, 11, 0.25)",
        "rune-coral": "0 4px 0 #9F1239, 0 8px 16px rgba(244, 63, 94, 0.25)",
        "card-fantasy": "0 10px 30px -5px rgba(10, 4, 26, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        "glow-gold": "0 0 25px rgba(245, 158, 11, 0.45)",
        "glow-teal": "0 0 25px rgba(45, 212, 191, 0.45)",
      },
      animation: {
        "float-gentle": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
