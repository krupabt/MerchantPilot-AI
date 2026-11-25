/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MerchantPilot Editorial Retail Palette
        mainBg: '#F5F1EB',
        customerBg: '#F5F1EB',
        merchantBg: '#F6F5F3',
        merchantPanel: '#292628',
        card: '#FFFFFF',
        textPrimary: '#242424',
        textSecondary: '#6B6560',
        brand: {
          primary: '#783F45',   // Deep plum / wine
          hover: '#603137',     // Darker plum
          accent: '#D8C3A5',    // Soft beige/wheat accent
          soft: '#F8F4EE',      // Pale brand surface
          border: '#E8E2DA',
        },
        borderBase: '#E8E2DA',
        status: {
          success: '#32734D',
          warning: '#B77932',
          error: '#B84040',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(36, 36, 36, 0.04)',
        'card': '0 2px 6px rgba(36, 36, 36, 0.04), 0 1px 2px rgba(36, 36, 36, 0.02)',
        'card-hover': '0 6px 16px rgba(36, 36, 36, 0.08), 0 2px 4px rgba(36, 36, 36, 0.04)',
        'dropdown': '0 8px 24px rgba(36, 36, 36, 0.10)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
        'fast': '150ms',
        'normal': '200ms',
      }
    },
  },
  plugins: [],
}
