import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#ffabdd',
          deep: '#c4658f',
          dark: '#7a2e58',
          light: '#fff0f8',
          border: '#ffe0f2',
        },
        gray: {
          DEFAULT: '#8a8a8a',
          light: '#f2f2f0',
          mid: '#d4d4d0',
          dark: '#3a3a3a',
        },
        black: '#1a1a1a',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        dmSans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
