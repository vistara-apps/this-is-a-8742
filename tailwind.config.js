/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 99%, 35%)',
        accent: 'hsl(48, 99%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        bg: 'hsl(210, 36%, 96%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0,0%,0%,0.08)',
      }
    },
  },
  plugins: [],
}