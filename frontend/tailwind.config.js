/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Light Mode ──────────────────────────
        cream:      '#F7F3EC',
        charcoal:   '#1C1C1C',
        gold:       '#B8934A',
        'gold-light': '#D4A85A',
        sage:       '#6B8F71',
        muted:      '#8B7355',
        parchment:  '#FEFCF8',
        beige:      '#E2DAD0',
        // ── Dark Mode Surfaces ───────────────────
        'dk-bg':       '#0D0D0A',
        'dk-surface':  '#161612',
        'dk-elevated': '#1E1E1A',
        'dk-border':   '#2C2C26',
        'dk-text':     '#EDE8DF',
        'dk-muted':    '#7A6E5F',
      },
      fontFamily: {
        display: ['"Cormorant Garant"', 'Georgia', 'serif'],
        body:    ['Jost', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.3em',
        wide2:  '0.2em',
        wide3:  '0.15em',
      },
    },
  },
  plugins: [],
}
