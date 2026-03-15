// NOTE: This project uses Tailwind CSS v4, which uses CSS-based configuration
// via the @theme block in app/globals.css. This file is provided for reference
// and tooling compatibility, but the authoritative token definitions live in globals.css.
//
// In Tailwind v4, custom tokens are registered with @theme inline { ... } in CSS.

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#050608',
        'bg-panel': '#0a0c0f',
        'bg-surface': '#12151a',
        'bg-hover': '#191d24',
        'border-subtle': '#1b2025',
        'border-strong': '#2a3139',
        'text-primary': '#f2f5f8',
        'text-secondary': '#828a93',
        'text-tertiary': '#5c636a',
        'accent-positive': '#cde0d5',
        'accent-negative': '#dfa234',
      },
      fontFamily: {
        ui: ['Inter', 'sans-serif'],
        head: ['Space Grotesk', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
