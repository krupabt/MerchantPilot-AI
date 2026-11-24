/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MerchantPilot Clean Commercial Palette (Stripe/Shopify/Linear inspired)
        bg: {
          main: '#F6F5F1',
          surface: '#FFFFFF',
          sidebar: '#EAEDE7',
          hover: '#F0F3ED',
        },
        brand: {
          primary: '#234E42',   // Forest green
          hover: '#1B3D34',     // Dark forest green
          accent: '#B8D4C4',    // Soft sage accent
          light: '#EBF4EF',     // Pale sage tinted background
        },
        content: {
          primary: '#202923',   // Primary text
          secondary: '#6B746E', // Muted secondary text
          muted: '#8E9891',     // Supporting/tertiary text
        },
        border: {
          DEFAULT: '#DEE3DC',   // Crisp clean border
          subtle: '#E8ECE6',
          strong: '#C5CDC2',
        },
        status: {
          success: '#347A52',
          successBg: '#EAF4EE',
          warning: '#B77932',
          warningBg: '#FDF4EB',
          error: '#B94A48',
          errorBg: '#FBEFEF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px rgba(35, 78, 66, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'modal': '0 12px 32px -4px rgba(32, 41, 35, 0.15), 0 4px 12px -2px rgba(32, 41, 35, 0.08)',
      }
    },
  },
  plugins: [],
}
