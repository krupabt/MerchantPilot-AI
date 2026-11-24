/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MerchantPilot Clean Off-White & Terracotta Design System
        bg: {
          main: '#F7F7F5',
          surface: '#FFFFFF',
          sidebar: '#FFFFFF',
          hover: '#F0F0EE',
        },
        brand: {
          primary: '#C65D3B',   // Terracotta accent
          hover: '#B24F2F',     // Darker terracotta
          accent: '#EAD6CF',    // Soft terracotta wash
          light: '#FBF4F1',     // Pale terracotta tinted surface
        },
        content: {
          primary: '#222222',   // Dark charcoal primary text
          secondary: '#71717A', // Neutral slate secondary text
          muted: '#A1A1AA',     // Supporting/tertiary text
        },
        border: {
          DEFAULT: '#E5E5E5',   // Subtle clean border
          subtle: '#EFEFEF',
          strong: '#D4D4D4',
        },
        status: {
          success: '#39805A',
          successBg: '#EEF7F2',
          warning: '#B7791F',
          warningBg: '#FEF9EE',
          error: '#C24141',
          errorBg: '#FDF2F2',
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
        'card-hover': '0 4px 12px rgba(198, 93, 59, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'modal': '0 12px 32px -4px rgba(34, 34, 34, 0.15), 0 4px 12px -2px rgba(34, 34, 34, 0.08)',
      }
    },
  },
  plugins: [],
}
