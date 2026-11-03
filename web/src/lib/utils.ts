import { FilterState } from './types'

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

/** Check if a job is "NEW" — seen within 3 days after launch. */
export function isNew(firstSeen: string, launchDate: string): boolean {
  const seen = new Date(firstSeen).getTime()
  const launch = new Date(launchDate).getTime()
  if (seen <= launch) return false // Seeded jobs are never NEW
  return Date.now() - seen < 3 * 24 * 60 * 60 * 1000
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
