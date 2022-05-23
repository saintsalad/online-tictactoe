module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.50)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'heartbeating': 'heartbeat 1s ease infinite'
      }
    },
  },
  plugins: [],
}