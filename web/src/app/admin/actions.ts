'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase'

export async function toggleCompanyBlockAction(companyId: string, currentlyBlocked: boolean) {
  const auth = await verifyAdminSession()
  if (!auth.authorized) {
    throw new Error('Unauthorized')
  }

  const supabase = createServerClient()
  const nextBlocked = !currentlyBlocked

  const { error } = await supabase
    .from('companies')
    .update({ blocked: nextBlocked })
    .eq('id', companyId)

  if (error) throw new Error(error.message)

  // If blocked, also mark all its jobs as removed
  if (nextBlocked) {
    await supabase
      .from('jobs')
      .update({ status: 'removed' })
      .eq('company_id', companyId)
  }

  revalidatePath('/admin')
  return { success: true, blocked: nextBlocked }
}

export async function resolveRemovalRequestAction(
  requestId: string,
  blockCompany: boolean,
  companyName: string
) {
  const auth = await verifyAdminSession()
  if (!auth.authorized) {
    throw new Error('Unauthorized')
  }

  const supabase = createServerClient()

  // Mark removal request as resolved
  await supabase
    .from('removal_requests')
    .update({ status: 'resolved' })
    .eq('id', requestId)

  // If requested, block the company in companies table
  if (blockCompany && companyName) {
    const { data: comp } = await supabase
      .from('companies')
      .select('id')
      .ilike('name', companyName.trim())
      .maybeSingle()

    if (comp) {
      await supabase
        .from('companies')
        .update({ blocked: true })
        .eq('id', comp.id)

      await supabase
        .from('jobs')
        .update({ status: 'removed' })
        .eq('company_id', comp.id)
    }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function signOutAdminAction() {
  const cookieStore = await cookies()
  cookieStore.delete({ name: 'sb-admin-token', path: '/admin' })
  redirect('/admin/login')
}

