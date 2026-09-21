import type { Config } from "tailwindcss";

// Design tokens matched to the provided ExecFlow AI mockups: black/white/
// gray UI, bold sans-serif headings, black primary buttons, and colored
// pill badges reserved for status/priority (the one place color carries
// real meaning - not decoration).
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14151A",        // primary text / headings
        canvas: "#F6F7F9",     // app background
        surface: "#FFFFFF",    // cards / panels
        border: "#E5E7EB",
        muted: "#6B7280",
        accent: {
          DEFAULT: "#14151A",  // black - primary buttons/links, per mockups
          hover: "#000000",
        },
        danger: "#DC2626",
        priority: {
          low: "#6B7280",
          medium: "#14151A",
          high: "#DC2626",
          urgent: "#DC2626",
        },
        status: {
          pending: "#6B7280",
          "pending-bg": "#F3F4F6",
          progress: "#B45309",
          "progress-bg": "#FEF3C7",
          completed: "#15803D",
          "completed-bg": "#DCFCE7",
          overdue: "#B91C1C",
          "overdue-bg": "#FEE2E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
