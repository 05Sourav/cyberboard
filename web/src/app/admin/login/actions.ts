'use server'

import { createClient } from '@supabase/supabase-js'

const GENERIC_OK = 'If this email is authorized, a code has been sent.'

/**
 * Validates the submitted email against ADMIN_EMAIL before ever touching Supabase.
 * - If ADMIN_EMAIL is not configured → fail closed, log server error, return generic message.
 * - If submitted email doesn't match → return same generic message, send nothing.
 * - If email matches → send OTP via Supabase Auth.
 *
 * Returns `{ ok: boolean; message: string }`.
 * `ok` is always `true` from the client's perspective (generic response), but
 * internally `ok` is false when ADMIN_EMAIL is misconfigured so the caller can
 * decide whether to show the OTP step.
 */
export async function sendAdminOtp(
  submittedEmail: string,
  redirectTo: string
): Promise<{ ok: boolean; message: string }> {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()

  if (!adminEmail) {
    // Fail closed — log on server, return generic message to client
    console.error('[admin/login] ADMIN_EMAIL is not configured. OTP send aborted.')
    return { ok: false, message: GENERIC_OK }
  }

  const normalized = submittedEmail.toLowerCase().trim()

  // Guard: do not send anything for non-admin emails
  if (normalized !== adminEmail) {
    // No log here — don't leak whether the email was close
    return { ok: true, message: GENERIC_OK }
  }

  // Email matches — now invoke Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !anonKey) {
    console.error('[admin/login] Supabase URL or anon key missing.')
    return { ok: false, message: GENERIC_OK }
  }

  const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })

  const { error } = await client.auth.signInWithOtp({
    email: normalized,
    options: { emailRedirectTo: redirectTo },
  })

  if (error) {
    console.error('[admin/login] Supabase OTP error:', error.message)
    // Still return generic message — don't expose Supabase error details
    return { ok: false, message: 'Could not send login code. Please try again.' }
  }

  return { ok: true, message: GENERIC_OK }
}

