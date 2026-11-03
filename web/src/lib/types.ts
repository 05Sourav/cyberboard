/** Shared TypeScript types for Cyberboard. */

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site'
export type JobStatus = 'active' | 'expired' | 'removed'
export type PromotionTier = 'featured' | 'featured_plus'

export type Category =
  | 'Leadership'
  | 'GRC & Compliance'
  | 'Offensive Security'
  | 'Application Security'
  | 'Cloud Security'
  | 'Identity & Access'
  | 'SOC & Incident Response'
  | 'Threat Intelligence'
  | 'Security Engineering'
  | 'Other Security'

export type Level =
  | 'Executive'
  | 'Manager / Director'
  | 'Principal / Staff'
  | 'Senior'
  | 'Mid-level'
  | 'Entry / Intern'

export interface Company {
  id: string
  slug: string
  name: string
  ats: string
  domain: string | null
  logo_url: string | null
  hq_country: string | null
  blocked: boolean
  created_at: string
}

export interface Job {
  id: string
  source: string
  company_id: string
  external_id: string
  title: string
  location: string | null
  countries: string[]
  work_mode: WorkMode
  worldwide: boolean
  probably_worldwide: boolean
  department: string | null
  category: Category
  level: Level
  apply_url: string
  posted_at: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  salary_text: string | null
  status: JobStatus
  first_seen: string
  last_seen: string
  // Joined
  companies?: Company
  promotions?: Promotion[]
}

export interface Promotion {
  id: string
  company_id: string
  job_id: string | null
  tier: PromotionTier
  highlight: boolean
  starts_at: string
  ends_at: string
  price_cents: number | null
  currency: string | null
  notes: string | null
  contact_email: string | null
  report_token: string | null
}

export interface FilterState {
  q: string
  country: string
  includeRemote: boolean
  category: Category[]
  level: Level[]
  workMode: WorkMode[]
  posted: '' | '1d' | '3d' | '7d' | '30d'
  salaryOnly: boolean
  sort: 'newest' | 'salary'
  page: number
}

export const ALL_CATEGORIES: Category[] = [
  'Security Engineering',
  'SOC & Incident Response',
  'Application Security',
  'Cloud Security',
  'GRC & Compliance',
  'Offensive Security',
  'Identity & Access',
  'Threat Intelligence',
  'Leadership',
  'Other Security',
]

export const ALL_LEVELS: Level[] = [
  'Entry / Intern',
  'Mid-level',
  'Senior',
  'Principal / Staff',
  'Manager / Director',
  'Executive',
]

export const ALL_WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'On-site']

export const LAUNCH_DATE = '2026-11-01T00:00:00Z'
