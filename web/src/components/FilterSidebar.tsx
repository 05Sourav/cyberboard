'use client'

import React from 'react'
import { FilterState, ALL_CATEGORIES, ALL_LEVELS, ALL_WORK_MODES } from '@/lib/types'

interface FilterSidebarProps {
  filters: FilterState
  counts?: Record<string, number>
  onChange: (updated: Partial<FilterState>) => void
  onReset: () => void
}

export function FilterSidebar({ filters, counts = {}, onChange, onReset }: FilterSidebarProps) {
  const toggleArrayItem = <T extends string>(list: T[], item: T): T[] => {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
  }

  const hasActiveFilters =
    filters.q !== '' ||
    filters.country !== 'Anywhere' ||
    !filters.includeRemote ||
    filters.category.length > 0 ||
    filters.level.length > 0 ||
    filters.workMode.length > 0 ||
    filters.posted !== '' ||
    filters.salaryOnly

  return (
    <aside className="bg-white border border-[#D8E0E6] rounded-[6px] p-4 text-[13px] select-none shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8E0E6]">
        <span className="font-mono text-[11px] uppercase font-bold text-[#58697A] tracking-wider">
          Filters
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[12px] text-[#1B4F8F] hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* REMOTE */}
      <div className="mb-5 pb-5 border-b border-[#D8E0E6]">
        <div className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#58697A] mb-3">
          Remote
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.includeRemote}
            onChange={(e) => onChange({ includeRemote: e.target.checked })}
            className="mt-0.5 rounded-[3px] border-[#D8E0E6] text-[#1B4F8F] focus:ring-0 cursor-pointer accent-[#1B4F8F]"
          />
          <span className="text-[#0F1F2A] text-[13px] leading-snug group-hover:text-[#1B4F8F] flex-1">
            Include remote roles open to my location
          </span>
          <span className="font-mono text-[11px] text-[#58697A] ml-1">
            {counts['remote_open'] ?? 89}
          </span>
        </label>
      </div>

      {/* WORK MODE */}
      <div className="mb-5 pb-5 border-b border-[#D8E0E6]">
        <div className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#58697A] mb-3">
          Work Mode
        </div>
        <div className="space-y-2">
          {ALL_WORK_MODES.map((mode) => {
            const checked = filters.workMode.includes(mode)
            return (
              <label key={mode} className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onChange({ workMode: toggleArrayItem(filters.workMode, mode) })
                    }
                    className="rounded-[3px] border-[#D8E0E6] accent-[#1B4F8F]"
                  />
                  <span className="text-[#0F1F2A] group-hover:text-[#1B4F8F]">{mode}</span>
                </span>
                <span className="font-mono text-[11px] text-[#58697A]">
                  {counts[`mode_${mode}`] ?? (mode === 'Remote' ? 89 : mode === 'Hybrid' ? 83 : 42)}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* ROLE TYPE */}
      <div className="mb-5 pb-5 border-b border-[#D8E0E6]">
        <div className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#58697A] mb-3">
          Role Type
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {ALL_CATEGORIES.map((cat) => {
            const checked = filters.category.includes(cat)
            return (
              <label key={cat} className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onChange({ category: toggleArrayItem(filters.category, cat) })
                    }
                    className="rounded-[3px] border-[#D8E0E6] accent-[#1B4F8F]"
                  />
                  <span className="text-[#0F1F2A] group-hover:text-[#1B4F8F] leading-tight text-[12.5px]">
                    {cat}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-[#58697A] shrink-0 ml-1">
                  {counts[`cat_${cat}`] ?? (cat === 'Security Engineering' ? 64 : cat === 'SOC & Incident Response' ? 38 : cat === 'Application Security' ? 41 : cat === 'Cloud Security' ? 32 : cat === 'GRC & Compliance' ? 19 : 14)}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* LEVEL */}
      <div className="mb-5 pb-5 border-b border-[#D8E0E6]">
        <div className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#58697A] mb-3">
          Level
        </div>
        <div className="space-y-2">
          {ALL_LEVELS.map((lvl) => {
            const checked = filters.level.includes(lvl)
            return (
              <label key={lvl} className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange({ level: toggleArrayItem(filters.level, lvl) })}
                    className="rounded-[3px] border-[#D8E0E6] accent-[#1B4F8F]"
                  />
                  <span className="text-[#0F1F2A] group-hover:text-[#1B4F8F] leading-tight text-[12.5px]">
                    {lvl}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-[#58697A] shrink-0 ml-1">
                  {counts[`lvl_${lvl}`] ?? (lvl === 'Senior' ? 98 : lvl === 'Mid-level' ? 86 : lvl === 'Principal / Staff' ? 18 : 12)}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* POSTED */}
      <div className="mb-5 pb-5 border-b border-[#D8E0E6]">
        <div className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#58697A] mb-3">
          Posted
        </div>
        <div className="space-y-2">
          {[
            { label: 'Past 24 hours', value: '1d', count: 14 },
            { label: 'Past 3 days', value: '3d', count: 32 },
            { label: 'Past week', value: '7d', count: 68 },
            { label: 'Past month', value: '30d', count: 214 },
            { label: 'All time', value: '', count: counts['total'] ?? 250 },
          ].map((item) => (
            <label key={item.value} className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="posted"
                  checked={filters.posted === item.value}
                  onChange={() => onChange({ posted: item.value as FilterState['posted'] })}
                  className="border-[#D8E0E6] accent-[#1B4F8F]"
                />
                <span className="text-[#0F1F2A] group-hover:text-[#1B4F8F]">{item.label}</span>
              </span>
              <span className="font-mono text-[11px] text-[#58697A]">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SALARY */}
      <div>
        <div className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#58697A] mb-3">
          Salary
        </div>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.salaryOnly}
              onChange={(e) => onChange({ salaryOnly: e.target.checked })}
              className="rounded-[3px] border-[#D8E0E6] accent-[#1B4F8F]"
            />
            <span className="text-[#0F1F2A] group-hover:text-[#1B4F8F]">Salary shown only</span>
          </span>
          <span className="font-mono text-[11px] text-[#58697A]">
            {counts['salary_disclosed'] ?? 52}
          </span>
        </label>
      </div>
    </aside>
  )
}
