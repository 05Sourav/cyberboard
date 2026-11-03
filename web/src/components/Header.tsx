'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const isJobs = pathname === '/' || pathname.startsWith('/jobs')
  const isEmployers = pathname === '/employers'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#D8E0E6]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* Shield/Lock logo mark */}
            <div className="w-8 h-8 rounded bg-[#1B4F8F] flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L2 3.5V8C2 11.3 4.5 14.3 8 15C11.5 14.3 14 11.3 14 8V3.5L8 1Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <rect x="6" y="7" width="4" height="3" rx="0.5" fill="#1B4F8F" />
                <rect
                  x="6.5"
                  y="5.5"
                  width="3"
                  height="2.5"
                  rx="1.5"
                  stroke="#1B4F8F"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <span className="font-semibold text-[20px] tracking-tight text-[#0F1F2A] hidden sm:inline">
              Cyberboard
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-[14px]">
            <Link
              href="/"
              className={`transition-colors pb-[18px] pt-[18px] border-b-2 ${
                isJobs
                  ? 'text-[#0F1F2A] font-medium border-[#1B4F8F]'
                  : 'text-[#58697A] hover:text-[#0F1F2A] border-transparent'
              }`}
            >
              Jobs
            </Link>
            <Link
              href="/employers"
              className={`transition-colors pb-[18px] pt-[18px] border-b-2 ${
                isEmployers
                  ? 'text-[#0F1F2A] font-medium border-[#1B4F8F]'
                  : 'text-[#58697A] hover:text-[#0F1F2A] border-transparent'
              }`}
            >
              For employers
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/employers"
            className="inline-flex items-center gap-1.5 bg-[#1B4F8F] text-white text-[14px] font-medium px-4 py-2 rounded-[6px] hover:bg-[#153e70] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            Post a job
          </Link>
        </div>
      </div>
    </header>
  )
}

