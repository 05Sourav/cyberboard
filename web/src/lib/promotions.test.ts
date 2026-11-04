import test from 'node:test'
import assert from 'node:assert/strict'
import { partitionPromotedJobs, filterJobs } from './promotions.ts'
import type { Job, FilterState } from './types.ts'

function makeJob(id: string, companySlug: string, isPromoted = false, overrides: Partial<Job> = {}): Job {
  return {
    id,
    source: 'greenhouse',
    company_id: companySlug,
    external_id: id,
    title: `Role ${id}`,
    location: 'Remote',
    countries: ['United States'],
    work_mode: 'Remote',
    worldwide: false,
    probably_worldwide: false,
    department: 'Security',
    category: 'Security Engineering',
    level: 'Senior',
    apply_url: `https://example.com/apply/${id}`,
    posted_at: new Date().toISOString(),
    salary_min: 150000,
    salary_max: 180000,
    salary_currency: 'USD',
    salary_text: '$150k - $180k',
    status: 'active',
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    companies: {
      id: companySlug,
      slug: companySlug,
      name: companySlug.toUpperCase(),
      ats: 'greenhouse',
      domain: `${companySlug}.com`,
      logo_url: null,
      hq_country: 'United States',
      blocked: false,
      created_at: new Date().toISOString(),
    },
    promotions: isPromoted
      ? [
          {
            id: `promo-${id}`,
            company_id: companySlug,
            job_id: id,
            tier: 'featured',
            highlight: false,
            starts_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 86400000).toISOString(),
            price_cents: 19900,
            currency: 'USD',
            notes: null,
            contact_email: null,
            report_token: null,
          },
        ]
      : [],
    ...overrides,
  }
}

test('partitionPromotedJobs: enforces max 3 pinned jobs at top', () => {
  const jobs: Job[] = [
    makeJob('1', 'comp-a', true),
    makeJob('2', 'comp-b', true),
    makeJob('3', 'comp-c', true),
    makeJob('4', 'comp-d', true),
    makeJob('5', 'comp-e', true),
    makeJob('6', 'comp-f', false),
  ]

  const { pinnedJobs, regularJobs } = partitionPromotedJobs(jobs)

  assert.equal(pinnedJobs.length, 3, 'Must pin at most 3 jobs')
  assert.equal(regularJobs.length, 3, '2 overflow promoted + 1 organic job')
})

test('partitionPromotedJobs: enforces one slot per employer', () => {
  const jobs: Job[] = [
    makeJob('1', 'comp-a', true),
    makeJob('2', 'comp-a', true), // Same company comp-a
    makeJob('3', 'comp-b', true),
    makeJob('4', 'comp-c', false),
  ]

  const { pinnedJobs, regularJobs } = partitionPromotedJobs(jobs)

  assert.equal(pinnedJobs.length, 2, 'Only 1 slot per company (comp-a and comp-b)')
  assert.deepEqual(
    pinnedJobs.map((j) => j.company_id),
    ['comp-a', 'comp-b']
  )

  // Second comp-a job must be in regularJobs
  const overflowCompA = regularJobs.find((j) => j.id === '2')
  assert.ok(overflowCompA, 'Second promoted job from comp-a must overflow into regularJobs')
})

test('partitionPromotedJobs: overflow promoted jobs remain in list with promotion metadata', () => {
  const jobs: Job[] = [
    makeJob('1', 'comp-a', true),
    makeJob('2', 'comp-b', true),
    makeJob('3', 'comp-c', true),
    makeJob('4', 'comp-d', true), // 4th promoted job -> overflow
    makeJob('5', 'comp-e', false),
  ]

  const { pinnedJobs, regularJobs } = partitionPromotedJobs(jobs)

  assert.equal(pinnedJobs.length, 3)
  const overflowJob = regularJobs.find((j) => j.id === '4')
  assert.ok(overflowJob, 'Overflow promoted job must be in regularJobs')
  assert.equal(overflowJob?.promotions?.length, 1, 'Overflow job retains its promotion object')

  // Check pinned jobs are NOT duplicated in regularJobs
  for (const pinned of pinnedJobs) {
    const duplicate = regularJobs.find((j) => j.id === pinned.id)
    assert.equal(duplicate, undefined, `Pinned job ${pinned.id} must not be duplicated in regularJobs`)
  }
})

test('filterJobs: filter mismatch is excluded so it is never pinned', () => {
  const defaultFilters: FilterState = {
    q: 'Cloud',
    country: 'United States',
    includeRemote: true,
    category: ['Cloud Security'],
    level: [],
    workMode: [],
    posted: '',
    salaryOnly: false,
    sort: 'newest',
    page: 1,
  }

  const promotedMismatch = makeJob('1', 'comp-a', true, {
    category: 'SOC & Incident Response', // Mismatch!
    title: 'SOC Analyst',
  })
  const promotedMatch = makeJob('2', 'comp-b', true, {
    category: 'Cloud Security', // Matches!
    title: 'Senior Cloud Security Architect',
  })

  const filtered = filterJobs([promotedMismatch, promotedMatch], defaultFilters)
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].id, '2')

  const { pinnedJobs } = partitionPromotedJobs(filtered)
  assert.equal(pinnedJobs.length, 1)
  assert.equal(pinnedJobs[0].id, '2', 'Only matching promoted job is pinned')
})
