'use server'

import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase'

// In-memory rate limiter: IP -> timestamps of requests (last 10 minutes)
const ipRateMap = new Map<string, number[]>()

export async function submitRemovalRequestAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  // 1. Honeypot check
  const honeypot = formData.get('hp_field')?.toString()
  if (honeypot) {
    // Silently return success to bot without inserting
    return { success: true }
  }

  // 2. Extract fields
  const companyName = formData.get('companyName')?.toString()?.trim() || ''
  const email = formData.get('email')?.toString()?.trim() || ''
  const message = formData.get('message')?.toString()?.trim() || ''

  // 3. Validation
  if (!companyName || companyName.length < 2) {
    return { success: false, error: 'Please enter a valid company name.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid contact email address.' }
  }

  // 4. In-memory IP rate limit (max 5 requests per 10 mins) - IP is never stored in DB
  const headerList = await headers()
  const rawIp = headerList.get('x-forwarded-for') || headerList.get('cf-connecting-ip') || 'unknown'
  const ip = rawIp.split(',')[0].trim()

  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const timestamps = (ipRateMap.get(ip) || []).filter((t) => now - t < windowMs)

  if (timestamps.length >= 5) {
    return {
      success: false,
      error: 'Too many requests from this location. Please try again in a few minutes or email contact directly.',
    }
  }

  timestamps.push(now)
  ipRateMap.set(ip, timestamps)

  // 5. Insert into Supabase removal_requests using service role client
  try {
    const supabase = createServerClient()
    const { error: dbError } = await supabase.from('removal_requests').insert({
      company_name: companyName,
      contact_email: email.toLowerCase(),
      message: message || null,
      status: 'open',
    })

    if (dbError) {
      console.error('Failed to insert removal request:', dbError)
      return { success: false, error: 'Database error while saving request. Please try again.' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Removal request error:', err)
    return { success: false, error: err?.message || 'Server error. Please try again.' }
  }
}

