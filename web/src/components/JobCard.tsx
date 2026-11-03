import React from 'react'
import Link from 'next/link'
import { Job } from '@/lib/types'
import { companyInitials, formatSalary, timeAgo, isNew } from '@/lib/utils'

interface JobCardProps {
  job: Job
  isFeatured?: boolean
}

export function JobCard({ job, isFeatured }: JobCardProps) {
  const promo = job.promotions?.[0]
  const isSuperFeatured = promo?.tier === 'featured_plus' || promo?.highlight || isFeatured
  const salaryBadge = formatSalary(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
    job.salary_text
  )
  const isJobNew = isNew(job.first_seen, '2026-11-01T00:00:00Z')
  const initials = companyInitials(job.companies?.name || 'CB')

  // Container styling based on promotion tier
  let containerClasses =
    'bg-white border border-[#D8E0E6] rounded-[6px] p-4 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#1B4F8F] transition-all'

  if (isSuperFeatured) {
    if (promo?.highlight) {
      containerClasses =
        'bg-[#FFF4EC] border border-[#C2410C] rounded-[6px] p-4 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#9A3412] transition-all'
    } else {
      containerClasses =
        'bg-[#FFFAF5] border border-[#E8B99E] rounded-[6px] p-4 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#C2410C] transition-all'
    }
  }

  return (
    <div className={containerClasses}>
      <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
        {/* Monogram tile */}
        <div
          className={`w-10 h-10 rounded-[6px] flex items-center justify-center shrink-0 font-mono font-bold text-[13px] ${
            isSuperFeatured ? 'bg-[#13212B] text-white' : 'bg-[#1E293B] text-white'
          }`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Job title & link */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[16px] font-semibold text-[#0F1F2A] hover:text-[#1B4F8F] transition-colors truncate">
              <Link href={`/go/${job.id}`} target="_blank" rel="noopener noreferrer">
                {job.title}
              </Link>
            </h3>
          </div>

          {/* Company & Location */}
          <div className="text-[14px] text-[#58697A] mt-0.5">
            {job.companies?.slug ? (
              <Link
                href={`/companies/${job.companies.slug}`}
                className="hover:underline font-medium text-[#0F1F2A]"
              >
                {job.companies.name}
              </Link>
            ) : (
              <span className="font-medium text-[#0F1F2A]">{job.companies?.name || 'Cybersecurity Team'}</span>
            )}
            <span className="mx-1 text-[#D8E0E6]">·</span>
            <span>{job.location || job.work_mode}</span>
          </div>

          {/* Tag Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#0F1F2A] border border-[#D8E0E6]/60">
              {job.category}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#0F1F2A] border border-[#D8E0E6]/60">
              {job.work_mode}
            </span>
            {job.probably_worldwide && (
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-[#58697A] border border-[#D8E0E6]">
                Probably worldwide
              </span>
            )}
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#0F1F2A] border border-[#D8E0E6]/60">
              {job.level}
            </span>

            {/* Salary Chip */}
            {salaryBadge ? (
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EBF7F0] text-[#0B7A4B] border border-[#BCE3CC] font-semibold">
                {salaryBadge}
              </span>
            ) : (
              <span className="font-mono text-[11px] text-[#58697A] ml-0.5">
                Salary not disclosed
              </span>
            )}

            {/* Badges */}
            {isSuperFeatured && (
              <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-[#FFF4EC] text-[#C2410C] border border-[#FCD9BD] font-semibold uppercase">
                FEATURED
              </span>
            )}
            {isJobNew && !isSuperFeatured && (
              <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-[#EBF5FF] text-[#1B4F8F] font-semibold uppercase">
                NEW
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Timestamp & Apply action */}
      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8E0E6]">
        <span className="font-mono text-[12px] text-[#58697A] whitespace-nowrap">
          {timeAgo(job.posted_at || job.first_seen)}
        </span>
        <Link
          href={`/go/${job.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1B4F8F] text-white px-4 py-2 rounded-[4px] text-[14px] font-medium hover:bg-[#153e70] transition-colors whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>Apply</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}
