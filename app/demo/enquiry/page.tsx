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
  RotateCcw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { SALES_ENGINE_API_BASE_URL } from "@/lib/api/sales-engine";
import type { CrmLead } from "@/lib/api/contracts/crm-lead";

type Preset = {
  label: string;
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
    label: "Construction Infrastructure",
    name: "Emeka Okafor",
    email: "emeka@okafor-structures.ng",
    phone: "+234 802 334 1122",
    company_name: "Okafor Civil Engineering Ltd",
    position: "Chief Project Engineer",
    services_needed: "Commercial building construction and materials procurement",
    message: "We are expanding our commercial real estate development in Lekki and require high-grade concrete, structural steel materials, and architecture compliance advisory.",
  },
  {
    label: "FinTech Cloud Platform",
    name: "Amina Aliyu",
    email: "amina@paywave-africa.io",
    phone: "+234 805 776 9900",
    company_name: "PayWave Africa Tech",
    position: "VP of Product",
    services_needed: "Cloud payments software and API integration",
    message: "Our payments platform is scaling across West Africa. We need cloud infrastructure, cybersecurity review, and SaaS data integrations for high-throughput fintech transactions.",
  },
  {
    label: "Agribusiness & Harvesting",
    name: "Ibrahim Danjuma",
    email: "ibrahim@sahara-agro.com",
    phone: "+234 813 445 6677",
    company_name: "Sahara Agro Ventures",
    position: "Operations Director",
    services_needed: "Agricultural irrigation equipment and harvest logistics",
    message: "We operate commercial grain and livestock farms in Northern Nigeria. We are sourcing solar-powered drip irrigation systems and harvest storage facilities.",
  },
  {
    label: "Duplicate Phone Collision",
    name: "Tunde Bakare Jr.",
    email: "tunde.expansion@lagos-infra.com",
    phone: "+234 803 234 5678", // Known duplicate phone
    company_name: "Lagos Infrastructure Group",
    position: "Managing Director",
    services_needed: "Public-private infrastructure partnership",
    message: "Submitting inquiry with our corporate direct line regarding upcoming municipal bridge and road surfacing projects.",
  },
];

export default function DemoEnquiryPage() {
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

  function applyPreset(preset: Preset) {
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
    <div className="min-h-screen bg-[#06181f] text-[#f6faf9] flex flex-col">
      {/* Navigation Bar */}
      <header className="border-b border-white/10 bg-[#09232d]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/dashboard-design/84470.svg" alt="" width={24} height={24} />
            <span className="font-semibold text-white tracking-tight">P23 Marketing Engine</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#2ae9c9]/15 text-[#2ae9c9] border border-[#2ae9c9]/30 font-medium">
              Demo Intake Form
            </span>
            <Link
              href="/crm"
              className="text-xs text-white/70 hover:text-white transition-colors"
            >
              Return to CRM &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Simulate Website Enquiry Intake
          </h1>
          <p className="text-white/60 text-sm max-w-2xl mx-auto">
            Test organic website lead capture in action. Inquiries submitted here automatically undergo keyword sector taxonomy tagging, heuristic scoring (0–100), duplicate triage, and sales rep round-robin allocation.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2ae9c9] uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            Quick Demo Presets (1-Click Fill)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEMO_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-2.5 rounded-xl border border-white/10 bg-black/20 hover:bg-[#2ae9c9]/10 hover:border-[#2ae9c9]/40 text-left text-xs text-white transition-all cursor-pointer"
              >
                <div className="font-semibold truncate">{p.label}</div>
                <div className="text-[11px] text-white/50 truncate mt-0.5">{p.company_name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submission Confirmation Card */}
        {submittedLead ? (
          <div className="p-8 rounded-3xl bg-[#0d2d3a] border border-[#2ae9c9]/40 shadow-2xl mb-8">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <CheckCircle size={28} />
              <div>
                <h3 className="text-xl font-bold text-white">Enquiry Processed Successfully!</h3>
                <p className="text-xs text-emerald-300">Lead #{submittedLead.id} is now registered in the P23 Sales Pipeline.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 p-4 rounded-2xl bg-black/30 border border-white/10">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-1">
                  Assigned Sales Rep
                </span>
                <span className="text-base font-bold text-[#2ae9c9]">
                  {assignedRepName}
                </span>
                <span className="block text-xs text-white/40 mt-0.5">via Round-Robin</span>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-1">
                  Classified Sector
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                  <Tag size={12} />
                  {submittedLead.primary_interest?.name || "Business Consulting"}
                </div>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-1">
                  Heuristic Lead Score
                </span>
                <span className="text-base font-bold text-amber-300">
                  {submittedLead.score ?? 85} / 100
                </span>
                <span className="block text-xs text-white/40 mt-0.5">Complete submission</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmittedLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-white/20 text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Submit Another Enquiry
              </button>
              <Link
                href="/crm"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2ae9c9] text-[#073b35] hover:bg-[#64f1d9] transition-all flex items-center gap-2"
              >
                Open CRM Leads
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#0d2d3a] border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Telephone / Mobile *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Company / Organization *
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Job Position / Role
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
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
                  placeholder="e.g. Infrastructure consulting, FinTech compliance"
                  className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
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
                className="w-full bg-[#022228]/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9] resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-white/40">
                Posts to <code className="text-[#2ae9c9]/80 font-mono">POST /public/enquiries</code>
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#2ae9c9] text-[#073b35] font-bold text-sm hover:bg-[#64f1d9] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
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
