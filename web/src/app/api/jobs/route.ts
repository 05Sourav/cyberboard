import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase'
import { dedupeJobs } from '@/lib/utils'

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

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient()

      // Build the base filtered query (no range yet)
      const buildQuery = () => {
        let q2 = supabase
          .from('jobs')
          .select(
            '*, companies(id, slug, name, domain, logo_url, hq_country, created_at), promotions(id, tier, highlight, starts_at, ends_at)'
          )
          .eq('status', 'active')
          .eq('companies.blocked', false)

        if (q) {
          q2 = q2.or(`title.ilike.%${q}%,location.ilike.%${q}%,department.ilike.%${q}%`)
        }

        if (country && country !== 'Anywhere') {
          if (includeRemote) {
            q2 = q2.or(
              `countries.cs.{${country}},and(work_mode.eq.Remote,or(worldwide.eq.true,probably_worldwide.eq.true))`
            )
          } else {
            q2 = q2.contains('countries', [country])
          }
        }

        if (categories.length > 0) q2 = q2.in('category', categories)
        if (levels.length > 0) q2 = q2.in('level', levels)
        if (workModes.length > 0) q2 = q2.in('work_mode', workModes)

        if (posted) {
          const days = posted === '1d' ? 1 : posted === '3d' ? 3 : posted === '7d' ? 7 : 30
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
          q2 = q2.gte('first_seen', cutoff)
        }

        if (salaryOnly) {
          q2 = q2.or('salary_min.not.is.null,salary_text.not.is.null')
        }

        if (sort === 'salary') {
          q2 = q2.order('salary_min', { ascending: false, nullsFirst: false })
        } else {
          q2 = q2.order('first_seen', { ascending: false })
        }

        return q2
      }

      // Paginate through Supabase 1 000-row limit until all rows are fetched
      const CHUNK = 1000
      let allData: any[] = []
      let from = 0
      while (true) {
        const { data, error } = await buildQuery().range(from, from + CHUNK - 1)
        if (error) throw error
        if (!data || data.length === 0) break
        allData = allData.concat(data)
        if (data.length < CHUNK) break
        from += CHUNK
      }

      const uniqueJobs = dedupeJobs(allData)

      // Compute per-country counts from the full active set
      const countryCounts: Record<string, number> = {}
      uniqueJobs.forEach((job: any) => {
        if (Array.isArray(job.countries)) {
          job.countries.forEach((c: string) => {
            countryCounts[c] = (countryCounts[c] || 0) + 1
          })
        }
      })

      return NextResponse.json({
        jobs: uniqueJobs,
        total: uniqueJobs.length,
        countryCounts,
      })
    } catch (e) {
      console.warn('Supabase query failed:', e)
    }
  }

  // Return empty list if database unconfigured or error
  return NextResponse.json({
    jobs: [],
    total: 0,
    countryCounts: {},
  })
}
