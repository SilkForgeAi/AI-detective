/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        detective: {
          dark: '#1a1a2e',
          darker: '#0f0f1e',
          accent: '#e94560',
          secondary: '#16213e',
          light: '#0f3460',
        },
      },
    },
  },
  plugins: [],
}
