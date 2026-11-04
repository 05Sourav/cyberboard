'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sendAdminOtp } from './actions'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null)

  // Listen for hash fragment or auth state change (e.g. if user clicks magic link directly)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        setLoading(true)
        setMessage({ text: 'Authenticating admin session...', type: 'info' })
        try {
          const res = await fetch('/api/admin/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token }),
          })
          const data = await res.json()
          if (!res.ok) {
            setMessage({ text: data.error || 'Access denied', type: 'error' })
            await supabase.auth.signOut()
          } else {
            router.replace('/admin')
          }
        } catch (e: unknown) {
          setMessage({ text: (e as Error)?.message || 'Login error', type: 'error' })
        } finally {
          setLoading(false)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setMessage(null)

    try {
      const redirectUrl = `${window.location.origin}/admin/login`
      // Server action validates email against ADMIN_EMAIL before calling Supabase
      const result = await sendAdminOtp(email.trim(), redirectUrl)

      // Always advance to OTP step and show generic message regardless of whether the
      // email matched — this prevents an attacker from learning the admin address.
      setStep('otp')
      setMessage({
        text: result.message,
        type: 'success',
      })
    } catch (err: unknown) {
      setMessage({ text: (err as Error)?.message || 'Failed to send login code', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      })

      if (error || !data.session) {
        setMessage({ text: error?.message || 'Invalid or expired OTP', type: 'error' })
      } else {
        const res = await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: data.session.access_token }),
        })
        const resData = await res.json()
        if (!res.ok) {
          setMessage({ text: resData.error || 'Access denied', type: 'error' })
          await supabase.auth.signOut()
        } else {
          router.replace('/admin')
        }
      }
    } catch (err: unknown) {
      setMessage({ text: (err as Error)?.message || 'Verification failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#D8E0E6] rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#1B4F8F]" />
          <span className="font-mono text-[11px] text-[#58697A] uppercase tracking-wider font-semibold">
            Restricted Console
          </span>
        </div>
        <h1 className="text-[22px] font-bold text-[#0F1F2A] mb-2">Admin Sign In</h1>
        <p className="text-[13px] text-[#58697A] mb-6">
          Access is strictly restricted to authorized administrative emails via one-time magic link or OTP.
        </p>

        {message && (
          <div
            className={`p-3.5 rounded-lg text-[13px] mb-5 ${
              message.type === 'error'
                ? 'bg-[#FDF2F2] text-[#991B1B] border border-[#F87171]'
                : message.type === 'success'
                ? 'bg-[#EBF7F0] text-[#065F46] border border-[#34D399]'
                : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#60A5FA]'
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#D8E0E6] rounded-lg focus:outline-none focus:border-[#1B4F8F]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1B4F8F] text-white rounded-lg text-[14px] font-medium hover:bg-[#153e70] transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending code...' : 'Send Magic Link / OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 text-[16px] tracking-widest text-center font-mono border border-[#D8E0E6] rounded-lg focus:outline-none focus:border-[#1B4F8F]"
              />
              <p className="text-[12px] text-[#58697A] mt-1.5">
                Check your inbox — a code was sent if this address is authorized.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1B4F8F] text-white rounded-lg text-[14px] font-medium hover:bg-[#153e70] transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Console'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtp('')
                setMessage(null)
              }}
              className="w-full text-center text-[12px] text-[#58697A] hover:underline pt-2"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
