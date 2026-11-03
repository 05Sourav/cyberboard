import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Cyberboard — Cybersecurity Jobs, Checked Daily',
    template: '%s | Cyberboard',
  },
  description:
    'Real cybersecurity job listings from top employers — checked daily, removed within 24h. Filter by country, role type, level and salary.',
  metadataBase: new URL(process.env.SITE_URL || 'https://cyberboard.co'),
  openGraph: {
    type: 'website',
    siteName: 'Cyberboard',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F3F6F8] font-sans text-[#0F1F2A] antialiased min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 pt-16">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#D8E0E6] py-5 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-[12px] text-[#58697A] text-center sm:text-left">
              Checked daily, removed within 24 hours of the employer taking it down. Salaries shown only when the employer publishes them.{' '}
              <Link href="/remove" className="underline hover:text-[#0F1F2A]">
                Want a company removed?
              </Link>
            </p>
            <div className="flex items-center gap-4 text-[12px] text-[#58697A] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B7A4B]" />
                Feed: Operational
              </span>
              <span>·</span>
              <Link href="/privacy" className="hover:text-[#0F1F2A]">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-[#0F1F2A]">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
