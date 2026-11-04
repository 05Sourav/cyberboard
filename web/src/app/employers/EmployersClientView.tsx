'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

interface Props {
  activeJobCount: number | null
  companyCount: number | null
}

export function EmployersClientView({ activeJobCount, companyCount }: Props) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FOUNDER99')
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(siteConfig.emails.employers)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="w-full bg-[#F3F6F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-12">
        {/* HERO SECTION */}
        <section className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 self-start px-2 py-1 bg-[#EBF0F5] rounded border border-[#D8E0E6]">
              <span className="w-2 h-2 rounded-full bg-[#005B36]" />
              <span className="font-mono text-[11px] text-[#58697A] uppercase tracking-wider font-semibold">
                Hiring Terminal // Employers
              </span>
            </div>
            <h1 className="text-[32px] sm:text-[42px] font-bold text-[#0F1F2A] tracking-tight leading-tight">
              Reach cybersecurity practitioners directly
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#58697A] leading-relaxed">
              Targeted distribution exclusively across cybersecurity engineering, SOC, cloud security, AppSec, GRC, and leadership talent.
            </p>
          </div>

          {/* Hero Telemetry Sub-bar - LIVE DATA ONLY */}
          {(activeJobCount !== null || companyCount !== null) && (
            <div className="w-full bg-white p-4 rounded-xl border border-[#D8E0E6] flex flex-wrap items-center gap-6 shadow-xs">
              {activeJobCount !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                    ◎
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[18px] text-[#0F1F2A] font-bold">
                      {activeJobCount.toLocaleString()}
                    </span>
                    <span className="text-[13px] text-[#58697A]">active verified roles</span>
                  </div>
                </div>
              )}
              {companyCount !== null && (
                <>
                  <div className="hidden sm:block text-[#D8E0E6] font-mono">/</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EBF7F0] text-[#0B7A4B] flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[18px] text-[#0F1F2A] font-bold">
                        {companyCount.toLocaleString()}
                      </span>
                      <span className="text-[13px] text-[#58697A]">employers with active roles</span>
                    </div>
                  </div>
                </>
              )}
              <div className="ml-auto hidden lg:flex items-center gap-2 text-[#58697A] font-mono text-[11px] bg-[#F3F6F8] px-2.5 py-1 rounded border border-[#D8E0E6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B7A4B]" />
                <span>ATS SYNC ACTIVE</span>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: HOW PLACEMENT WORKS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[12px] text-[#58697A] uppercase tracking-wider font-semibold">
              Placement Architecture & Fair Visibility
            </h2>
            <span className="font-mono text-[11px] text-[#58697A]">Verified Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                  🎯
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Targeted</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Focused exclusively on information security practitioners without generalist clutter.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Pure infosec audience
              </div>
            </div>

            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                  ⇄
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Fair Rotation</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  At most 3 pinned slots per page with rotation and one slot per employer.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Equal exposure
              </div>
            </div>

            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#FFF4EC] text-[#C2410C] flex items-center justify-center font-bold">
                  🏷️
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Clearly Labelled</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Distinctive styling for paid placements. Candidates know exactly what is organic and what is sponsored.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Transparent labeling
              </div>
            </div>

            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                  📊
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Weekly Telemetry</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Private weekly performance report with verified impressions and apply clicks.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Direct metrics
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: THREE-COLUMN PLAN COMPARISON (TASK 6 COMPLIANT) */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-[26px] font-bold text-[#0F1F2A] tracking-tight">
                Placement Options
              </h2>
              <p className="text-[14px] text-[#58697A] mt-0.5">
                Direct link-out to your official ATS application URL.
              </p>
            </div>
            <div className="font-mono text-[11px] text-[#58697A]">
              ALL LISTINGS LINK OUT DIRECTLY TO YOUR ATS
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* TIER 1: LISTED (FREE) */}
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:border-[#1B4F8F] transition-colors">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#58697A] font-semibold">
                    Standard
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F3F6F8] text-[#58697A] font-mono text-[11px]">
                    Organic
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F1F2A]">Listed</h3>
                  <p className="text-[13px] text-[#58697A] mt-1">
                    Standard organic listing for verified cybersecurity employers.
                  </p>
                </div>
                <div className="flex items-baseline gap-2 py-2">
                  <span className="font-mono text-3xl font-bold text-[#0F1F2A]">Free</span>
                </div>
                <div className="h-px w-full bg-[#D8E0E6]" />
                <ul className="flex flex-col gap-3 text-[13px] text-[#0F1F2A]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Appears in candidate search and filter feeds</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Indexed by role category, seniority, and country</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Direct link to your official ATS application page</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Synchronized daily from Greenhouse, Lever, or Ashby</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <a
                  href={`mailto:${siteConfig.emails.employers}?subject=Submit%20Free%20Role%20for%20Indexing`}
                  className="w-full h-10 px-4 rounded-[6px] bg-[#F3F6F8] hover:bg-[#EAEFF3] text-[#0F1F2A] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 border border-[#D8E0E6]"
                >
                  <span>Submit career board</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* TIER 2: FEATURED ($199 / 30 DAYS) */}
            <div className="bg-white border-2 border-[#C2410C] rounded-xl p-6 flex flex-col justify-between shadow-md relative bg-gradient-to-b from-[#FFF4EC]/40 to-white">
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-[#C2410C] text-white font-mono text-[11px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>POPULAR</span>
              </div>
              <div className="flex flex-col gap-5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C2410C] font-bold">
                    Priority Placement
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FFF4EC] text-[#C2410C] border border-[#FCD9BD] font-mono text-[11px] font-bold">
                    30 Days
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F1F2A]">Featured</h3>
                  <p className="text-[13px] text-[#58697A] mt-1">
                    Priority placement pinned at the top of matching candidate searches.
                  </p>
                </div>
                <div className="flex items-baseline gap-2 py-2">
                  <span className="font-mono text-3xl font-bold text-[#0F1F2A]">$199</span>
                  <span className="font-mono text-[13px] text-[#58697A]">/ 30 days</span>
                </div>
                <div className="h-px w-full bg-[#FCD9BD]" />
                <ul className="flex flex-col gap-3 text-[13px] text-[#0F1F2A]">
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Everything in Listed</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Pinned for matching candidate searches</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Clearly labelled with orange Featured badge</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Weekly report with views, apply clicks, and CTR</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Free re-post if no apply clicks within 14 days</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <a
                  href={`mailto:${siteConfig.emails.employers}?subject=Order%20Featured%20Placement%20($199)&body=Hi%20Cyberboard%2C%0A%0AWe%20would%20like%20to%20order%20a%20Featured%20placement%20for%3A%0A-%20Role%20Title%3A%20%0A-%20Company%20Name%3A%20%0A-%20Apply%20URL%3A%20%0A%0AThank%20you!`}
                  className="w-full h-10 px-4 rounded-[6px] bg-[#1B4F8F] hover:bg-[#153e70] text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Select Featured ($199)</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* TIER 3: FEATURED PLUS ($399 / 45 DAYS) */}
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:border-[#1B4F8F] transition-colors">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#58697A] font-semibold">
                    Multi-Role & Extended
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#EBF5FF] text-[#1B4F8F] font-mono text-[11px] font-bold">
                    45 Days
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F1F2A]">Featured Plus</h3>
                  <p className="text-[13px] text-[#58697A] mt-1">
                    Multi-channel reach for up to 3 roles with newsletter and social distribution.
                  </p>
                </div>
                <div className="flex items-baseline gap-2 py-2">
                  <span className="font-mono text-3xl font-bold text-[#0F1F2A]">$399</span>
                  <span className="font-mono text-[13px] text-[#58697A]">/ 45 days</span>
                </div>
                <div className="h-px w-full bg-[#D8E0E6]" />
                <ul className="flex flex-col gap-3 text-[13px] text-[#0F1F2A]">
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Everything in Featured for up to 3 roles</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Extended 45-day placement window</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Newsletter feature slot in candidate digest</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Social distribution broadcast</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <a
                  href={`mailto:${siteConfig.emails.employers}?subject=Order%20Featured%20Plus%20Package%20($399)&body=Hi%20Cyberboard%2C%0A%0AWe%20would%20like%20to%20order%20Featured%20Plus%20for%20our%20roles%3A%0A-%20Company%20Name%3A%20%0A-%20Role%201%20Apply%20URL%3A%20%0A-%20Role%202%20Apply%20URL%20(optional)%3A%20%0A-%20Role%203%20Apply%20URL%20(optional)%3A%20%0A%0AThank%20you!`}
                  className="w-full h-10 px-4 rounded-[6px] bg-[#F3F6F8] hover:bg-[#EAEFF3] text-[#0F1F2A] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 border border-[#D8E0E6]"
                >
                  <span>Select Featured Plus ($399)</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FOUNDING EMPLOYER OFFER (TASK 6 COMPLIANT) */}
        <section>
          <div className="w-full bg-[#FFF4EC] border border-[#FCD9BD] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded bg-[#FCD9BD] flex items-center justify-center text-[#C2410C] font-bold shrink-0 mt-0.5">
                ★
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] text-[#0F1F2A] font-bold">
                    Founding Employer Offer: $99 for the first 10 employers
                  </span>
                  <span className="font-mono text-[11px] bg-white border border-[#FCD9BD] text-[#C2410C] px-2 py-0.5 rounded font-bold">
                    Limited Introductory Offer
                  </span>
                </div>
                <p className="text-[13px] text-[#58697A]">
                  Receive full Featured placement for 30 days and lock in the $99 rate for your organization's next role listing.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={handleCopyCode}
                className="font-mono text-[12px] px-3.5 py-2 bg-white text-[#C2410C] border border-[#FCD9BD] rounded hover:bg-[#FFF4EC] transition-colors font-bold shadow-2xs"
              >
                {copiedCode ? 'COPIED!' : 'USE CODE: FOUNDER99'}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: CONTACT DESK */}
        <section className="pb-6">
          <div className="w-full bg-white border border-[#D8E0E6] p-6 sm:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="flex flex-col gap-2 max-w-xl">
              <h3 className="text-[18px] font-semibold text-[#0F1F2A]">
                Custom invoicing or annual packages?
              </h3>
              <p className="text-[14px] text-[#58697A]">
                We support purchase orders, annual packages, and invoicing for hiring teams. Contact our desk directly.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="font-mono text-[14px] text-[#1B4F8F] font-semibold select-all">
                  {siteConfig.emails.employers}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F3F6F8] hover:bg-[#EAEFF3] font-mono text-[11px] text-[#0F1F2A] border border-[#D8E0E6] transition-colors"
                >
                  <span>{copiedEmail ? 'Copied!' : 'Copy address'}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <Link
                href="/remove"
                className="text-[14px] text-[#58697A] hover:text-[#0F1F2A] underline underline-offset-4"
              >
                Employer policy & removal
              </Link>
              <a
                href={`mailto:${siteConfig.emails.employers}?subject=Inquiry%20from%20Employer`}
                className="h-10 px-5 rounded-[6px] bg-[#1B4F8F] hover:bg-[#153e70] text-white text-[14px] font-medium transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Contact Desk</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

