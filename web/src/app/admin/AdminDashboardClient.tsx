'use client'

import React, { useState, useTransition } from 'react'
import { toggleCompanyBlockAction, resolveRemovalRequestAction, signOutAdminAction } from './actions'

interface Props {
  adminEmail: string
  companies: any[]
  promotions: any[]
  removals: any[]
  lastRun: any | null
}

export function AdminDashboardClient({
  adminEmail,
  companies: initialCompanies,
  promotions,
  removals: initialRemovals,
  lastRun,
}: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'promotions' | 'removals'>('dashboard')
  const [companies, setCompanies] = useState(initialCompanies)
  const [removals, setRemovals] = useState(initialRemovals)
  const [isPending, startTransition] = useTransition()

  const handleToggleBlock = (id: string, currentlyBlocked: boolean) => {
    startTransition(async () => {
      try {
        await toggleCompanyBlockAction(id, currentlyBlocked)
        setCompanies((prev) =>
          prev.map((c) => (c.id === id ? { ...c, blocked: !currentlyBlocked } : c))
        )
      } catch (err: any) {
        alert(err?.message || 'Failed to update company')
      }
    })
  }

  const handleResolveRemoval = (id: string, block: boolean, name: string) => {
    startTransition(async () => {
      try {
        await resolveRemovalRequestAction(id, block, name)
        setRemovals((prev) => prev.filter((r) => r.id !== id))
        if (block) {
          setCompanies((prev) =>
            prev.map((c) => (c.name.toLowerCase() === name.toLowerCase() ? { ...c, blocked: true } : c))
          )
        }
      } catch (err: any) {
        alert(err?.message || 'Failed to resolve request')
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E0E6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B7A4B]" />
            <h1 className="text-[24px] font-bold text-[#0F1F2A]">Cyberboard Admin Console</h1>
          </div>
          <p className="text-[13px] text-[#58697A] font-mono mt-0.5">
            Logged in as <span className="text-[#0F1F2A] font-semibold">{adminEmail}</span>
          </p>
        </div>

        <form action={signOutAdminAction}>
          <button
            type="submit"
            className="px-3 py-1.5 bg-white border border-[#D8E0E6] text-[#0F1F2A] hover:bg-[#F3F6F8] rounded-lg text-[13px] font-medium"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#D8E0E6] pb-2">
        {(['dashboard', 'companies', 'promotions', 'removals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[13px] font-medium rounded-lg capitalize transition-colors ${
              activeTab === tab
                ? 'bg-[#1B4F8F] text-white'
                : 'text-[#58697A] hover:text-[#0F1F2A] hover:bg-[#F3F6F8]'
            }`}
          >
            {tab}
            {tab === 'removals' && removals.length > 0 && (
              <span className="ml-2 px-1.5 py-0.2 bg-[#C2410C] text-white rounded-full text-[10px]">
                {removals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-5">
              <div className="text-[12px] font-mono uppercase text-[#58697A] mb-1">Total Employers</div>
              <div className="text-[28px] font-bold text-[#0F1F2A]">{companies.length}</div>
              <div className="text-[12px] text-[#58697A] mt-1">
                {companies.filter((c) => !c.blocked).length} active · {companies.filter((c) => c.blocked).length} blocked
              </div>
            </div>
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-5">
              <div className="text-[12px] font-mono uppercase text-[#58697A] mb-1">Active Promotions</div>
              <div className="text-[28px] font-bold text-[#C2410C]">{promotions.length}</div>
              <div className="text-[12px] text-[#58697A] mt-1">Paid sponsored slots</div>
            </div>
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-5">
              <div className="text-[12px] font-mono uppercase text-[#58697A] mb-1">Pending Removals</div>
              <div className="text-[28px] font-bold text-[#0F1F2A]">{removals.length}</div>
              <div className="text-[12px] text-[#58697A] mt-1">Open requests</div>
            </div>
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-5">
              <div className="text-[12px] font-mono uppercase text-[#58697A] mb-1">Last Pipeline Sync</div>
              <div className="text-[16px] font-mono font-semibold text-[#0B7A4B] truncate">
                {lastRun?.finished_at ? new Date(lastRun.finished_at).toLocaleString() : 'Never'}
              </div>
              <div className="text-[12px] text-[#58697A] mt-1">
                {lastRun ? `${lastRun.jobs_active} active roles` : 'No run logged'}
              </div>
            </div>
          </div>

          {lastRun?.errors && lastRun.errors.length > 0 && (
            <div className="bg-white border border-[#D8E0E6] rounded-xl p-5">
              <h3 className="text-[14px] font-semibold text-[#0F1F2A] mb-3">Recent Pipeline Warnings / Errors</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[12px]">
                {lastRun.errors.map((e: any, idx: number) => (
                  <div key={idx} className="text-[#58697A]">
                    <span className="text-[#C2410C] font-semibold">{e.company}:</span> {e.error || e.warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Companies */}
      {activeTab === 'companies' && (
        <div className="bg-white border border-[#D8E0E6] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#D8E0E6] flex justify-between items-center">
            <span className="font-semibold text-[14px]">Ingested Employers ({companies.length})</span>
          </div>
          <div className="divide-y divide-[#D8E0E6]">
            {companies.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-[#0F1F2A]">{c.name}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F6F8] text-[#58697A]">
                      {c.ats}
                    </span>
                    {c.blocked && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FDF2F2] text-[#991B1B] font-semibold">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#58697A] font-mono mt-0.5">
                    slug: {c.slug} · domain: {c.domain || 'none'}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleBlock(c.id, c.blocked)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
                    c.blocked
                      ? 'bg-[#EBF7F0] text-[#0B7A4B] hover:bg-[#d6f0e1]'
                      : 'bg-[#FDF2F2] text-[#991B1B] hover:bg-[#fde2e2]'
                  }`}
                >
                  {c.blocked ? 'Unblock Company' : 'Block from Sync'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Promotions */}
      {activeTab === 'promotions' && (
        <div className="bg-white border border-[#D8E0E6] rounded-xl p-5 shadow-xs">
          <h3 className="font-semibold text-[14px] text-[#0F1F2A] mb-4">Active & Historical Promotions</h3>
          {promotions.length === 0 ? (
            <p className="text-[13px] text-[#58697A]">No promotions currently configured in the database.</p>
          ) : (
            <div className="divide-y divide-[#D8E0E6]">
              {promotions.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[14px] text-[#0F1F2A]">
                      {p.companies?.name || 'Company'} — Tier: {p.tier}
                    </div>
                    <div className="text-[12px] text-[#58697A] font-mono mt-0.5">
                      Starts: {new Date(p.starts_at).toLocaleDateString()} · Ends: {new Date(p.ends_at).toLocaleDateString()} · Token: {p.report_token}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] px-2 py-1 rounded bg-[#FFF4EC] text-[#C2410C] font-semibold">
                    {p.tier}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Removals */}
      {activeTab === 'removals' && (
        <div className="bg-white border border-[#D8E0E6] rounded-xl p-5 shadow-xs">
          <h3 className="font-semibold text-[14px] text-[#0F1F2A] mb-4">Removal Requests ({removals.length})</h3>
          {removals.length === 0 ? (
            <p className="text-[13px] text-[#58697A]">No open removal requests.</p>
          ) : (
            <div className="space-y-4">
              {removals.map((r) => (
                <div key={r.id} className="p-4 bg-[#F8FAFC] border border-[#D8E0E6] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[14px] text-[#0F1F2A]">{r.company_name}</div>
                    <div className="text-[12px] text-[#58697A] font-mono mt-0.5">
                      Requester: {r.contact_email} · Received: {new Date(r.created_at).toLocaleString()}
                    </div>
                    {r.message && (
                      <p className="text-[13px] text-[#0F1F2A] mt-2 italic bg-white p-2 rounded border border-[#D8E0E6]">
                        "{r.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveRemoval(r.id, false, r.company_name)}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-white border border-[#D8E0E6] text-[#0F1F2A] hover:bg-[#F3F6F8] rounded text-[12px]"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolveRemoval(r.id, true, r.company_name)}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-[#991B1B] text-white hover:bg-[#7f1d1d] rounded text-[12px] font-medium"
                    >
                      Block Company & Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

