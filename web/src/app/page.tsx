'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterState, Job } from '@/lib/types'
import { parseFilters, serializeFilters, countryFromTimezone } from '@/lib/utils'
import { MOCK_JOBS } from '@/lib/mock-jobs'
import { SearchBar } from '@/components/SearchBar'
import { FilterSidebar } from '@/components/FilterSidebar'
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer'
import { FeaturedBlock } from '@/components/FeaturedBlock'
import { JobCard } from '@/components/JobCard'

function JobsBoard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const parsed = parseFilters(searchParams)
    // If no country specified, try timezone detection, fallback to 'India'
    if (!searchParams.get('country')) {
      const detected = countryFromTimezone()
      parsed.country = detected || 'India'
    }
    return parsed
  })

  const [sortOpen, setSortOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(15)

  // Sync state changes to URL
  const updateFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated, page: 1 }
      const qs = serializeFilters(next)
      router.replace(qs ? `/?${qs}` : '/', { scroll: false })
      return next
    })
  }

  const resetFilters = () => {
    const defaultState: FilterState = {
      q: '',
      country: filters.country,
      includeRemote: true,
      category: [],
      level: [],
      workMode: [],
      posted: '',
      salaryOnly: false,
      sort: 'newest',
      page: 1,
    }
    setFilters(defaultState)
    const qs = serializeFilters(defaultState)
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
  }

  // Filter and sort mock jobs (or fetched jobs)
  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      // Search query
      if (filters.q) {
        const query = filters.q.toLowerCase()
        const matchTitle = job.title.toLowerCase().includes(query)
        const matchComp = job.companies?.name.toLowerCase().includes(query)
        const matchLoc = (job.location || '').toLowerCase().includes(query)
        const matchCat = job.category.toLowerCase().includes(query)
        if (!matchTitle && !matchComp && !matchLoc && !matchCat) return false
      }

      // Country filter
      if (filters.country && filters.country !== 'Anywhere') {
        const inCountry = job.countries.includes(filters.country)
        const isRemoteWorldwide =
          filters.includeRemote &&
          job.work_mode === 'Remote' &&
          (job.worldwide || job.probably_worldwide)
        if (!inCountry && !isRemoteWorldwide) return false
      }

      // Work mode
      if (filters.workMode.length > 0) {
        if (!filters.workMode.includes(job.work_mode)) return false
      }

      // Category
      if (filters.category.length > 0) {
        if (!filters.category.includes(job.category)) return false
      }

      // Level
      if (filters.level.length > 0) {
        if (!filters.level.includes(job.level)) return false
      }

      // Salary only
      if (filters.salaryOnly) {
        if (!job.salary_min && !job.salary_text) return false
      }

      // Posted
      if (filters.posted) {
        const days =
          filters.posted === '1d'
            ? 1
            : filters.posted === '3d'
            ? 3
            : filters.posted === '7d'
            ? 7
            : 30
        const cutoff = Date.now() - days * 24 * 3600 * 1000
        const jobTime = new Date(job.posted_at || job.first_seen).getTime()
        if (jobTime < cutoff) return false
      }

      return true
    }).sort((a, b) => {
      if (filters.sort === 'salary') {
        return (b.salary_min || 0) - (a.salary_min || 0)
      }
      return (
        new Date(b.posted_at || b.first_seen).getTime() -
        new Date(a.posted_at || a.first_seen).getTime()
      )
    })
  }, [filters])

  // Split into Featured vs Regular
  const featuredJobs = useMemo(() => {
    return filteredJobs.filter((j) => (j.promotions?.length ?? 0) > 0)
  }, [filteredJobs])

  const regularJobs = useMemo(() => {
    return filteredJobs.filter((j) => !j.promotions || j.promotions.length === 0)
  }, [filteredJobs])

  const visibleRegularJobs = regularJobs.slice(0, visibleCount)
  const remainingCount = Math.max(0, regularJobs.length - visibleCount)

  // Dynamic counts for sidebar
  const counts = useMemo(() => {
    const res: Record<string, number> = { total: MOCK_JOBS.length }
    MOCK_JOBS.forEach((j) => {
      res[`mode_${j.work_mode}`] = (res[`mode_${j.work_mode}`] || 0) + 1
      res[`cat_${j.category}`] = (res[`cat_${j.category}`] || 0) + 1
      res[`lvl_${j.level}`] = (res[`lvl_${j.level}`] || 0) + 1
      if (j.salary_min || j.salary_text) {
        res['salary_disclosed'] = (res['salary_disclosed'] || 0) + 1
      }
      if (j.work_mode === 'Remote') {
        res['remote_open'] = (res['remote_open'] || 0) + 1
      }
    })
    return res
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col w-full">
      {/* Search & Heading Module */}
      <section className="w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#D8E0E6]">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0F1F2A] leading-tight tracking-tight">
              Cybersecurity jobs, checked daily
            </h1>
            <p className="text-[14px] text-[#58697A] mt-1">
              <span className="font-mono text-[#0F1F2A] font-semibold">
                1,284
              </span>{' '}
              open roles from{' '}
              <span className="font-mono text-[#0F1F2A] font-semibold">96</span>{' '}
              verified cybersecurity teams.
            </p>
          </div>

          {/* Integrated Search Bar */}
          <SearchBar
            query={filters.q}
            selectedCountry={filters.country}
            onQueryChange={(q) => updateFilters({ q })}
            onCountryChange={(country) => updateFilters({ country })}
          />
        </div>
      </section>

      {/* Mobile filter bottom sheet drawer */}
      <MobileFilterDrawer
        filters={filters}
        counts={counts}
        totalResults={filteredJobs.length}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Two-Column Feed Grid */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block sticky top-20">
            <FilterSidebar
              filters={filters}
              counts={counts}
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Main Feed Column */}
          <div className="flex-1 min-w-0">
            {/* Header Strip */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-[14px] text-[#0F1F2A] font-medium">
                <span className="font-mono font-semibold">
                  {filteredJobs.length}
                </span>{' '}
                roles · {filters.country}
              </div>

              {/* Sort selector */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#D8E0E6] rounded-[6px] px-3 py-1.5 text-[13px] text-[#0F1F2A] hover:bg-[#F3F6F8] transition-colors shadow-xs"
                >
                  <span>
                    Sort: {filters.sort === 'salary' ? 'Highest salary' : 'Most recent'}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#58697A]"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#D8E0E6] rounded-[6px] shadow-lg py-1 z-20">
                    <button
                      onClick={() => {
                        updateFilters({ sort: 'newest' })
                        setSortOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-[13px] ${
                        filters.sort === 'newest'
                          ? 'bg-[#EBF5FF] text-[#1B4F8F] font-semibold'
                          : 'hover:bg-[#F3F6F8]'
                      }`}
                    >
                      Most recent
                    </button>
                    <button
                      onClick={() => {
                        updateFilters({ sort: 'salary' })
                        setSortOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-[13px] ${
                        filters.sort === 'salary'
                          ? 'bg-[#EBF5FF] text-[#1B4F8F] font-semibold'
                          : 'hover:bg-[#F3F6F8]'
                      }`}
                    >
                      Highest salary
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* FEATURED ROLES BLOCK */}
            <FeaturedBlock jobs={featuredJobs} />

            {/* ALL ROLES SECTION */}
            <div className="mt-6">
              <div className="font-mono uppercase text-[12px] font-semibold tracking-wider text-[#58697A] mb-2">
                All Roles
              </div>

              {visibleRegularJobs.length === 0 && featuredJobs.length === 0 ? (
                <div className="bg-white border border-[#D8E0E6] rounded-[6px] p-12 text-center my-4">
                  <div className="w-12 h-12 rounded-full bg-[#EBF5FF] text-[#1B4F8F] mx-auto flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#0F1F2A]">No matching roles found</h3>
                  <p className="text-[14px] text-[#58697A] mt-1 max-w-sm mx-auto">
                    Try loosening your filters or switching your location to Anywhere.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-[#1B4F8F] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#153e70]"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleRegularJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Trigger */}
            {remainingCount > 0 && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="w-full py-3 bg-white border border-[#D8E0E6] text-[#0F1F2A] font-medium rounded-[6px] hover:bg-[#F3F6F8] text-center my-6 text-[14px] transition-colors block shadow-xs"
              >
                Show more ({remainingCount} more roles)
              </button>
            )}

            {/* Freshness Guarantee */}
            <div className="border-t border-[#D8E0E6] py-4 text-center mt-6">
              <p className="font-mono text-[12px] text-[#58697A] tracking-tight">
                Checked daily, removed within 24 hours of the employer taking it down.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#58697A]">Loading cybersecurity roles...</div>}>
      <JobsBoard />
    </Suspense>
  )
}
