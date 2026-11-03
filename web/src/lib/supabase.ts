import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

let _supabase: SupabaseClient | null = null

/** Browser-safe client (uses anon key, subject to RLS). */
export const supabase = (function getClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  }
  return _supabase
})()

/** Server-only client (uses service role, bypasses RLS). */
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}

/** Check if real Supabase environment variables are configured */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  )
}
