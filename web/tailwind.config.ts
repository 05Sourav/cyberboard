import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F6F8',
        surface: '#FFFFFF',
        ink: '#0F1F2A',
        muted: '#58697A',
        border: '#D8E0E6',
        primary: {
          DEFAULT: '#1B4F8F',
          hover: '#153e70',
        },
        featured: {
          bg: '#FFF4EC',
          border: '#FCD9BD',
          text: '#C2410C',
        },
        salary: {
          bg: '#E6F5EE',
          text: '#0B7A4B',
          border: '#BCE3CC',
        },
        'new-badge': {
          bg: '#EBF5FF',
          text: '#1B4F8F',
        },
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'var(--font-ibm-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
