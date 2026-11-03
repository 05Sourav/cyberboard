import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MOCK_JOBS } from '@/lib/mock-jobs'
import { JobCard } from '@/components/JobCard'
import { companyInitials } from '@/lib/utils'
export const dynamic = 'force-dynamic'

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Find all jobs matching this company slug
  const companyJobs = MOCK_JOBS.filter((j) => j.companies?.slug === slug)

  if (companyJobs.length === 0) {
    // If not found in mock, return a graceful 404 or empty state
    return notFound()
  }

  const company = companyJobs[0].companies!
  const initials = companyInitials(company.name)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col w-full">
      <div className="mb-6">
        <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
          ← Back to all jobs
        </Link>
      </div>

      {/* Company Header Card */}
      <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#1E293B] flex items-center justify-center text-white font-mono font-bold text-[18px]">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[26px] font-bold text-[#0F1F2A]">{company.name}</h1>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EBF7F0] text-[#0B7A4B] font-semibold">
                Verified
              </span>
            </div>
            <div className="flex items-center gap-3 text-[14px] text-[#58697A] mt-1">
              {company.domain && (
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1B4F8F] underline"
                >
                  {company.domain}
                </a>
              )}
              {company.hq_country && (
                <>
                  <span>·</span>
                  <span>HQ: {company.hq_country}</span>
                </>
              )}
              <span>·</span>
              <span className="font-mono uppercase text-[11px]">Synced via {company.ats}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-[13px] text-[#58697A] bg-[#F3F6F8] px-3 py-1.5 rounded border border-[#D8E0E6]">
            {companyJobs.length} open {companyJobs.length === 1 ? 'role' : 'roles'}
          </div>
        </div>
      </div>

      {/* Open Roles list */}
      <div>
        <h2 className="text-[18px] font-bold text-[#0F1F2A] mb-4">
          Current Open Positions at {company.name}
        </h2>
        <div className="space-y-2">
          {companyJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  )
}
