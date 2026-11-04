import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json()
    if (!access_token) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 })
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
    if (!adminEmail) {
      return NextResponse.json({ error: 'ADMIN_EMAIL is not configured on server' }, { status: 500 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })

    const { data: { user }, error } = await client.auth.getUser(access_token)
    if (error || !user || !user.email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    if (user.email.toLowerCase().trim() !== adminEmail) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    const res = NextResponse.json({ success: true, email: user.email })
    res.cookies.set('sb-admin-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete({ name: 'sb-admin-token', path: '/admin' })
  return res
}

