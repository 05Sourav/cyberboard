import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { EmployersClientView } from './EmployersClientView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'For Employers — Reach Cybersecurity Engineers Directly',
  description:
    'Distribute verified cybersecurity roles directly to active practitioners. Priority placement, weekly telemetry reports, and direct ATS application links.',
}

export default async function EmployersPage() {
  let activeJobCount: number | null = null
  let companyCount: number | null = null

  try {
    const supabase = createServerClient()

    // 1. Live active jobs count
    const { count: jobCount } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (jobCount !== null && jobCount !== undefined) {
      activeJobCount = jobCount
    }

    // 2. Live count of employers with active roles
    const { data: activeJobCompanies } = await supabase
      .from('jobs')
      .select('company_id')
      .eq('status', 'active')

    if (activeJobCompanies) {
      const uniqueCompIds = new Set(activeJobCompanies.map((j) => j.company_id))
      companyCount = uniqueCompIds.size
    }
  } catch (err) {
    console.error('Failed to fetch live stats for /employers:', err)
  }

  return (
    <EmployersClientView
      activeJobCount={activeJobCount}
      companyCount={companyCount}
    />
  )
}
