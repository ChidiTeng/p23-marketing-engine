"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  Radio,
  Users,
  BarChart3,
  GitMerge,
  Settings,
  Building2,
  ArrowRight,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLeads } from "@/hooks/use-crm";

type QuickRouteItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "Navigation" | "Demo Tools";
  icon: React.ReactNode;
};

const QUICK_ROUTES: QuickRouteItem[] = [
  {
    id: "nav-dashboard",
    title: "Dashboard",
    subtitle: "Executive growth overview, revenue performance & conversion funnel",
    href: "/dashboard",
    category: "Navigation",
    icon: <LayoutDashboard size={16} />,
  },
  {
    id: "nav-smart-leads",
    title: "Smart Leads",
    subtitle: "AI-discovered prospects & ICP matching",
    href: "/smart-leads",
    category: "Navigation",
    icon: <Sparkles size={16} />,
  },
  {
    id: "nav-social-listening",
    title: "Social Listening",
    subtitle: "Real-time buying signals across social channels",
    href: "/social-listening",
    category: "Navigation",
    icon: <Radio size={16} />,
  },
  {
    id: "nav-crm",
    title: "CRM Leads & Pipeline",
    subtitle: "Manage leads, opportunities, stages & contacts",
    href: "/crm",
    category: "Navigation",
    icon: <Building2 size={16} />,
  },
  {
    id: "nav-analytics",
    title: "Attribution & Analytics",
    subtitle: "Multi-channel attribution & primary sector breakdown",
    href: "/analytics",
    category: "Navigation",
    icon: <BarChart3 size={16} />,
  },
  {
    id: "nav-users",
    title: "User Management",
    subtitle: "Team roles, permissions & round-robin pool",
    href: "/users",
    category: "Navigation",
    icon: <Users size={16} />,
  },
  {
    id: "nav-duplicates",
    title: "Duplicate Review Queue",
    subtitle: "Resolve phone & email lead collisions",
    href: "/duplicates",
    category: "Navigation",
    icon: <GitMerge size={16} />,
  },
  {
    id: "nav-enquiry",
    title: "Website Enquiry Intake Demo",
    subtitle: "Simulate organic website contact form submissions",
    href: "/demo/enquiry",
    category: "Demo Tools",
    icon: <FileSpreadsheet size={16} />,
  },
  {
    id: "nav-settings",
    title: "Settings",
    subtitle: "Workspace preferences & account configuration",
    href: "/settings",
    category: "Navigation",
    icon: <Settings size={16} />,
  },
];

const FEATURED_COMPANIES = [
  { id: "hot-1", name: "TechGlobal Ltd", sector: "Technology", match: "92% match", tag: "Hot", href: "/crm?search=TechGlobal" },
  { id: "hot-2", name: "Kora Systems", sector: "Technology", match: "81% match", tag: "Warm", href: "/crm?search=Kora" },
  { id: "hot-3", name: "Alpha Retail", sector: "Business Consulting", match: "74% match", tag: "Moderate", href: "/crm?search=Alpha" },
  { id: "hot-4", name: "Nova Health", sector: "Technology", match: "71% match", tag: "Warm", href: "/crm?search=Nova" },
  { id: "hot-5", name: "Delta Finance", sector: "Business Consulting", match: "65% match", tag: "Cold", href: "/crm?search=Delta" },
];

export function CommandPaletteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: leadsPage } = useLeads({ per_page: 25 });

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_ROUTES;
    return QUICK_ROUTES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    const crmItems = (leadsPage?.leads ?? []).map((l) => ({
      id: `lead-${l.id}`,
      name: l.company_name || l.name,
      sector: l.primary_interest?.name || l.channel || "Lead",
      match: l.score ? `${l.score}% score` : "Active",
      tag: l.status || "New",
      href: `/crm/leads/${l.id}`,
    }));

    const combined = [...FEATURED_COMPANIES, ...crmItems];
    if (!q) return combined.slice(0, 5);
    return combined
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sector.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, leadsPage?.leads]);

  function handleSelect(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Global Command Search"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-white/15 bg-[#12121c] text-white shadow-2xl overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <Search size={18} className="text-purple-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, companies, or jump to a screen..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
                data-testid="command-palette-input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs text-slate-400 hover:text-white p-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[62vh] overflow-y-auto p-3 space-y-4">
              {filteredLeads.length > 0 && (
                <div>
                  <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Leads & Companies
                  </div>
                  <div className="space-y-1">
                    {filteredLeads.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => handleSelect(lead.href)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.07] transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {lead.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {lead.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {lead.sector} · {lead.match}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium">
                            {lead.tag}
                          </span>
                          <ArrowRight
                            size={14}
                            className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredRoutes.length > 0 && (
                <div>
                  <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Screens & Modules
                  </div>
                  <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => handleSelect(route.href)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.07] transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 text-emerald-300 flex items-center justify-center shrink-0">
                            {route.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {route.title}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {route.subtitle}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredLeads.length === 0 && filteredRoutes.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">
                  No matching leads, companies, or screens for &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-black/30 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Click any item to navigate</span>
              <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                ESC to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

