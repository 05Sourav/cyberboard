import React from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 text-[#0F1F2A]">
      <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
        ← Back to jobs
      </Link>
      <h1 className="text-[32px] font-bold tracking-tight mt-3 mb-2">Terms of Service</h1>
      <p className="text-[13px] font-mono text-[#58697A] mb-8">Last updated: November 1, 2026</p>

      <div className="prose prose-slate max-w-none text-[15px] leading-relaxed space-y-6">
        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">1. Acceptance of Terms</h2>
          <p className="text-[#58697A]">
            By accessing or using Cyberboard, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">2. For Job Seekers</h2>
          <p className="text-[#58697A]">
            Cyberboard is completely free for candidates. We do not charge fees, require registration, or intermediate communications with hiring teams. We make best efforts to verify that listings are active, but cannot guarantee that an employer has not filled a role ahead of their ATS update cycle.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">3. For Employers</h2>
          <p className="text-[#58697A]">
            Featured placements remain active for their stated term (30 days or 45 days). We guarantee genuine candidate exposure and weekly delivery of unadulterated click metrics. Refund requests are evaluated on a case-by-case basis if an unexpected service interruption occurs.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold text-[#0F1F2A] mb-2">4. Contact Information</h2>
          <p className="text-[#58697A]">
            For legal and contractual notices, contact <code>{siteConfig.emails.legal}</code>.
          </p>
        </section>
      </div>
    </div>
  )
}
