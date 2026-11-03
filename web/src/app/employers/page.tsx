'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function EmployersPage() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FOUNDER99')
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('employers@cyberboard.dev')
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
              Reach security people who are looking
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#58697A] leading-relaxed">
              Targeted distribution to 14,000+ active cybersecurity engineers, analysts, and leaders. No recruiter spam, no inflated metrics.
            </p>
          </div>

          {/* Hero Telemetry / Key Stats Sub-bar */}
          <div className="w-full bg-white p-4 rounded-xl border border-[#D8E0E6] flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                ◎
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[18px] text-[#0F1F2A] font-bold">1,284</span>
                <span className="text-[13px] text-[#58697A]">open verified roles</span>
              </div>
            </div>
            <div className="hidden sm:block text-[#D8E0E6] font-mono">/</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EBF7F0] text-[#0B7A4B] flex items-center justify-center font-bold">
                ⚡
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[18px] text-[#0B7A4B] font-bold">4.2 days</span>
                <span className="text-[13px] text-[#58697A]">avg time to first interview</span>
              </div>
            </div>
            <div className="hidden sm:block text-[#D8E0E6] font-mono">/</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF4EC] text-[#C2410C] flex items-center justify-center font-bold">
                ✓
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[18px] text-[#0F1F2A] font-bold">96</span>
                <span className="text-[13px] text-[#58697A]">verified security teams</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[#58697A] font-mono text-[11px] bg-[#F3F6F8] px-2.5 py-1 rounded border border-[#D8E0E6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B7A4B]" />
              <span>ATS SYNC ACTIVE</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW PLACEMENT WORKS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[12px] text-[#58697A] uppercase tracking-wider font-semibold">
              Placement Architecture & Signal Integrity
            </h2>
            <span className="font-mono text-[11px] text-[#58697A]">v2.4 protocol</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs hover:border-[#1B4F8F] transition-colors">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                  🎯
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Targeted</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Distributed exclusively across security engineering, SOC/IR, AppSec, cloud, and GRC talent channels.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Zero generalist noise
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs hover:border-[#1B4F8F] transition-colors">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                  ⇄
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Fair rotation</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Algorithmic round-robin placement so early posts aren't buried by high-volume corporate scrapers.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Anti-monopoly queue
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs hover:border-[#C2410C] transition-colors">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#FFF4EC] text-[#C2410C] flex items-center justify-center font-bold">
                  🏷️
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">Clearly labelled</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Dedicated orange signals for paid posts. Candidates know exactly what's organic and what's sponsored.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Trust-first UX
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl flex flex-col justify-between gap-4 shadow-xs hover:border-[#1B4F8F] transition-colors">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF5FF] text-[#1B4F8F] flex items-center justify-center font-bold">
                  📊
                </div>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">You get the numbers</h3>
                <p className="text-[13px] text-[#58697A] leading-normal">
                  Transparent weekly reports with exact views, apply clicks, and CTR benchmarks against similar roles.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#58697A] pt-2 border-t border-[#D8E0E6]/50">
                Uncut telemetry data
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: THREE-COLUMN PLAN COMPARISON */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-[26px] font-bold text-[#0F1F2A] tracking-tight">
                Transparent placement tiers
              </h2>
              <p className="text-[14px] text-[#58697A] mt-0.5">
                Simple flat fees. No recurring locks, no upsells.
              </p>
            </div>
            <div className="font-mono text-[11px] text-[#58697A]">
              ALL PLANS INCLUDE ATS DIRECT REDIRECT
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* PLAN 1: LISTED (FREE) */}
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#58697A] font-semibold">
                    Tier 01
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F3F6F8] text-[#58697A] font-mono text-[11px]">
                    Organic
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F1F2A]">Listed</h3>
                  <p className="text-[13px] text-[#58697A] mt-1">
                    Standard organic listing for verified cybersecurity teams.
                  </p>
                </div>
                <div className="flex items-baseline gap-2 py-2">
                  <span className="font-mono text-3xl font-bold text-[#0F1F2A]">$0</span>
                  <span className="font-mono text-[13px] text-[#58697A]">/ 30 days</span>
                </div>
                <div className="h-px w-full bg-[#D8E0E6]" />
                <ul className="flex flex-col gap-3 text-[13px] text-[#0F1F2A]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Standard job listing for 30 days</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Indexed in search & location filters</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Basic click tracking telemetry</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Direct link to your ATS / application URL</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0B7A4B] font-bold">✓</span>
                    <span>Removed within 24h of employer removal</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <button
                  onClick={() => alert('Free organic listings are verified automatically via your public ATS, or submit via employers@cyberboard.dev')}
                  className="w-full h-10 px-4 rounded-[6px] bg-[#F3F6F8] hover:bg-[#EAEFF3] text-[#0F1F2A] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 border border-[#D8E0E6]"
                >
                  <span>Post free role</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* PLAN 2: FEATURED ($199 / 30 DAYS) - MOST POPULAR */}
            <div className="bg-white border-2 border-[#C2410C] rounded-xl p-6 flex flex-col justify-between shadow-md relative bg-gradient-to-b from-[#FFF4EC]/40 to-white">
              {/* Top Badge */}
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-[#C2410C] text-white font-mono text-[11px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>MOST POPULAR</span>
              </div>
              <div className="flex flex-col gap-5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C2410C] font-bold">
                    Tier 02 // Accelerated
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FFF4EC] text-[#C2410C] border border-[#FCD9BD] font-mono text-[11px] font-bold">
                    3.8x View Rate
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F1F2A]">Featured</h3>
                  <p className="text-[13px] text-[#58697A] mt-1">
                    Priority placement with high signal visibility across candidate feeds.
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
                    <span>Pinned to top "Featured Roles" section</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Distinctive orange signal badge & tinted row highlight</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>
                      Included in weekly cybersecurity email digest{' '}
                      <span className="font-mono text-[#58697A]">(9,200 subs)</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Private weekly analytics report & benchmark rank</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#C2410C] font-bold">✓</span>
                    <span>Social blast to @cyberboard_jobs</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <a
                  href="mailto:employers@cyberboard.dev?subject=Order%20Featured%20Role%20($199)&body=Hi%20Cyberboard%2C%0A%0AWe%20would%20like%20to%20order%20a%20Featured%20placement%20for%20our%20role%3A%0A-%20Role%20Title%3A%20%0A-%20Company%20Name%3A%20%0A-%20Apply%20URL%3A%20%0A-%20Promo%20code%20(if%20any)%3A%20FOUNDER99%0A%0AThanks!"
                  className="w-full h-10 px-4 rounded-[6px] bg-[#1B4F8F] hover:bg-[#153e70] text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Choose Featured ($199)</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* PLAN 3: FEATURED PLUS ($399 / 45 DAYS) */}
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#58697A] font-semibold">
                    Tier 03
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#EBF5FF] text-[#1B4F8F] font-mono text-[11px] font-bold">
                    Executive & Staff
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F1F2A]">Featured Plus</h3>
                  <p className="text-[13px] text-[#58697A] mt-1">
                    Maximum reach for hard-to-fill senior, staff, and leadership security roles.
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
                    <span>Everything in Featured</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Extended 45-day active placement window</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>
                      Permanent pinned slot in category rail{' '}
                      <span className="font-mono text-[#58697A]">(AppSec/Cloud)</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Dedicated standalone feature in bi-weekly newsletter</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Retargeting alert to matching candidate watchlists</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1B4F8F] font-bold">✓</span>
                    <span>Priority employer support & ATS webhook integration</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <a
                  href="mailto:employers@cyberboard.dev?subject=Order%20Featured%20Plus%20Role%20($399)&body=Hi%20Cyberboard%2C%0A%0AWe%20would%20like%20to%20order%20a%20Featured%20Plus%20placement%20for%3A%0A-%20Role%20Title%3A%20%0A-%20Company%20Name%3A%20%0A-%20Apply%20URL%3A%20%0A%0AThanks!"
                  className="w-full h-10 px-4 rounded-[6px] bg-[#F3F6F8] hover:bg-[#EAEFF3] text-[#0F1F2A] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 border border-[#D8E0E6]"
                >
                  <span>Choose Featured Plus ($399)</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FOUNDING EMPLOYER OFFER BANNER */}
        <section>
          <div className="w-full bg-[#FFF4EC] border border-[#FCD9BD] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#FCD9BD] flex items-center justify-center text-[#C2410C] font-bold shrink-0">
                ★
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-[14px] text-[#0F1F2A] font-semibold">
                  Founding employer offer: first 10 employers get Featured for $99.
                </span>
                <span className="font-mono text-[11px] bg-white border border-[#FCD9BD] text-[#C2410C] px-2 py-0.5 rounded font-bold self-start sm:self-auto">
                  [4 slots remaining]
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="font-mono text-[12px] px-3.5 py-1.5 bg-white text-[#C2410C] border border-[#FCD9BD] rounded hover:bg-[#FFF4EC] transition-colors font-bold shadow-2xs"
              >
                {copiedCode ? 'COPIED!' : 'USE CODE: FOUNDER99'}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: LIVE PREVIEW SECTION */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#58697A] uppercase tracking-wider font-semibold">
                Feed Simulator
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4F8F]" />
            </div>
            <h2 className="text-[26px] font-bold text-[#0F1F2A] tracking-tight">
              Live preview
            </h2>
            <p className="text-[14px] text-[#58697A]">
              How your role renders in candidate search results
            </p>
          </div>

          {/* Simulator Box */}
          <div className="w-full bg-white border border-[#D8E0E6] p-4 sm:p-6 rounded-xl flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between text-[#58697A] font-mono text-[11px] pb-1 border-b border-[#D8E0E6]/50">
              <span>FEED QUERY: ROLE=ENGINEERING LOCATION=ALL LEVEL=SENIOR+</span>
              <span>RESULTS: 2 ITEMS</span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Featured Simulation Row */}
              <div className="bg-[#FFF4EC] border border-[#C2410C] rounded-[6px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[6px] bg-[#13212B] flex items-center justify-center shrink-0 text-white font-mono font-bold text-[14px]">
                    SY
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[16px] font-semibold text-[#0F1F2A]">
                        Staff Cloud Security Architect
                      </h3>
                    </div>
                    <div className="text-[14px] text-[#58697A] mt-0.5">
                      Synapse Cyber <span className="mx-1 text-[#D8E0E6]">·</span> Bengaluru (Hybrid)
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-[#0F1F2A] border border-[#D8E0E6]">
                        Cloud Security
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-[#0F1F2A] border border-[#D8E0E6]">
                        Hybrid
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-[#0F1F2A] border border-[#D8E0E6]">
                        Senior
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EBF7F0] text-[#0B7A4B] border border-[#BCE3CC] font-semibold">
                        $165k – 205k
                      </span>
                      <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-[#FFF4EC] text-[#C2410C] border border-[#FCD9BD] font-semibold uppercase">
                        FEATURED
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#FCD9BD]">
                  <span className="font-mono text-[12px] text-[#58697A]">Today</span>
                  <button className="bg-[#1B4F8F] text-white px-4 py-2 rounded-[4px] text-[14px] font-medium">
                    Apply
                  </button>
                </div>
              </div>

              {/* Standard Simulation Row */}
              <div className="bg-white border border-[#D8E0E6] rounded-[6px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[6px] bg-[#1E293B] flex items-center justify-center shrink-0 text-white font-mono font-bold text-[13px]">
                    CL
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#0F1F2A]">
                      Senior Detection Engineer
                    </h3>
                    <div className="text-[14px] text-[#58697A] mt-0.5">
                      CrowdLogic <span className="mx-1 text-[#D8E0E6]">·</span> Hyderabad (Hybrid)
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#0F1F2A]">
                        SOC & IR
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#0F1F2A]">
                        Hybrid
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#0F1F2A]">
                        Senior
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EBF7F0] text-[#0B7A4B] border border-[#BCE3CC] font-semibold">
                        $140k – 180k
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8E0E6]">
                  <span className="font-mono text-[12px] text-[#58697A]">2 days ago</span>
                  <button className="bg-[#1B4F8F] text-white px-4 py-2 rounded-[4px] text-[14px] font-medium">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CONTACT & QUESTIONS CARD */}
        <section className="pb-6">
          <div className="w-full bg-white border border-[#D8E0E6] p-6 sm:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="flex items-center gap-2 text-[#1B4F8F]">
                <span className="text-[20px]">💬</span>
                <h3 className="text-[18px] font-semibold text-[#0F1F2A]">
                  Questions or custom invoicing?
                </h3>
              </div>
              <p className="text-[14px] text-[#58697A]">
                We support purchase orders, annual bulk packages, and invoicing for enterprise teams. No automated sales calls—talk directly with engineering.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="font-mono text-[14px] text-[#1B4F8F] font-semibold select-all">
                  employers@cyberboard.dev
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
                href="mailto:employers@cyberboard.dev?subject=Inquiry%20from%20Employer"
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
