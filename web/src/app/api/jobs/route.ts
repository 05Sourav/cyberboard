import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_JOBS } from '@/lib/mock-jobs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const q = searchParams.get('q') || ''
  const country = searchParams.get('country') || ''
  const includeRemote = searchParams.get('remote') !== 'false'
  const categories = searchParams.getAll('category')
  const levels = searchParams.getAll('level')
  const workModes = searchParams.getAll('mode')
  const posted = searchParams.get('posted') || ''
  const salaryOnly = searchParams.get('salary') === '1'
  const sort = searchParams.get('sort') || 'newest'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = 25

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient()
      let query = supabase
        .from('jobs')
        .select(
          '*, companies(id, slug, name, domain, logo_url, hq_country), promotions(id, tier, highlight, starts_at, ends_at)',
          { count: 'exact' }
        )
        .eq('status', 'active')
        .eq('companies.blocked', false)

      if (q) {
        query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%,department.ilike.%${q}%`)
      }

      if (country && country !== 'Anywhere') {
        if (includeRemote) {
          query = query.or(
            `countries.cs.{${country}},and(work_mode.eq.Remote,or(worldwide.eq.true,probably_worldwide.eq.true))`
          )
        } else {
          query = query.contains('countries', [country])
        }
      }

      if (categories.length > 0) query = query.in('category', categories)
      if (levels.length > 0) query = query.in('level', levels)
      if (workModes.length > 0) query = query.in('work_mode', workModes)

      if (posted) {
        const days = posted === '1d' ? 1 : posted === '3d' ? 3 : posted === '7d' ? 7 : 30
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('first_seen', cutoff)
      }

      if (salaryOnly) {
        query = query.or('salary_min.not.is.null,salary_text.not.is.null')
      }

      if (sort === 'salary') {
        query = query.order('salary_min', { ascending: false, nullsFirst: false })
      } else {
        query = query.order('first_seen', { ascending: false })
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (!error && data) {
        return NextResponse.json({
          jobs: data,
          total: count || 0,
          page,
          pageSize,
          hasMore: (count || 0) > page * pageSize,
        })
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to mock jobs:', e)
    }
  }

  // Fallback to local mock filtering
  let filtered = MOCK_JOBS.filter((job) => {
    if (q) {
      const query = q.toLowerCase()
      const match =
        job.title.toLowerCase().includes(query) ||
        job.companies?.name.toLowerCase().includes(query) ||
        (job.location || '').toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query)
      if (!match) return false
    }

    if (country && country !== 'Anywhere') {
      const inCountry = job.countries.includes(country)
      const isRemoteWorldwide =
        includeRemote && job.work_mode === 'Remote' && (job.worldwide || job.probably_worldwide)
      if (!inCountry && !isRemoteWorldwide) return false
    }

    if (categories.length > 0 && !categories.includes(job.category)) return false
    if (levels.length > 0 && !levels.includes(job.level)) return false
    if (workModes.length > 0 && !workModes.includes(job.work_mode)) return false
    if (salaryOnly && !job.salary_min && !job.salary_text) return false

    return true
  })

  if (sort === 'salary') {
    filtered.sort((a, b) => (b.salary_min || 0) - (a.salary_min || 0))
  } else {
    filtered.sort(
      (a, b) =>
        new Date(b.posted_at || b.first_seen).getTime() -
        new Date(a.posted_at || a.first_seen).getTime()
    )
  }

  const total = filtered.length
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({
    jobs: paginated,
    total,
    page,
    pageSize,
    hasMore: total > page * pageSize,
  })
}
