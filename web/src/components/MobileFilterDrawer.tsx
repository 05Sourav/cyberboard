'use client'

import React, { useState } from 'react'
import { FilterState } from '@/lib/types'
import { FilterSidebar } from './FilterSidebar'

interface MobileFilterDrawerProps {
  filters: FilterState
  counts?: Record<string, number>
  totalResults: number
  onChange: (updated: Partial<FilterState>) => void
  onReset: () => void
}

export function MobileFilterDrawer({
  filters,
  counts,
  totalResults,
  onChange,
  onReset,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount =
    (filters.includeRemote ? 0 : 1) +
    filters.category.length +
    filters.level.length +
    filters.workMode.length +
    (filters.posted ? 1 : 0) +
    (filters.salaryOnly ? 1 : 0)

  return (
    <div className="lg:hidden mb-4">
      {/* Quick filter row on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] border transition-colors whitespace-nowrap shadow-sm ${
            activeFilterCount > 0
              ? 'bg-[#EBF5FF] border-[#1B4F8F] text-[#1B4F8F] font-semibold'
              : 'bg-white border-[#D8E0E6] text-[#0F1F2A]'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>

        <button
          onClick={() => onChange({ includeRemote: !filters.includeRemote })}
          className={`px-3 py-1.5 rounded-[6px] text-[13px] border whitespace-nowrap transition-colors shadow-sm ${
            filters.includeRemote
              ? 'bg-[#EBF5FF] border-[#1B4F8F] text-[#1B4F8F] font-medium'
              : 'bg-white border-[#D8E0E6] text-[#0F1F2A]'
          }`}
        >
          Remote friendly
        </button>

        <button
          onClick={() => onChange({ salaryOnly: !filters.salaryOnly })}
          className={`px-3 py-1.5 rounded-[6px] text-[13px] border whitespace-nowrap transition-colors shadow-sm ${
            filters.salaryOnly
              ? 'bg-[#E6F5EE] border-[#0B7A4B] text-[#0B7A4B] font-medium'
              : 'bg-white border-[#D8E0E6] text-[#0F1F2A]'
          }`}
        >
          Salary disclosed
        </button>
      </div>

      {/* Slide-over sheet backdrop & panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-t-xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D8E0E6]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[16px] text-[#0F1F2A]">Filter & Refine</h3>
                {activeFilterCount > 0 && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EBF5FF] text-[#1B4F8F] font-bold">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-[#58697A] hover:text-[#0F1F2A]"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="overflow-y-auto p-4 flex-1">
              <FilterSidebar
                filters={filters}
                counts={counts}
                onChange={onChange}
                onReset={onReset}
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#D8E0E6] flex items-center gap-3 bg-[#F3F6F8]">
              <button
                onClick={() => {
                  onReset()
                  setIsOpen(false)
                }}
                className="flex-1 py-2.5 px-4 bg-white border border-[#D8E0E6] rounded-[6px] text-[14px] font-medium text-[#0F1F2A] hover:bg-[#F3F6F8]"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#1B4F8F] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#153e70] shadow-sm"
              >
                Show {totalResults} roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
