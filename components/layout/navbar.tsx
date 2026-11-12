"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { clearAuthSession, getAuthTokenFromDocument } from "@/lib/auth/session";
import { logoutFromSalesEngine } from "@/lib/api/sales-engine-native-auth";
import { getSalesEngineToken, clearSalesEngineSession } from "@/lib/sales-engine/session";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
  BarChart3,
  Users,
  GitMerge,
  Search,
  Bell,
  Sun,
  Moon,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/sample";
import LogoutModal from "@/components/ui/logout-modal";
import { resolveAvatarSrc } from "@/lib/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useP23Theme } from "@/components/providers/theme-provider";
import { CommandPaletteModal } from "./command-palette";

type NavItem = {
  name: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
  hasChevron?: boolean;
};

const primaryNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "/dashboard-design/469fa.svg" },
  { name: "Smart Leads", href: "/smart-leads", icon: "/dashboard-design/8ea52.svg", hasChevron: true },
  { name: "Social Listening", href: "/social-listening", icon: "/dashboard-design/d3b09.svg" },
  { name: "CRM", href: "/crm", icon: "/dashboard-design/f4304.svg", hasChevron: true },
  { name: "Analytics", href: "/analytics", icon: "/dashboard-design/26ef3.svg", adminOnly: true },
  { name: "Users", href: "/users", icon: "/dashboard-design/934c3.svg", adminOnly: true },
  { name: "Duplicates", href: "/duplicates", icon: "/dashboard-design/f4304.svg", adminOnly: true },
  { name: "Settings", href: "/settings", icon: "/dashboard-design/934c3.svg" },
];

const RECENT_NOTIFICATIONS = [
  { id: "n1", title: "New opportunity created", detail: "by Amara Okafor · 3m ago", badge: "Opportunity", href: "/crm" },
  { id: "n2", title: "Deal moved to Negotiation", detail: "by Tunde Bello · 15m ago", badge: "Deal", href: "/crm" },
  { id: "n3", title: "New lead captured from Website", detail: "TechGlobal Ltd · 22m ago", badge: "Lead", href: "/crm" },
  { id: "n4", title: "Duplicate collision detected", detail: "Phone match in review queue · 1h ago", badge: "Review", href: "/duplicates" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const { isAdminOrOwner } = useCurrentUser();
  const { theme } = useP23Theme();

  const visibleNavItems = primaryNavItems.filter(
    (item) => !item.adminOnly || isAdminOrOwner
  );

  // Global ⌘K / Ctrl+K shortcut for Command Palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      const token = getSalesEngineToken() ?? getAuthTokenFromDocument();
      if (token) {
        await logoutFromSalesEngine(token);
      }
    } catch {
      // Continue local logout cleanup
    }

    clearAuthSession();
    clearSalesEngineSession();
    clearUser();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  }

  const userInitials = (() => {
    const name = user?.name?.trim();
    if (!name) return "EN";
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  })();

  const isLight = theme === "light";

  return (
    <>
      <nav
        className="w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-3 flex items-center justify-between gap-4 relative z-50"
        data-testid="p23-navbar"
      >
        {/* Left: Official P23 Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-md",
              isLight
                ? "bg-[#022228] border-[#2ae9c9]/50 shadow-[#022228]/15"
                : "bg-gradient-to-br from-purple-600/40 via-[#151326] to-emerald-500/30 border-purple-400/40 shadow-purple-950/50"
            )}
          >
            <Image
              src="/dashboard-design/84470.svg"
              alt="P23 Logo"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className={cn(
                "text-[16px] font-extrabold tracking-tight",
                isLight ? "text-[#022228]" : "text-white"
              )}
            >
              P23
            </span>
            <span
              className={cn(
                "text-[9px] font-semibold tracking-[0.22em] uppercase mt-0.5",
                isLight ? "text-[#0d6e6e]" : "text-slate-400"
              )}
            >
              AFRICA
            </span>
          </div>
        </Link>

        {/* Center: Floating Pill Navigation Dock */}
        <div
          className={cn(
            "hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-full border backdrop-blur-md transition-colors",
            isLight
              ? "bg-white/95 border-[#022228]/10 shadow-sm"
              : "bg-[#12121c]/85 border-white/[0.08] shadow-xl"
          )}
        >
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/sales-engine"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? isLight
                      ? "bg-[#2ae9c9] text-[#022228] font-semibold shadow-xs"
                      : "bg-white text-[#09090f] font-semibold shadow-sm"
                    : isLight
                    ? "text-slate-600 hover:text-[#022228] hover:bg-slate-100/80"
                    : "text-slate-300/80 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {isActive && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isLight ? "bg-[#022228]" : "bg-purple-600"
                    )}
                  />
                )}
                <span>{item.name}</span>
                {item.hasChevron && (
                  <ChevronDown
                    size={12}
                    className={cn("opacity-60", isActive && "opacity-90")}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side Controls: Search (⌘K), Notifications, Profile Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search leads, companies, or screens"
            data-testid="navbar-search-trigger"
            className={cn(
              "hidden md:flex items-center justify-between gap-4 px-3.5 py-2 rounded-full border text-xs transition-all cursor-pointer min-w-[210px] lg:min-w-[245px]",
              isLight
                ? "bg-white border-[#022228]/12 text-slate-500 hover:border-[#2ae9c9] shadow-2xs"
                : "bg-[#12121c]/85 border-white/[0.08] text-slate-400 hover:border-purple-400/40"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <Search size={13.5} className="opacity-70 shrink-0" />
              <span className="truncate">Search leads, companies...</span>
            </span>
            <kbd
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0",
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-600"
                  : "bg-white/[0.06] border-white/10 text-slate-300"
              )}
            >
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell + Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className={cn(
                "w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer relative",
                isLight
                  ? "bg-white border-[#022228]/12 text-[#022228] hover:bg-slate-100 shadow-2xs"
                  : "bg-[#12121c]/85 border-white/[0.08] text-slate-200 hover:text-white hover:border-purple-400/40"
              )}
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#07070c]" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className={cn(
                    "absolute right-0 top-full mt-2.5 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50",
                    isLight
                      ? "bg-white border-slate-200 text-[#022228]"
                      : "bg-[#13131f] border-white/10 text-white"
                  )}
                >
                  <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between">
                    <span className="text-xs font-bold">Live Activity Feed</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                      4 New
                    </span>
                  </div>
                  <div className="divide-y divide-current/5 max-h-72 overflow-y-auto">
                    {RECENT_NOTIFICATIONS.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-3 hover:bg-current/5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold truncate">{item.title}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-60 mt-0.5">{item.detail}</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar Pill ("EN") & Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-1.5 focus:outline-none group cursor-pointer"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold tracking-tight transition-transform group-hover:scale-105 shadow-md",
                  isLight
                    ? "bg-[#022228] text-[#2ae9c9] ring-2 ring-[#2ae9c9]/40"
                    : "bg-gradient-to-br from-purple-400 to-indigo-600 text-white ring-2 ring-purple-400/30"
                )}
              >
                {userInitials}
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "absolute right-0 top-full mt-3 w-60 border rounded-2xl shadow-2xl overflow-hidden z-50",
                    isLight
                      ? "bg-white border-slate-200 text-[#022228]"
                      : "bg-[#13131f] border-white/10 text-white"
                  )}
                >
                  <div className="px-4 py-3.5 border-b border-current/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-xs font-bold text-purple-300 overflow-hidden">
                      {user?.avatar ? (
                        <Image
                          src={resolveAvatarSrc(user.avatar)}
                          alt="Profile"
                          width={36}
                          height={36}
                          className="w-full h-full object-cover rounded-full"
                          unoptimized
                        />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user?.name ?? "Emmanuel Nwachukwu"}
                      </p>
                      <p className="text-[11px] opacity-60 truncate">
                        {user?.email ?? "emmanuel@p23africa.com"}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link
                      href="/demo/enquiry"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-85 hover:opacity-100 hover:bg-current/5 transition-colors text-xs font-medium"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-400" />
                      Website Enquiry Demo
                    </Link>
                    <Link
                      href="/sales-engine/outreach"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-85 hover:opacity-100 hover:bg-current/5 transition-colors text-xs font-medium"
                    >
                      <Sparkles size={14} className="text-purple-400" />
                      Outreach Workspace
                    </Link>
                    {isAdminOrOwner && (
                      <>
                        <Link
                          href="/analytics"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-85 hover:opacity-100 hover:bg-current/5 transition-colors text-xs font-medium"
                        >
                          <BarChart3 size={14} />
                          Analytics Review
                        </Link>
                        <Link
                          href="/users"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-85 hover:opacity-100 hover:bg-current/5 transition-colors text-xs font-medium"
                        >
                          <Users size={14} />
                          User Management
                        </Link>
                        <Link
                          href="/duplicates"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-85 hover:opacity-100 hover:bg-current/5 transition-colors text-xs font-medium"
                        >
                          <GitMerge size={14} />
                          Duplicate Queue
                        </Link>
                      </>
                    )}
                    <div className="my-1 border-t border-current/10" />
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-85 hover:opacity-100 hover:bg-current/5 transition-colors text-xs font-medium"
                    >
                      <Settings size={14} />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs font-medium cursor-pointer"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className={cn(
              "xl:hidden p-2 rounded-xl transition-colors",
              isLight ? "text-[#022228] hover:bg-slate-200/60" : "text-white/75 hover:text-white"
            )}
            aria-label="Navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] xl:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "fixed top-0 right-0 bottom-0 w-[82%] max-w-sm border-l z-[100] xl:hidden p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto",
                  isLight
                    ? "bg-white border-slate-200 text-[#022228]"
                    : "bg-[#0d0d16] border-white/10 text-white"
                )}
              >
                <div className="flex justify-between items-center">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#022228] flex items-center justify-center">
                      <Image src="/dashboard-design/84470.svg" alt="P23" width={18} height={18} />
                    </div>
                    <span className="text-base font-extrabold">P23 AFRICA</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 opacity-60 hover:opacity-100"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Mobile Search Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-current/15 text-xs opacity-75"
                >
                  <Search size={14} />
                  <span>Search leads, companies...</span>
                </button>

                <div className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                          isActive
                            ? isLight
                              ? "bg-[#2ae9c9] text-[#022228]"
                              : "bg-white text-[#09090f]"
                            : "opacity-70 hover:opacity-100 hover:bg-current/5"
                        )}
                      >
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-auto pt-4 border-t border-current/10 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full bg-red-500/10 p-3 rounded-xl flex items-center justify-center gap-2 text-red-400 text-xs font-bold cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />
      </nav>

      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
