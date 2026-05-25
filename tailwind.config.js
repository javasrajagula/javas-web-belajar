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
        'bg-primary': '#09090b',
        'bg-secondary': '#131316',
        'bg-tertiary': '#1c1c21',
        'bg-elevated': '#18181b',
        'bg-hover': '#27272a',
        'border': '#27272a',
        'border-subtle': '#1f1f23',
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-tertiary': '#71717a',
        'text-muted': '#52525b',
        'accent': '#6366f1',
        'accent-hover': '#818cf8',
        'accent-muted': '#4f46e5',
        'accent-subtle': 'rgba(99, 102, 241, 0.12)',
        'accent-glow': 'rgba(99, 102, 241, 0.25)',
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
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "Geist Mono", "monospace"],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.25)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.3)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.35)',
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
  plugins: [],
};
