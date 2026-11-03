import React from 'react'
import { Job } from '@/lib/types'
import { JobCard } from './JobCard'

interface FeaturedBlockProps {
  jobs: Job[]
}

export function FeaturedBlock({ jobs }: FeaturedBlockProps) {
  if (jobs.length === 0) return null

  return (
    <div className="mb-6">
      <div className="font-mono uppercase text-[12px] font-semibold tracking-wider text-[#C2410C] mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
        Featured Roles
      </div>
      <div className="space-y-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isFeatured={true} />
        ))}
      </div>
    </div>
  )
}
