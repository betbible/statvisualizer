/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        panel: '#1e1e2f',
        border: '#2c2c3a',
        accent: '#8b5cf6',
        highlight: '#7c3aed',
      },
    },
  },
  plugins: [],
}
