import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { JobCard } from '@/components/JobCard'
import { companyInitials } from '@/lib/utils'
import { Job } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('slug', slug)
    .eq('blocked', false)
    .maybeSingle()

  if (!company) {
    return { title: 'Company Not Found' }
  }

  return {
    title: `${company.name} Cybersecurity Jobs`,
    description: `Verified open cybersecurity roles at ${company.name}. Link directly to official applications.`,
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  // 1. Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, slug, ats, domain, logo_url, hq_country')
    .eq('slug', slug)
    .eq('blocked', false)
    .maybeSingle()

  if (!company) {
    return notFound()
  }

  // 2. Fetch company active jobs
  const { data: rawJobs } = await supabase
    .from('jobs')
    .select('*, promotions(id, tier, highlight, starts_at, ends_at)')
    .eq('company_id', company.id)
    .eq('status', 'active')
    .order('first_seen', { ascending: false })

  const jobs: Job[] = (rawJobs || []).map((j: any) => ({
    ...j,
    companies: company,
  }))

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
            {jobs.length} open {jobs.length === 1 ? 'role' : 'roles'}
          </div>
        </div>
      </div>

      {/* Open Roles list */}
      <div>
        <h2 className="text-[18px] font-bold text-[#0F1F2A] mb-4">
          Current Open Positions at {company.name}
        </h2>
        {jobs.length === 0 ? (
          <div className="bg-white border border-[#D8E0E6] rounded-xl p-8 text-center text-[#58697A]">
            No roles currently open at {company.name}. Check back soon or browse all positions.
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
