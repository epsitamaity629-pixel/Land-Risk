/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#020617",
      },
      boxShadow: {
        glow: "0 0 40px rgba(16,185,129,0.12)",
      },
    },
  },
  plugins: [],
};
