'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SearchBarProps {
  query: string
  selectedCountry: string
  totalJobs?: number
  countryCounts?: Record<string, number>
  onQueryChange: (q: string) => void
  onCountryChange: (country: string) => void
}

const TOP_COUNTRY_NAMES = [
  'Anywhere',
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Israel',
  'Singapore',
  'Australia',
  'Netherlands',
  'France',
]

export function SearchBar({
  query,
  selectedCountry,
  totalJobs = 0,
  countryCounts = {},
  onQueryChange,
  onCountryChange,
}: SearchBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // "Anywhere" shows totalJobs; individual countries use live countryCounts
  const getCount = (name: string) => {
    if (name === 'Anywhere') return totalJobs
    return countryCounts[name] ?? 0
  }

  const currentCount = getCount(selectedCountry)

  return (
    <div className="relative flex items-center h-12 w-full md:w-[620px] bg-white border border-[#D8E0E6] rounded-[6px] shadow-sm">
      {/* Search Input */}
      <div className="flex items-center flex-1 px-3.5 gap-2.5 h-full">
        <svg
          className="text-[#58697A] shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search title, company or skill"
          className="w-full bg-transparent text-[14px] text-[#0F1F2A] placeholder-[#58697A] focus:outline-none"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="text-[#58697A] hover:text-[#0F1F2A] text-[12px] p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-6 w-[1px] bg-[#D8E0E6]" />

      {/* Country Selector Dropdown Trigger */}
      <div ref={dropdownRef} className="relative h-full">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3.5 h-full cursor-pointer hover:bg-[#F3F6F8] transition-colors select-none text-left"
        >
          <svg
            className="text-[#58697A] shrink-0"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-[13px] text-[#0F1F2A] font-medium whitespace-nowrap">
            {selectedCountry}{' '}
            <span className="font-mono text-[11px] text-[#58697A]">({currentCount})</span>
          </span>
          <svg
            className={`text-[#58697A] shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#D8E0E6] rounded-[6px] shadow-lg py-1.5 z-50 max-h-72 overflow-y-auto">
            <div className="px-3 py-1.5 text-[11px] font-mono uppercase font-bold text-[#58697A] border-b border-[#D8E0E6]/50">
              Select Region
            </div>
            {TOP_COUNTRY_NAMES.map((name) => {
              const count = getCount(name)
              const isSelected = selectedCountry === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onCountryChange(name)
                    setDropdownOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-left transition-colors ${
                    isSelected ? 'bg-[#EBF5FF] text-[#1B4F8F] font-semibold' : 'text-[#0F1F2A] hover:bg-[#F3F6F8]'
                  }`}
                >
                  <span>{name}</span>
                  <span className="font-mono text-[11px] text-[#58697A]">({count})</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
