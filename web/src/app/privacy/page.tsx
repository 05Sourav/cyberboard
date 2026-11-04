import React from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 text-[#0F1F2A]">
      <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
        ← Back to jobs
      </Link>
      <h1 className="text-[32px] font-bold tracking-tight mt-3 mb-2">Privacy Policy</h1>
      <p className="text-[13px] font-mono text-[#58697A] mb-8">Last updated: November 1, 2026</p>

      <div className="prose prose-slate max-w-none text-[15px] leading-relaxed space-y-6">
        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">1. The Principle</h2>
          <p className="text-[#58697A]">
            Cyberboard is designed to respect the privacy of candidates and employers. We do not track your personal identity, sell candidate resumes to third parties, or run invasive ad retargeting pixels.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">2. Information We Collect</h2>
          <p className="text-[#58697A]">
            <strong>Public Job Postings:</strong> We fetch job listings made publicly available by employers via Greenhouse, Lever, and Ashby APIs. We do not scrape behind authentication walls.
          </p>
          <p className="text-[#58697A] mt-2">
            <strong>Aggregate Telemetry:</strong> When you click "Apply", our redirect router logs an anonymous counter (job id, timestamp, and referring country) so paying employers can receive accurate click reports. We do not store candidate IP addresses or identify candidates.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">3. Direct ATS Redirection</h2>
          <p className="text-[#58697A]">
            Candidates never submit resumes or personal information through Cyberboard. All applications occur directly on the employer's official Applicant Tracking System (ATS). Your relationship for the hiring process remains strictly between you and the employer.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">4. Removal & Inquiries</h2>
          <p className="text-[#58697A]">
            Any company may request to be permanently removed from Cyberboard at any time via our{' '}
            <Link href="/remove" className="text-[#1B4F8F] underline">
              removal form
            </Link>{' '}
            or by emailing <code>{siteConfig.emails.privacy}</code>.
          </p>
        </section>
      </div>
    </div>
  )
}
