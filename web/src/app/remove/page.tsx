'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { submitRemovalRequestAction } from './actions'

export default function RemovePage() {
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await submitRemovalRequestAction(formData)
      if (res.success) {
        setSubmitted(true)
      } else {
        setErrorMsg(res.error || 'Failed to submit request.')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
          ← Back to jobs
        </Link>
        <h1 className="text-[28px] font-bold text-[#0F1F2A] tracking-tight mt-3">
          Company Removal Request
        </h1>
        <p className="text-[15px] text-[#58697A] mt-2 leading-relaxed">
          Cyberboard indexes publicly accessible job boards (Greenhouse, Lever, Ashby) to connect security professionals with authentic hiring teams. If you are an authorized representative of an employer and wish to have your company and open roles permanently removed, submit this request.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#EBF7F0] border border-[#BCE3CC] rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#0B7A4B] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
            ✓
          </div>
          <h2 className="text-[20px] font-bold text-[#0F1F2A]">Removal Request Logged</h2>
          <p className="text-[14px] text-[#58697A] mt-2 max-w-md mx-auto leading-relaxed">
            Your request has been recorded. We will verify the contact address against your company domain and process the removal within 24 business hours.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-4 py-2 bg-[#1B4F8F] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#153e70]"
          >
            Return to Homepage
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D8E0E6] rounded-xl p-6 sm:p-8 flex flex-col gap-5 shadow-xs"
        >
          {/* Honeypot field for anti-bot protection */}
          <input
            type="text"
            name="hp_field"
            aria-hidden="true"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {errorMsg && (
            <div className="p-3 bg-[#FDF2F2] border border-[#F87171] text-[#991B1B] text-[13px] rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Company Name <span className="text-[#C2410C]">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              required
              placeholder="e.g. Acme Security"
              className="w-full h-10 px-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Authorized Work Email <span className="text-[#C2410C]">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. legal@acmesecurity.com or hr@acmesecurity.com"
              className="w-full h-10 px-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
            <span className="text-[12px] text-[#58697A] mt-1 block">
              Requests must come from an official company email address matching the organization's domain.
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Reason or Additional Notes (Optional)
            </label>
            <textarea
              name="message"
              rows={3}
              placeholder="Optional context or instructions."
              className="w-full p-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#D8E0E6]">
            <span className="font-mono text-[11px] text-[#58697A]">
              Processed within 24 hours of receipt
            </span>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-[#1B4F8F] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#153e70] transition-colors shadow-xs disabled:opacity-60"
            >
              {isPending ? 'Submitting...' : 'Submit Removal Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
