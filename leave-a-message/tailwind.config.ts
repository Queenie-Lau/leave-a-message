/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // This covers the src folder if you have one
  ],
  theme: {
    extend: {
      colors: {
        neon: "#dfff00",
        dark: "#0a0a0a",
      },
    },
  },
  plugins: [],
}