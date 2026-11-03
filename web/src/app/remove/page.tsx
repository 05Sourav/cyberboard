'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function RemovePage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    atsUrl: '',
    reason: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated removal request submission
    setSubmitted(true)
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
          Cyberboard indexes publicly accessible job boards (Greenhouse, Lever, Ashby) to connect security professionals with authentic hiring teams. If you are an authorized representative of an employer and wish to have your company and all open roles permanently removed, submit this request.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#EBF7F0] border border-[#BCE3CC] rounded-xl p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-[#0B7A4B] text-white flex items-center justify-center mx-auto mb-3 text-lg font-bold">
            ✓
          </div>
          <h2 className="text-[18px] font-bold text-[#0F1F2A]">Removal Request Received</h2>
          <p className="text-[14px] text-[#58697A] mt-1 max-w-md mx-auto">
            We will verify the email domain against your public company records and execute the removal within 24 business hours.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-[13px] text-[#1B4F8F] font-semibold hover:underline"
          >
            Return to homepage
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D8E0E6] rounded-xl p-6 sm:p-8 flex flex-col gap-5 shadow-xs"
        >
          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Company Name <span className="text-[#C2410C]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Synapse Cyber"
              className="w-full h-10 px-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Authorized Work Email <span className="text-[#C2410C]">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. legal@synapsecyber.io or hr@synapsecyber.io"
              className="w-full h-10 px-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
            <span className="text-[12px] text-[#58697A] mt-1 block">
              Requests must come from an official company email address matching the organization's domain.
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Careers / ATS Page URL
            </label>
            <input
              type="url"
              value={formData.atsUrl}
              onChange={(e) => setFormData({ ...formData, atsUrl: e.target.value })}
              placeholder="e.g. https://boards.greenhouse.io/synapsecyber"
              className="w-full h-10 px-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#0F1F2A] mb-1">
              Reason or Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Let us know if you'd like your roster permanently blacklisted from our sync pipeline."
              className="w-full p-3 border border-[#D8E0E6] rounded-[6px] text-[14px] text-[#0F1F2A] focus:outline-none focus:border-[#1B4F8F]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#D8E0E6]">
            <span className="font-mono text-[11px] text-[#58697A]">
              Processed within 24 hours of receipt
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1B4F8F] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#153e70] transition-colors shadow-xs"
            >
              Submit Removal Request
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
