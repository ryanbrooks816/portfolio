module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx}", "./components/**/*.{astro,js,ts}"],
  theme: {
    extend: {
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
