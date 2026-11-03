import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_JOBS } from '@/lib/mock-jobs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  let applyUrl: string | null = null
  let companyId: string | null = null

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient()
      const { data: job } = await supabase
        .from('jobs')
        .select('id, apply_url, company_id')
        .eq('id', jobId)
        .single()

      if (job) {
        applyUrl = job.apply_url
        companyId = job.company_id

        // Log click event asynchronously
        await supabase.from('events').insert({
          event_type: 'click',
          job_id: job.id,
          company_id: job.company_id,
          created_at: new Date().toISOString(),
        })
      }
    } catch (e) {
      console.error('Failed to log click event to Supabase:', e)
    }
  }

  // Fallback to mock data if not found or DB not configured
  if (!applyUrl) {
    const mock = MOCK_JOBS.find((j) => j.id === jobId)
    if (mock) {
      applyUrl = mock.apply_url
      companyId = mock.company_id
    }
  }

  if (applyUrl) {
    return NextResponse.redirect(applyUrl, { status: 302 })
  }

  // Fallback to homepage if job not found
  return NextResponse.redirect(new URL('/', request.url), { status: 302 })
}
