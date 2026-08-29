/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './public/preview.html',
    './public/preview.css'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Thème gris Grok-style
        grok: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              '&:hover': {
                color: 'inherit',
                opacity: 0.8,
              },
            },
            code: {
              color: 'inherit',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            // HR sans marges pour réduire l'espace entre les tables
            hr: {
              marginTop: '0',
              marginBottom: '0',
              borderColor: 'transparent',
              opacity: '0',
              display: 'none',
            },
          },
        },
      },
      keyframes: {
        'fade-out': {
          '0%': { opacity: '1' },
          '75%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(244, 114, 182, 0.5), 0 0 20px rgba(244, 114, 182, 0.3), 0 0 30px rgba(244, 114, 182, 0.2)'
          },
          '50%': {
            boxShadow: '0 0 15px rgba(244, 114, 182, 0.7), 0 0 25px rgba(244, 114, 182, 0.5), 0 0 35px rgba(244, 114, 182, 0.3)'
          }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(5%)' },
        }
      },
      animation: {
        'fade-out': 'fade-out 3s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};