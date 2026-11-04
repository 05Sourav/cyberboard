import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { JobCard } from '@/components/JobCard'
import { Job } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ country: string }>
}

function formatCountryName(param: string): string {
  const decoded = decodeURIComponent(param).replace(/-/g, ' ')
  return decoded.charAt(0).toUpperCase() + decoded.slice(1)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params
  const formatted = formatCountryName(country)
  const supabase = createServerClient()

  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .contains('countries', [formatted])

  const jobCount = count || 0
  const isIndexed = jobCount >= 5

  return {
    title: `Cybersecurity Jobs in ${formatted}`,
    description: `Browse ${jobCount} verified cybersecurity job openings in ${formatted}. Filter by specialization, seniority, and salary.`,
    robots: {
      index: isIndexed,
      follow: true,
    },
  }
}

export default async function CountryJobsPage({ params }: Props) {
  const { country } = await params
  const formatted = formatCountryName(country)
  const supabase = createServerClient()

  const { data: rawJobs } = await supabase
    .from('jobs')
    .select('*, companies(id, slug, name, domain, logo_url, hq_country), promotions(id, tier, highlight, starts_at, ends_at)')
    .eq('status', 'active')
    .contains('countries', [formatted])
    .order('first_seen', { ascending: false })

  const jobs: Job[] = rawJobs || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col w-full">
      <div className="mb-6">
        <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
          ← Back to all jobs
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[11px] text-[#58697A] uppercase tracking-wider">
            Location Directory
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#0F1F2A] tracking-tight">
          Cybersecurity Jobs in {formatted}
        </h1>
        <p className="text-[14px] text-[#58697A] mt-1">
          {jobs.length} verified cybersecurity {jobs.length === 1 ? 'position' : 'positions'} currently open in {formatted}.
        </p>
      </div>

      <div className="space-y-2">
        {jobs.length === 0 ? (
          <div className="bg-white border border-[#D8E0E6] rounded-xl p-8 text-center text-[#58697A]">
            No roles currently open specifically in {formatted}.{' '}
            <Link href="/" className="text-[#1B4F8F] underline">
              Browse all open positions
            </Link>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  )
}
