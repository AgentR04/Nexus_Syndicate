/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#0a0a1b',
        'dark-gray': '#1a1a2e',
        'medium-gray': '#2a2a3c',
        'light-gray': '#c5c5c7',
        'neon-blue': '#00ffff',
        'neon-purple': '#bf00ff',
        'neon-pink': '#ff00ff',
        'neon-green': '#00ff41',
        'neon-yellow': '#ffff00',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00ffff, 0 0 10px #00ffff',
        'neon-purple': '0 0 5px #bf00ff, 0 0 10px #bf00ff',
        'neon-pink': '0 0 5px #ff00ff, 0 0 10px #ff00ff',
      },
      backgroundImage: {
        'hex-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%231a1a2e' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'border-flow': 'border-flow 3s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { textShadow: '0.05em 0 0 #ff00ff, -0.05em -0.025em 0 #00ffff' },
          '25%': { textShadow: '-0.05em -0.025em 0 #ff00ff, 0.025em 0.025em 0 #00ffff' },
          '50%': { textShadow: '0.025em 0.05em 0 #ff00ff, 0.05em 0 0 #00ffff' },
          '75%': { textShadow: '-0.025em 0 0 #ff00ff, -0.025em -0.025em 0 #00ffff' },
        },
        'border-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
