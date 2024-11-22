import type { Config } from "tailwindcss";
import bootstrapIconsPlugin from "./src/tailwindPlugins/bootstrapIconPlugin";
import { highlight } from "prismjs";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        custom: ["'7segment'", "'sans-serif'"],
      },
      letterSpacing: {
        "extra-wide": "0.2em", // Extra wide custom spacing
      },
      colors: {
        background: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          highlight: "var(--color-bg-highlight)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        boxShadow: {
          sm: "var(--shadow-sm)",
          md: "var(--shadow-md)",
          lg: "var(--shadow-lg)",
          xl: "var(--shadow-xl)",
          inner: "var(--shadow-inner)",
          glow: "var(--shadow-glow)",
        },
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        disabled: "var(--color-disabled)",
        active: "var(--color-active)",

        success: "var(--color-success)",
        error: "var(--color-error)",
        warning: "var(--color-warning)",
        info: "var(--color-accent)", // Reuse accent color for info
      },
      boxShadow: {
        dropdown: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
      },
    },
  },
  darkMode: "class",
  plugins: [bootstrapIconsPlugin]
} satisfies Config;
