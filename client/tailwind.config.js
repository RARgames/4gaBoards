const tailwindcssAnimate = require('tailwindcss-animate');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // The app has no global CSS reset and 500+ hand-styled legacy components.
  // Preflight's global margin/box-sizing/form-control resets would risk
  // widespread layout shifts, so it's disabled — new shadcn/ui primitives
  // set their own resets locally via utility classes instead.
  corePlugins: {
    preflight: false,
  },
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--tw-border)',
        input: 'var(--tw-input)',
        ring: 'var(--tw-ring)',
        background: 'var(--tw-background)',
        foreground: 'var(--tw-foreground)',
        primary: {
          DEFAULT: 'var(--tw-primary)',
          hover: 'var(--tw-primary-hover)',
          foreground: 'var(--tw-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--tw-secondary)',
          hover: 'var(--tw-secondary-hover)',
          foreground: 'var(--tw-secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--tw-destructive)',
          hover: 'var(--tw-destructive-hover)',
          foreground: 'var(--tw-destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--tw-muted)',
          foreground: 'var(--tw-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--tw-accent)',
          foreground: 'var(--tw-accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--tw-popover)',
          foreground: 'var(--tw-popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--tw-card)',
          foreground: 'var(--tw-card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--tw-radius-lg)',
        md: 'var(--tw-radius)',
        sm: 'calc(var(--tw-radius) - 2px)',
      },
      boxShadow: {
        sm: 'var(--tw-shadow-sm)',
        DEFAULT: 'var(--tw-shadow)',
        md: 'var(--tw-shadow-md)',
        lg: 'var(--tw-shadow-lg)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
