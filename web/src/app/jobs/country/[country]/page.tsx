import React from 'react'
import Link from 'next/link'
import { MOCK_JOBS } from '@/lib/mock-jobs'
import { JobCard } from '@/components/JobCard'
export const dynamic = 'force-dynamic'

export default async function CountryJobsPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const decodedCountry = decodeURIComponent(country).replace(/-/g, ' ')
  const formattedCountry =
    decodedCountry.charAt(0).toUpperCase() + decodedCountry.slice(1)

  const matchingJobs = MOCK_JOBS.filter((j) =>
    j.countries.some((c) => c.toLowerCase() === decodedCountry.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col w-full">
      <div className="mb-6">
        <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
          ← Back to all jobs
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#0F1F2A] tracking-tight">
          Cybersecurity Jobs in {formattedCountry}
        </h1>
        <p className="text-[14px] text-[#58697A] mt-1">
          {matchingJobs.length} active verified cybersecurity positions open in {formattedCountry}.
        </p>
      </div>

      <div className="space-y-2">
        {matchingJobs.length === 0 ? (
          <div className="bg-white border border-[#D8E0E6] rounded-xl p-8 text-center text-[#58697A]">
            No roles currently open specifically in {formattedCountry}.{' '}
            <Link href="/" className="text-[#1B4F8F] underline">
              Browse worldwide remote roles
            </Link>
          </div>
        ) : (
          matchingJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  )
}
