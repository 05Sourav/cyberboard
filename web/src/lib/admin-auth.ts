import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function verifyAdminSession(): Promise<{ authorized: boolean; email?: string; error?: string }> {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  if (!adminEmail) {
    return { authorized: false, error: 'ADMIN_EMAIL is not set in environment' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('sb-admin-token')?.value
  if (!token) {
    return { authorized: false, error: 'Missing session' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!supabaseUrl || !anonKey) {
    return { authorized: false, error: 'Supabase URL/Key missing' }
  }

  try {
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    })
    const { data: { user }, error } = await client.auth.getUser(token)
    if (error || !user || !user.email) {
      return { authorized: false, error: 'Invalid or expired session token' }
    }

    if (user.email.toLowerCase().trim() !== adminEmail) {
      return { authorized: false, error: 'Unauthorized email' }
    }

    return { authorized: true, email: user.email }
  } catch (err: any) {
    return { authorized: false, error: err?.message || 'Verification failed' }
  }
}

