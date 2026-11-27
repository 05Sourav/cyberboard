import test from 'node:test'
import assert from 'node:assert/strict'
import { sortMostRecentJobs } from './utils.ts'
import type { Job } from './types.ts'

function makeJob(id: string, companyId: string, timestamp: string): Job {
  return {
    id,
    source: 'greenhouse',
    company_id: companyId,
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
    posted_at: null,
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    salary_text: null,
    status: 'active',
    first_seen: timestamp,
    last_seen: timestamp,
    companies: {
      id: companyId,
      slug: companyId,
      name: companyId.toUpperCase(),
      ats: 'greenhouse',
      domain: `${companyId}.com`,
      logo_url: null,
      hq_country: 'United States',
      blocked: false,
      created_at: '2026-11-01T00:00:00Z',
    },
    promotions: [],
  }
}

test('sortMostRecentJobs: 12 jobs (6 from A, 6 from 5 others) with same timestamp -> no company fills >2 of first 6 slots', () => {
  const ts = '2026-11-22T15:39:58Z'
  const jobs: Job[] = [
    makeJob('a1', 'comp-a', ts),
    makeJob('a2', 'comp-a', ts),
    makeJob('a3', 'comp-a', ts),
    makeJob('a4', 'comp-a', ts),
    makeJob('a5', 'comp-a', ts),
    makeJob('a6', 'comp-a', ts),
    makeJob('b1', 'comp-b', ts),
    makeJob('b2', 'comp-b', ts),
    makeJob('c1', 'comp-c', ts),
    makeJob('d1', 'comp-d', ts),
    makeJob('e1', 'comp-e', ts),
    makeJob('f1', 'comp-f', ts),
  ]

  for (const seed of [0.1, 0.42, 0.77, 0.99]) {
    const sorted = sortMostRecentJobs(jobs, seed)
    assert.equal(sorted.length, 12)

    const firstSix = sorted.slice(0, 6)
    const counts = new Map<string, number>()
    for (const j of firstSix) {
      counts.set(j.company_id, (counts.get(j.company_id) || 0) + 1)
    }

    for (const [comp, count] of counts.entries()) {
      assert.ok(
        count <= 2,
        `Company ${comp} filled ${count} of the first 6 slots (seed=${seed})`
      )
    }
  }
})

test('sortMostRecentJobs: 5-minute tie window groups nearby timestamps and respects seed stability', () => {
  const jobs: Job[] = [
    makeJob('a1', 'comp-a', '2026-11-22T15:39:58Z'),
    makeJob('a2', 'comp-a', '2026-11-22T15:39:58Z'),
    makeJob('a3', 'comp-a', '2026-11-22T15:39:58Z'),
    makeJob('b1', 'comp-b', '2026-11-22T15:37:00Z'), // within 5 min of 15:39:58
    makeJob('c1', 'comp-c', '2026-11-22T15:36:00Z'), // within 5 min of 15:39:58
    makeJob('old', 'comp-d', '2026-11-22T15:00:00Z'), // outside 5 min window -> must come last
  ]

  const run1 = sortMostRecentJobs(jobs, 0.12345)
  const run2 = sortMostRecentJobs(jobs, 0.12345)

  assert.deepEqual(
    run1.map((j) => j.id),
    run2.map((j) => j.id),
    'Order must be stable for the same seed'
  )
  assert.equal(run1[run1.length - 1].id, 'old', 'Job outside 5-minute window must sort after newer bucket')
  assert.ok(run1.slice(0, 3).some((j) => j.company_id !== 'comp-a'), 'Round-robin mixes companies within 5-min bucket')
})
