import React from 'react'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function EmployerReportPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Mock report telemetry data matching Section 9.3 of Implementation Plan
  const report = {
    roleTitle: 'Staff Cloud Security Architect',
    companyName: 'Synapse Cyber',
    tier: 'Featured Plus',
    startsAt: '2026-10-01',
    endsAt: '2026-11-15',
    daysRemaining: 14,
    views: 1840,
    applyClicks: 142,
    ctr: '7.7%',
    benchmarkCtr: '3.2%',
    active: true,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-8">
      <div>
        <Link href="/" className="text-[13px] text-[#1B4F8F] hover:underline font-mono">
          ← Cyberboard
        </Link>
        <div className="flex items-center gap-3 mt-3">
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FFF4EC] text-[#C2410C] font-bold uppercase border border-[#FCD9BD]">
            {report.tier} Placement Telemetry
          </span>
          <span className="text-[12px] text-[#58697A] font-mono">Token: {token}</span>
        </div>
        <h1 className="text-[28px] font-bold text-[#0F1F2A] mt-2">{report.roleTitle}</h1>
        <p className="text-[14px] text-[#58697A]">
          Employer: <strong className="text-[#0F1F2A]">{report.companyName}</strong> · Window: {report.startsAt} to {report.endsAt}
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl shadow-xs">
          <div className="text-[12px] font-mono uppercase text-[#58697A] font-semibold">Total Feed Impressions</div>
          <div className="text-[28px] font-bold text-[#0F1F2A] font-mono mt-1">{report.views.toLocaleString()}</div>
          <div className="text-[11px] text-[#0B7A4B] mt-1 font-mono">Verified candidate views</div>
        </div>

        <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl shadow-xs">
          <div className="text-[12px] font-mono uppercase text-[#58697A] font-semibold">Direct Apply Clicks</div>
          <div className="text-[28px] font-bold text-[#1B4F8F] font-mono mt-1">{report.applyClicks}</div>
          <div className="text-[11px] text-[#58697A] mt-1 font-mono">Redirects to your ATS</div>
        </div>

        <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl shadow-xs">
          <div className="text-[12px] font-mono uppercase text-[#58697A] font-semibold">Click-Through Rate</div>
          <div className="text-[28px] font-bold text-[#0B7A4B] font-mono mt-1">{report.ctr}</div>
          <div className="text-[11px] text-[#58697A] mt-1 font-mono">Benchmark: {report.benchmarkCtr} (2.4x higher)</div>
        </div>

        <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl shadow-xs">
          <div className="text-[12px] font-mono uppercase text-[#58697A] font-semibold">Days Remaining</div>
          <div className="text-[28px] font-bold text-[#0F1F2A] font-mono mt-1">{report.daysRemaining}</div>
          <div className="text-[11px] text-[#0B7A4B] mt-1 font-mono">Placement Active</div>
        </div>
      </div>

      {/* Freshness & Policy Guarantee */}
      <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 shadow-xs flex flex-col gap-3">
        <h3 className="text-[16px] font-semibold text-[#0F1F2A]">Placement Integrity Guarantee</h3>
        <p className="text-[13.5px] text-[#58697A] leading-relaxed">
          Your promotion is pinned to the top 3 slots for candidates searching in matching roles and regions, rotating with equal weight among paid sponsors. When your job is closed on your ATS, our daily sync automatically pauses the promotion and notifies your hiring team.
        </p>
        <div className="pt-2 flex items-center justify-between border-t border-[#D8E0E6]/50">
          <span className="font-mono text-[11px] text-[#58697A]">Need an extension or role swap?</span>
          <a
            href="mailto:employers@cyberboard.dev?subject=Assistance%20with%20Promotion%20Report"
            className="text-[13px] font-semibold text-[#1B4F8F] hover:underline"
          >
            Contact Placement Desk →
          </a>
        </div>
      </div>
    </div>
  )
}
