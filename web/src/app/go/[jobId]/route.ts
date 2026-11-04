import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  let applyUrl: string | null = null

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient()
      const { data: job } = await supabase
        .from('jobs')
        .select('id, apply_url')
        .eq('id', jobId)
        .single()

      if (job) {
        applyUrl = job.apply_url

        // Log apply click event asynchronously
        try {
          await supabase.from('events').insert({
            kind: 'apply_click',
            job_id: job.id,
            country: request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || null,
          })
        } catch {
          // Non-blocking telemetry
        }
      }
    } catch (e) {
      console.error('Failed to log click event to Supabase:', e)
    }
  }

  if (applyUrl) {
    return NextResponse.redirect(applyUrl, { status: 302 })
  }

  // Fallback to homepage if job not found
  return NextResponse.redirect(new URL('/', request.url), { status: 302 })
}
