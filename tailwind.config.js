/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#f9f9f9',
        'bg-secondary': '#ffffff',
        'bg-tertiary': '#f3f3f4',
        'bg-elevated': '#eeeeee',
        'bg-hover': '#e2e2e2',
        'border': '#1a1c1c',
        'border-subtle': '#cec6ad',
        'text-primary': '#1a1c1c',
        'text-secondary': '#4b4734',
        'text-tertiary': '#7d7761',
        'text-muted': '#8f8977',
        
        // Pembaruan Palet Warna Premium
        'primary': '#8127cf',
        'primary-hover': '#6900b3',
        'primary-subtle': 'rgba(129, 39, 207, 0.12)',
        'primary-glow': 'rgba(129, 39, 207, 0.25)',
        
        'secondary': '#006d36',
        'secondary-hover': '#005227',
        'secondary-subtle': 'rgba(109, 254, 156, 0.22)',
        
        'accent': '#fde047',
        'accent-hover': '#e2c62d',
        'accent-subtle': 'rgba(253, 224, 71, 0.35)',
        
        'success': '#22c55e',
        'success-subtle': 'rgba(34, 197, 94, 0.12)',
        'warning': '#f59e0b',
        'warning-subtle': 'rgba(245, 158, 11, 0.12)',
        'danger': '#ef4444',
        'danger-subtle': 'rgba(239, 68, 68, 0.12)',
        'info': '#3b82f6',
        'info-subtle': 'rgba(59, 130, 246, 0.12)',
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Lexend", "sans-serif"],
        mono: ["var(--font-mono)", "Geist Mono", "monospace"],
      },
      borderRadius: {
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
      },
      boxShadow: {
        xs: '3px 3px 0 #1a1c1c',
        sm: '4px 4px 0 #1a1c1c',
        md: '6px 6px 0 #1a1c1c',
        lg: '8px 8px 0 #1a1c1c',
        xl: '10px 10px 0 #1a1c1c',
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-down': 'slide-down 0.25s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
