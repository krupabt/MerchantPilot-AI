/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MerchantPilot Editorial Palette
        mainBg: '#F5F3EE',
        customerBg: '#F5F3EE',
        merchantBg: '#F5F3EE',
        merchantPanel: '#252722',
        card: '#FFFFFF',
        formBg: '#FFFFFF',
        primaryBtn: '#252722',
        primaryHover: '#41453C',
        softBeige: '#D9D1C2',
        mutedOlive: '#777B70',
        textPrimary: '#20211F',
        textSecondary: '#777B70',
        borderBase: '#E5E2DB',
        brand: {
          primary: '#252722',
          hover: '#41453C',
          accent: '#D9D1C2',
          soft: '#F5F3EE',
          border: '#E5E2DB',
        },
        status: {
          success: '#32734D',
          warning: '#B77932',
          error: '#B84040',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
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
