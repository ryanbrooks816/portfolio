module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx}", "./components/**/*.{astro,js,ts}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50: "#f5f3ff",
          500: "#7c3aed",
        },
      },
    },
  },
  plugins: [],
};
