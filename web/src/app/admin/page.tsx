import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase'
import { AdminDashboardClient } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const auth = await verifyAdminSession()
  if (!auth.authorized) {
    redirect('/admin/login')
  }

  const supabase = createServerClient()

  // 1. Fetch companies
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, slug, ats, domain, blocked')
    .order('name', { ascending: true })

  // 2. Fetch promotions
  const { data: promotions } = await supabase
    .from('promotions')
    .select('id, tier, highlight, starts_at, ends_at, report_token, companies(name)')
    .order('starts_at', { ascending: false })

  // 3. Fetch pending removals
  const { data: removals } = await supabase
    .from('removal_requests')
    .select('id, company_name, contact_email, message, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // 4. Fetch last pipeline run
  const { data: runs } = await supabase
    .from('pipeline_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)

  return (
    <AdminDashboardClient
      adminEmail={auth.email || 'Admin'}
      companies={companies || []}
      promotions={promotions || []}
      removals={removals || []}
      lastRun={runs && runs.length > 0 ? runs[0] : null}
    />
  )
}
