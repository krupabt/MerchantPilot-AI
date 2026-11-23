/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Required Palette
        surface: {
          primary: '#0B0F14',    // Primary background
          secondary: '#151A21',  // Secondary background
          card: '#1C222B',       // Card background
          border: '#2A3441',     // Clean subtle border
          hover: '#242D38',      // Interactive hover
        },
        accent: {
          amber: '#F5A524',      // Primary warm amber
          copper: '#D97706',     // Secondary copper
          amberLight: '#FDE68A',
          amberDark: '#B45309',
        },
        content: {
          primary: '#F8FAFC',    // Main text
          secondary: '#94A3B8',  // Secondary text
          muted: '#64748B',      // Muted text
        },
        status: {
          success: '#10B981',    // Emerald success
          error: '#EF4444',      // Red error
          warning: '#F59E0B',    // Amber warning
          info: '#38BDF8',       // Sky info
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        'amber-glow': '0 0 20px -3px rgba(245, 165, 36, 0.25)',
      }
    },
  },
  plugins: [],
}
