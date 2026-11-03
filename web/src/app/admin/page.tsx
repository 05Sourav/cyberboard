'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'promotions' | 'removals'>('dashboard')

  // Sample data for admin controls
  const [companies, setCompanies] = useState([
    { id: '1', name: 'Synapse Cyber', slug: 'synapse-cyber', ats: 'ashby', blocked: false, jobCount: 4 },
    { id: '2', name: 'CrowdLogic', slug: 'crowdlogic', ats: 'greenhouse', blocked: false, jobCount: 6 },
    { id: '3', name: 'Nexor Labs', slug: 'nexor-labs', ats: 'lever', blocked: false, jobCount: 3 },
    { id: '4', name: 'BreachVector', slug: 'breachvector', ats: 'lever', blocked: false, jobCount: 2 },
  ])

  const [promotions, setPromotions] = useState([
    {
      id: 'p1',
      company: 'Synapse Cyber',
      role: 'Staff Cloud Security Architect',
      tier: 'featured_plus',
      highlight: true,
      clicks: 142,
      endsAt: '2026-11-15',
    },
    {
      id: 'p2',
      company: 'Nexor Labs',
      role: 'Lead Threat Intelligence Researcher',
      tier: 'featured',
      highlight: false,
      clicks: 88,
      endsAt: '2026-11-15',
    },
  ])

  const [removals, setRemovals] = useState([
    {
      id: 'r1',
      company: 'Acme Security Corp',
      email: 'hr@acmesecurity.com',
      date: '2026-11-01',
      status: 'pending',
    },
  ])

  const toggleCompanyBlock = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c))
    )
  }

  const blockAndApproveRemoval = (removalId: string, companyName: string) => {
    setRemovals((prev) => prev.filter((r) => r.id !== removalId))
    alert(`Company "${companyName}" has been blocked and will never be scraped again.`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8E0E6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1E293B] text-white font-bold uppercase">
              Admin Terminal
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0B7A4B]" />
            <span className="text-[12px] font-mono text-[#58697A]">Pipeline synced 42m ago</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#0F1F2A] mt-1">Cyberboard Operations</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[13px] px-3.5 py-1.5 bg-white border border-[#D8E0E6] rounded-[6px] text-[#0F1F2A] hover:bg-[#F3F6F8] font-medium"
          >
            View Live Site ↗
          </Link>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8E0E6] pb-px">
        {[
          { key: 'dashboard', label: 'Overview & Telemetry' },
          { key: 'companies', label: 'Company Roster' },
          { key: 'promotions', label: 'Promotions & Placements' },
          { key: 'removals', label: 'Removal Requests (1)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-[13.5px] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#1B4F8F] text-[#1B4F8F] font-semibold'
                : 'border-transparent text-[#58697A] hover:text-[#0F1F2A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl">
              <span className="font-mono text-[11px] uppercase text-[#58697A] font-semibold">Active Jobs</span>
              <div className="text-[26px] font-bold text-[#0F1F2A] font-mono mt-1">1,284</div>
              <div className="text-[11px] text-[#0B7A4B] font-mono mt-1">96 verified companies</div>
            </div>

            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl">
              <span className="font-mono text-[11px] uppercase text-[#58697A] font-semibold">Apply Clicks (7d)</span>
              <div className="text-[26px] font-bold text-[#1B4F8F] font-mono mt-1">3,492</div>
              <div className="text-[11px] text-[#0B7A4B] font-mono mt-1">+14.2% week-on-week</div>
            </div>

            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl">
              <span className="font-mono text-[11px] uppercase text-[#58697A] font-semibold">Active Promotions</span>
              <div className="text-[26px] font-bold text-[#C2410C] font-mono mt-1">2 Paid Roles</div>
              <div className="text-[11px] text-[#58697A] font-mono mt-1">$598 MRR equivalent</div>
            </div>

            <div className="bg-white border border-[#D8E0E6] p-5 rounded-xl">
              <span className="font-mono text-[11px] uppercase text-[#58697A] font-semibold">Pipeline Health</span>
              <div className="text-[26px] font-bold text-[#0B7A4B] font-mono mt-1">100% Green</div>
              <div className="text-[11px] text-[#58697A] font-mono mt-1">0 failing slugs</div>
            </div>
          </div>

          <div className="bg-white border border-[#D8E0E6] rounded-xl p-6 shadow-xs">
            <h3 className="text-[16px] font-semibold text-[#0F1F2A] mb-3">Pipeline Ingestion Summary</h3>
            <div className="font-mono text-[12px] bg-[#0F1F2A] text-[#daeafa] p-4 rounded-[6px] overflow-x-auto leading-relaxed">
              [2026-11-01 23:30:12] Ingested 50 companies across Greenhouse (28), Lever (14), Ashby (8)<br />
              [2026-11-01 23:30:19] Parsed 2,840 raw jobs &rarr; 1,284 cybersecurity roles after whitelist filtering<br />
              [2026-11-01 23:30:24] Enriched 1,284 roles with categories, seniority levels, work modes, and country bounds<br />
              [2026-11-01 23:30:28] Upserted 1,284 active jobs into Supabase `jobs` table. 0 errors.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="bg-white border border-[#D8E0E6] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#D8E0E6] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F1F2A]">Managed Employers Roster</h3>
            <button
              onClick={() => alert('Add to pipeline/roster/companies.json or via admin API')}
              className="px-3 py-1.5 bg-[#1B4F8F] text-white rounded text-[13px] font-medium"
            >
              + Add Employer
            </button>
          </div>
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[#F3F6F8] font-mono text-[11px] uppercase text-[#58697A] border-b border-[#D8E0E6]">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">ATS</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Active Roles</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E0E6]">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-[#F3F6F8]/50">
                  <td className="p-3 font-medium text-[#0F1F2A]">{c.name}</td>
                  <td className="p-3 font-mono text-[12px] uppercase">{c.ats}</td>
                  <td className="p-3 font-mono text-[12px] text-[#58697A]">{c.slug}</td>
                  <td className="p-3 font-mono text-[#0F1F2A]">{c.jobCount}</td>
                  <td className="p-3">
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                        c.blocked
                          ? 'bg-[#FFDAD6] text-[#93000A]'
                          : 'bg-[#EBF7F0] text-[#0B7A4B]'
                      }`}
                    >
                      {c.blocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleCompanyBlock(c.id)}
                      className={`text-[12px] font-medium hover:underline ${
                        c.blocked ? 'text-[#0B7A4B]' : 'text-[#BA1A1A]'
                      }`}
                    >
                      {c.blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PROMOTIONS */}
      {activeTab === 'promotions' && (
        <div className="bg-white border border-[#D8E0E6] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#D8E0E6] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F1F2A]">Active Sponsored Placements</h3>
            <button
              onClick={() => alert('Create new promotion modal')}
              className="px-3 py-1.5 bg-[#1B4F8F] text-white rounded text-[13px] font-medium"
            >
              + Create Promotion
            </button>
          </div>
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[#F3F6F8] font-mono text-[11px] uppercase text-[#58697A] border-b border-[#D8E0E6]">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Role</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Apply Clicks</th>
                <th className="p-3">Ends At</th>
                <th className="p-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E0E6]">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-[#F3F6F8]/50">
                  <td className="p-3 font-medium text-[#0F1F2A]">{p.company}</td>
                  <td className="p-3 text-[#0F1F2A]">{p.role}</td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FFF4EC] text-[#C2410C] font-semibold border border-[#FCD9BD]">
                      {p.tier}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#1B4F8F]">{p.clicks}</td>
                  <td className="p-3 font-mono text-[#58697A]">{p.endsAt}</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/report/${p.id}`}
                      className="text-[12px] font-medium text-[#1B4F8F] hover:underline"
                    >
                      View Report →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REMOVALS */}
      {activeTab === 'removals' && (
        <div className="bg-white border border-[#D8E0E6] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#D8E0E6]">
            <h3 className="font-semibold text-[#0F1F2A]">Pending Employer Removal Requests</h3>
          </div>
          {removals.length === 0 ? (
            <div className="p-8 text-center text-[#58697A] text-[14px]">
              No pending removal requests. All clean!
            </div>
          ) : (
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-[#F3F6F8] font-mono text-[11px] uppercase text-[#58697A] border-b border-[#D8E0E6]">
                <tr>
                  <th className="p-3">Company</th>
                  <th className="p-3">Requested By</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E0E6]">
                {removals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F3F6F8]/50">
                    <td className="p-3 font-medium text-[#0F1F2A]">{r.company}</td>
                    <td className="p-3 font-mono text-[#58697A]">{r.email}</td>
                    <td className="p-3 font-mono text-[#58697A]">{r.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => blockAndApproveRemoval(r.id, r.company)}
                        className="px-3 py-1 bg-[#BA1A1A] text-white rounded text-[12px] font-medium hover:bg-[#93000A]"
                      >
                        1-Click Block & Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
