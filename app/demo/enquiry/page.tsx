"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Send,
  Building,
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle,
  Tag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Cpu,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { SALES_ENGINE_API_BASE_URL } from "@/lib/api/sales-engine";
import type { CrmLead } from "@/lib/api/contracts/crm-lead";

type Preset = {
  label: string;
  category: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  position: string;
  services_needed: string;
  message: string;
};

const DEMO_PRESETS: Preset[] = [
  {
    label: "Civil Construction",
    category: "Construction",
    name: "Emeka Okafor",
    email: "emeka@okafor-structures.ng",
    phone: "+234 802 334 1122",
    company_name: "Okafor Civil Engineering Ltd",
    position: "Chief Project Engineer",
    services_needed: "Commercial building construction and materials procurement",
    message: "We are expanding our commercial real estate development in Lekki and require high-grade concrete, structural steel materials, and architecture compliance advisory.",
  },
  {
    label: "FinTech Payments",
    category: "Technology",
    name: "Amina Aliyu",
    email: "amina@paywave-africa.io",
    phone: "+234 805 776 9900",
    company_name: "PayWave Africa Tech",
    position: "VP of Product",
    services_needed: "Cloud payments software, API integration, and fintech data security",
    message: "Our payments platform is scaling across West Africa. We need cloud payment software infrastructure, cybersecurity review, and SaaS data integrations for high-throughput fintech transactions.",
  },
  {
    label: "Agro Ventures",
    category: "Agriculture",
    name: "Ibrahim Danjuma",
    email: "ibrahim@sahara-agro.com",
    phone: "+234 813 445 6677",
    company_name: "Sahara Agro Ventures",
    position: "Operations Director",
    services_needed: "Agricultural irrigation equipment and harvest logistics",
    message: "We operate commercial grain and livestock farms in Northern Nigeria. We are sourcing solar-powered drip irrigation systems and harvest storage facilities.",
  },
  {
    label: "Phone Collision",
    category: "Deduplication",
    name: "Tunde Bakare Jr.",
    email: "tunde.expansion@lagos-infra.com",
    phone: "+234 803 234 5678", // Known duplicate phone in seed
    company_name: "Lagos Infrastructure Group",
    position: "Managing Director",
    services_needed: "Public-private infrastructure partnership",
    message: "Submitting inquiry with our corporate direct line regarding upcoming municipal bridge and road surfacing projects.",
  },
];

export default function DemoEnquiryPage() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [name, setName] = useState(DEMO_PRESETS[0].name);
  const [email, setEmail] = useState(DEMO_PRESETS[0].email);
  const [phone, setPhone] = useState(DEMO_PRESETS[0].phone);
  const [companyName, setCompanyName] = useState(DEMO_PRESETS[0].company_name);
  const [position, setPosition] = useState(DEMO_PRESETS[0].position);
  const [servicesNeeded, setServicesNeeded] = useState(DEMO_PRESETS[0].services_needed);
  const [message, setMessage] = useState(DEMO_PRESETS[0].message);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<CrmLead | null>(null);
  const [assignedRepName, setAssignedRepName] = useState<string | null>(null);

  function applyPreset(preset: Preset, index: number) {
    setSelectedPresetIndex(index);
    setName(preset.name);
    setEmail(preset.email);
    setPhone(preset.phone);
    setCompanyName(preset.company_name);
    setPosition(preset.position);
    setServicesNeeded(preset.services_needed);
    setMessage(preset.message);
    setSubmittedLead(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${SALES_ENGINE_API_BASE_URL}/public/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company_name: companyName,
          position,
          services_needed: servicesNeeded,
          message,
        }),
      });

      const payload = await res.json();

      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || "Failed to submit enquiry");
      }

      const lead = payload.data as CrmLead;
      setSubmittedLead(lead);
      const rep = lead.assignee?.name || "Next Available Rep";
      setAssignedRepName(rep);

      if (payload.matched) {
        toast.info(payload.message || `Matched existing lead. Details merged.`);
      } else {
        toast.success(`Enquiry received! Assigned to ${rep} via Round-Robin.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#06181f] text-[#f6faf9] flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="border-b border-white/[0.08] bg-[#09232d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/dashboard-design/84470.svg" alt="" width={24} height={24} />
            <span className="font-semibold text-white tracking-tight">P23 Marketing Engine</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[11px] px-3 py-1 rounded-full bg-[#2ae9c9]/15 text-[#2ae9c9] border border-[#2ae9c9]/30 font-semibold tracking-wide">
              Live Intake Demo
            </span>
            <Link
              href="/crm"
              className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1.5 ml-2"
            >
              Back to CRM <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#2ae9c9] text-xs font-semibold mb-3">
            <Sparkles size={13} />
            Autonomous Ingestion Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2.5">
            Website Lead Intake & Classification
          </h1>
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            Experience organic lead intake in real time. Incoming submissions are instantly enriched with keyword taxonomy sector tags, scored via heuristic algorithms (0–100), triaged for collision duplicates, and assigned via round-robin.
          </p>
        </div>

        {/* 1-Click Demo Scenario Chips */}
        <div className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-[#2ae9c9]" /> Select Demo Scenario
            </span>
            <span className="text-[11px] text-[#8da4a6]">Auto-fills realistic lead payload</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DEMO_PRESETS.map((p, idx) => {
              const isActive = selectedPresetIndex === idx && !submittedLead;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p, idx)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "border-[#2ae9c9] bg-[#2ae9c9]/10 shadow-[0_0_15px_rgba(42,233,201,0.15)]"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white truncate">{p.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#2ae9c9]">
                        {p.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50 truncate">{p.company_name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pipeline Execution Confirmation Card */}
        {submittedLead ? (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0d2d3a] to-[#041c22] border border-[#2ae9c9]/40 shadow-2xl mb-8">
            <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-[#2ae9c9]/15 border border-[#2ae9c9]/30 flex items-center justify-center text-[#2ae9c9] flex-shrink-0">
                <CheckCircle size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Lead Ingested & Classified</h3>
                <p className="text-xs text-[#2ae9c9]/90 mt-0.5">
                  Record #{submittedLead.id} is now registered in the CRM with full attribution metadata.
                </p>
              </div>
            </div>

            {/* Ingestion Receipt Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <UserCheck size={14} className="text-[#2ae9c9]" /> Round-Robin Rep
                </div>
                <div className="text-base font-bold text-white">{assignedRepName}</div>
                <span className="text-[11px] text-[#2ae9c9] mt-0.5 inline-block">Active Pool Allocation</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <Tag size={14} className="text-sky-400" /> Sector Taxonomy
                </div>
                <div className="text-base font-bold text-sky-300">
                  {submittedLead.primary_interest?.name || "Business Consulting"}
                </div>
                <span className="text-[11px] text-white/40 mt-0.5 inline-block">Keyword classification</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <Cpu size={14} className="text-amber-400" /> Heuristic Score
                </div>
                <div className="text-base font-bold text-amber-300">
                  {submittedLead.score ?? 85} <span className="text-xs text-white/50">/ 100</span>
                </div>
                <span className="text-[11px] text-amber-400/80 mt-0.5 inline-block">High Intent Signal</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSubmittedLead(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/20 text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Test Another Enquiry
              </button>
              <Link
                href={`/crm/leads/${submittedLead.id}`}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2ae9c9] text-[#073b35] hover:bg-[#52f0d5] transition-all flex items-center gap-2 shadow-lg shadow-[#2ae9c9]/20"
              >
                Inspect Lead in CRM
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* High-End Enterprise Intake Form */
          <form
            onSubmit={handleSubmit}
            className="p-8 sm:p-10 rounded-3xl bg-[#0d2d3a]/60 border border-white/10 shadow-2xl backdrop-blur-md"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#022228]/70 border border-white/10 rounded-xl py-3 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#022228]/70 border border-white/10 rounded-xl py-3 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Phone / Mobile *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#022228]/70 border border-white/10 rounded-xl py-3 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all font-mono text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Company / Organization *
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#022228]/70 border border-white/10 rounded-xl py-3 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Job Title / Position
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-[#022228]/70 border border-white/10 rounded-xl py-3 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Services or Sector Needed
                </label>
                <input
                  type="text"
                  value={servicesNeeded}
                  onChange={(e) => setServicesNeeded(e.target.value)}
                  placeholder="e.g. Infrastructure advisory, Cloud scale"
                  className="w-full bg-[#022228]/70 border border-white/10 rounded-xl py-3 px-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Inquiry Details / Message *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#022228]/70 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-[#2ae9c9] focus:ring-2 focus:ring-[#2ae9c9]/20 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <ShieldCheck size={15} className="text-[#2ae9c9]" />
                Direct submission to <code className="text-[#2ae9c9] font-mono">POST /public/enquiries</code>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3.5 rounded-xl bg-[#2ae9c9] text-[#073b35] font-bold text-sm hover:bg-[#52f0d5] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2ae9c9]/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing Ingestion...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Website Enquiry
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
