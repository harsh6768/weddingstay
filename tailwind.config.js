/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), sunk: v('sunk'), ink: v('ink'), muted: v('muted'),
        line: v('line'), plum: v('plum'), onplum: v('onplum'), plumsoft: v('plumsoft'), marigold: v('marigold'), gold: v('gold'),
        good: v('good'), warn: v('warn'), bad: v('bad'), info: v('info'),
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', '"Cormorant Garamond"', 'cursive'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
