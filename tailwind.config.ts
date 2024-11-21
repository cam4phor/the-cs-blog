import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        custom: ["'7segment'", "'sans-serif'"],
      },
      letterSpacing: {
        'extra-wide': '0.2em', // Extra wide custom spacing
      },
      colors: {
        background: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        boxShadow: {
          'sm': 'var(--shadow-sm)',
          'md': 'var(--shadow-md)',
          'lg': 'var(--shadow-lg)',
          'xl': 'var(--shadow-xl)',
          'inner': 'var(--shadow-inner)',
          'glow': 'var(--shadow-glow)',
        },
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        disabled: "var(--color-disabled)",

        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-accent)', // Reuse accent color for info
      },
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
