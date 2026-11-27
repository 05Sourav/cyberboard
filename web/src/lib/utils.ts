import type { FilterState, Job } from './types.ts'
import { LAUNCH_DATE } from '../config/site.ts'

/** Parse URL search params into a FilterState object. */
export function parseFilters(params: URLSearchParams): FilterState {
  return {
    q: params.get('q') || '',
    country: params.get('country') || 'Anywhere',
    includeRemote: params.get('remote') !== 'false',
    category: (params.getAll('category') as FilterState['category']),
    level: (params.getAll('level') as FilterState['level']),
    workMode: (params.getAll('mode') as FilterState['workMode']),
    posted: (params.get('posted') || '') as FilterState['posted'],
    salaryOnly: params.get('salary') === '1',
    sort: (params.get('sort') as FilterState['sort']) || 'newest',
    page: parseInt(params.get('page') || '1', 10),
  }
}

/** Serialize a FilterState back to a URLSearchParams string. */
export function serializeFilters(filters: Partial<FilterState>): string {
  const p = new URLSearchParams()
  if (filters.q) p.set('q', filters.q)
  if (filters.country && filters.country !== 'Anywhere') p.set('country', filters.country)
  if (filters.includeRemote === false) p.set('remote', 'false')
  filters.category?.forEach(c => p.append('category', c))
  filters.level?.forEach(l => p.append('level', l))
  filters.workMode?.forEach(m => p.append('mode', m))
  if (filters.posted) p.set('posted', filters.posted)
  if (filters.salaryOnly) p.set('salary', '1')
  if (filters.sort && filters.sort !== 'newest') p.set('sort', filters.sort)
  if (filters.page && filters.page > 1) p.set('page', String(filters.page))
  return p.toString()
}

/** Format a relative timestamp from an ISO date string. */
export function timeAgo(isoDate: string | null): string {
  if (!isoDate) return ''
  const ms = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return minutes <= 1 ? 'Just now' : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

/** Format salary range into a compact chip label. */
export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
  text: string | null,
): string | null {
  if (text) return text
  if (!min && !max) return null
  const fmt = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`
    return String(n)
  }
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'CAD' ? 'CA$' : '$'
  if (min && max) return `${symbol}${fmt(min)} – ${fmt(max)}`
  if (min) return `${symbol}${fmt(min)}+`
  return null
}

/** Get company initials for letter logo placeholder. */
export function companyInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/**
 * Check if a job qualifies for the "NEW" badge:
 * - first_seen must be after LAUNCH_DATE (seeded/initial jobs never show NEW)
 * - must be within 3 days (72 hours) of current time
 * - never for jobs from a company's first-ever fetch (identified when job.first_seen
 *   is within 2 hours of company.created_at)
 */
export function isNew(
  firstSeen: string,
  launchDate: string = LAUNCH_DATE,
  companyCreatedAt?: string | null
): boolean {
  if (!firstSeen) return false
  const seen = new Date(firstSeen).getTime()
  const launch = new Date(launchDate).getTime()
  if (seen <= launch) return false // Seeded jobs are never NEW

  // Exclude jobs from a company's first-ever fetch
  if (companyCreatedAt) {
    const compCreated = new Date(companyCreatedAt).getTime()
    if (Math.abs(seen - compCreated) < 2 * 60 * 60 * 1000) {
      return false
    }
  }

  return Date.now() - seen < 3 * 24 * 60 * 60 * 1000
}

/**
 * Interleave jobs so at most `maxConsecutive` cards from the same company appear consecutively.
 * Preserves the original sort order as closely as possible.
 */
export function interleaveCompanyJobs(jobs: Job[], maxConsecutive = 2): Job[] {
  if (jobs.length <= maxConsecutive) return jobs

  const result: Job[] = []
  const remaining = [...jobs]

  while (remaining.length > 0) {
    const last1 = result.length > 0 ? (result[result.length - 1].companies?.id || result[result.length - 1].company_id) : null
    const last2 = result.length > 1 ? (result[result.length - 2].companies?.id || result[result.length - 2].company_id) : null

    const disallowCompany = (last1 && last2 && last1 === last2) ? last1 : null

    let pickIndex = -1
    if (disallowCompany) {
      pickIndex = remaining.findIndex((j) => (j.companies?.id || j.company_id) !== disallowCompany)
    }

    if (pickIndex === -1) {
      pickIndex = 0
    }

    result.push(remaining.splice(pickIndex, 1)[0])
  }

  return result
}

const TIE_BUCKET_WINDOW_MS = 5 * 60 * 1000

function hashCompanyRank(companyKey: string, seed: number): number {
  const str = `${seed}:${companyKey}`
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

/**
 * Sort jobs by "Most recent" (posted_at if known, otherwise first_seen) descending.
 * Jobs with sort keys within 5 minutes are grouped into tie buckets and ordered
 * round-robin across companies (in a random-but-stable order per page seed),
 * followed by max-2-consecutive company interleaving.
 */
export function sortMostRecentJobs(jobs: Job[], seed = 0): Job[] {
  if (jobs.length <= 1) return [...jobs]

  const withTimes = jobs.map((job) => ({
    job,
    time: new Date(job.posted_at || job.first_seen).getTime(),
  }))

  withTimes.sort((a, b) => b.time - a.time)

  // Group into 5-minute tie buckets
  const buckets: Array<Array<{ job: Job; time: number }>> = []
  let currentBucket: Array<{ job: Job; time: number }> = []
  let bucketAnchor = withTimes[0].time

  for (const item of withTimes) {
    if (currentBucket.length === 0 || bucketAnchor - item.time <= TIE_BUCKET_WINDOW_MS) {
      currentBucket.push(item)
    } else {
      buckets.push(currentBucket)
      currentBucket = [item]
      bucketAnchor = item.time
    }
  }
  if (currentBucket.length > 0) {
    buckets.push(currentBucket)
  }

  // Round-robin across companies within each tie bucket
  const ordered: Job[] = []
  for (const bucket of buckets) {
    const byCompany = new Map<string, Job[]>()
    for (const { job } of bucket) {
      const key = job.companies?.id || job.company_id || job.companies?.slug || job.companies?.name || job.id
      const list = byCompany.get(key)
      if (list) {
        list.push(job)
      } else {
        byCompany.set(key, [job])
      }
    }

    const companyGroups = Array.from(byCompany.entries())
      .sort(([keyA], [keyB]) => hashCompanyRank(keyA, seed) - hashCompanyRank(keyB, seed))
      .map(([, list]) => list)

    const bucketOrdered: Job[] = []
    const maxLen = Math.max(...companyGroups.map((g) => g.length))
    for (let round = 0; round < maxLen; round++) {
      for (const group of companyGroups) {
        if (round < group.length) {
          bucketOrdered.push(group[round])
        }
      }
    }

    ordered.push(...interleaveCompanyJobs(bucketOrdered, 2))
  }

  return ordered
}

/** Detect country from browser timezone (Intl). */
export function countryFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const tzCountryMap: Record<string, string> = {
      'Asia/Calcutta': 'India',
      'Asia/Kolkata': 'India',
      'America/New_York': 'United States',
      'America/Chicago': 'United States',
      'America/Denver': 'United States',
      'America/Los_Angeles': 'United States',
      'America/Toronto': 'Canada',
      'America/Vancouver': 'Canada',
      'Europe/London': 'United Kingdom',
      'Europe/Dublin': 'Ireland',
      'Europe/Berlin': 'Germany',
      'Europe/Paris': 'France',
      'Europe/Amsterdam': 'Netherlands',
      'Europe/Madrid': 'Spain',
      'Europe/Warsaw': 'Poland',
      'Asia/Jerusalem': 'Israel',
      'Asia/Tel_Aviv': 'Israel',
      'Asia/Singapore': 'Singapore',
      'Australia/Sydney': 'Australia',
      'Australia/Melbourne': 'Australia',
      'Asia/Tokyo': 'Japan',
      'America/Sao_Paulo': 'Brazil',
    }
    return tzCountryMap[tz] || null
  } catch {
    return null
  }
}

/** Collapse duplicate job listings sharing company, title, and location into a single card. */
export function dedupeJobs<
  T extends {
    title: string
    location?: string | null
    companies?: { name?: string; slug?: string } | null
    company_id?: string
    company?: string
  }
>(jobs: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const job of jobs) {
    const comp = (job.company || job.company_id || job.companies?.slug || job.companies?.name || '').toLowerCase().trim()
    const title = (job.title || '').toLowerCase().trim()
    const loc = (job.location || '').toLowerCase().trim()
    const key = `${comp}|${title}|${loc}`

    if (!seen.has(key)) {
      seen.add(key)
      result.push(job)
    }
  }

  return result
}

