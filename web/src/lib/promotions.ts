import type { Job, FilterState } from './types'

export interface PartitionedJobs {
  pinnedJobs: Job[]
  regularJobs: Job[]
}

/**
 * Filter jobs according to active search, country, category, level, workMode, posted, and salaryOnly filters.
 */
export function filterJobs(jobs: Job[], filters: FilterState): Job[] {
  return jobs.filter((job) => {
    // Search query
    if (filters.q) {
      const query = filters.q.toLowerCase()
      const matchTitle = job.title.toLowerCase().includes(query)
      const matchComp = job.companies?.name?.toLowerCase().includes(query)
      const matchLoc = (job.location || '').toLowerCase().includes(query)
      const matchCat = job.category.toLowerCase().includes(query)
      if (!matchTitle && !matchComp && !matchLoc && !matchCat) return false
    }

    // Country filter
    if (filters.country && filters.country !== 'Anywhere') {
      const inCountry = job.countries?.includes(filters.country)
      const isRemoteWorldwide =
        filters.includeRemote &&
        job.work_mode === 'Remote' &&
        (job.worldwide || job.probably_worldwide)
      if (!inCountry && !isRemoteWorldwide) return false
    }

    // Work mode
    if (filters.workMode.length > 0 && !filters.workMode.includes(job.work_mode)) {
      return false
    }

    // Category
    if (filters.category.length > 0 && !filters.category.includes(job.category)) {
      return false
    }

    // Level
    if (filters.level.length > 0 && !filters.level.includes(job.level)) {
      return false
    }

    // Salary only
    if (filters.salaryOnly && !job.salary_min && !job.salary_text) {
      return false
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
  })
}

/**
 * Pure promotion partitioning logic:
 * - Promoted jobs must match all currently active filters.
 * - At most 3 pinned slots at top.
 * - If more than 3 match, choose randomly per page load (shuffle function can be injected).
 * - One slot per employer: a company can occupy only one pinned slot.
 * - Overflow promoted jobs stay in the normal list with their Featured label.
 * - Pinned jobs must not be duplicated in the normal list.
 */
export function partitionPromotedJobs(
  matchingJobs: Job[],
  shuffleFn?: (items: Job[]) => Job[]
): PartitionedJobs {
  const promotedMatches: Job[] = []
  const organicJobs: Job[] = []

  for (const job of matchingJobs) {
    if (job.promotions && job.promotions.length > 0) {
      promotedMatches.push(job)
    } else {
      organicJobs.push(job)
    }
  }

  // Shuffle promoted candidates if shuffleFn provided or use as-is
  const orderedPromotions = shuffleFn ? shuffleFn([...promotedMatches]) : [...promotedMatches]

  const pinnedJobs: Job[] = []
  const overflowPromotedJobs: Job[] = []
  const seenCompanies = new Set<string>()

  for (const job of orderedPromotions) {
    const companyKey = (job.companies?.slug || job.company_id || job.companies?.name || job.id).toLowerCase()
    if (pinnedJobs.length < 3 && !seenCompanies.has(companyKey)) {
      pinnedJobs.push(job)
      seenCompanies.add(companyKey)
    } else {
      overflowPromotedJobs.push(job)
    }
  }

  // Regular list contains overflow promoted jobs + all organic jobs (pinned jobs are excluded)
  const regularJobs = [...overflowPromotedJobs, ...organicJobs]

  return {
    pinnedJobs,
    regularJobs,
  }
}
