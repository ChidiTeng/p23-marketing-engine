import { z } from "zod";

// ============================================================================
// TICKET 1: AI AUTOMATION TYPES, TONES/VIBES & TRIGGER CONFIGURATIONS
// ============================================================================

export const automationTypeIdSchema = z.enum([
  "sequential_nurture",
  "onboarding_welcome",
  "behavioral_trigger",
  "re_engagement_winback",
  "event_programme_countdown",
  "milestone_renewal",
]);
export type AutomationTypeId = z.infer<typeof automationTypeIdSchema>;

export const aiToneIdSchema = z.enum([
  "executive_corporate",
  "warm_consultative",
  "founder_casual",
  "urgent_action",
]);
export type AiToneId = z.infer<typeof aiToneIdSchema>;

export const triggerEventIdSchema = z.enum([
  "lead_created_crm",
  "smart_lead_synced",
  "stage_moved_qualified",
  "customer_health_drop",
  "intent_link_clicked",
  "inactivity_21d",
]);
export type TriggerEventId = z.infer<typeof triggerEventIdSchema>;

export const businessEngineSchema = z.enum([
  "B2B Market Entry",
  "Membership",
  "Paid Programmes",
]);
export type EmailBusinessEngine = z.infer<typeof businessEngineSchema>;

export type AutomationStatus = "Active" | "Paused" | "Draft";

export interface AutomationTypeSpec {
  id: AutomationTypeId;
  name: string;
  shortLabel: string;
  description: string;
  bestFor: string;
  defaultStepCount: number;
  recommendedIntervals: string[];
  badgeColor: string;
  badgeBg: string;
}

export interface AiToneSpec {
  id: AiToneId;
  name: string;
  tagline: string;
  promptRules: string[];
  sampleSubjectPrefix: string;
  sampleOpening: string;
  sampleClosing: string;
  accentColor: string;
  badgeBg: string;
}

export interface TriggerConfigSpec {
  id: TriggerEventId;
  name: string;
  sourceModule: "CRM" | "Smart Lead" | "Customers" | "Campaigns";
  description: string;
  defaultDelayLabel: string;
  sendWindowLabel: string;
  maxFrequencyCapLabel: string;
  stopOnReply: boolean;
}

export interface TargetAudienceSegment {
  id: string;
  name: string;
  sourceModule: "CRM" | "Customers" | "Smart Lead" | "Campaigns";
  engine: EmailBusinessEngine;
  recipientCount: number;
  description: string;
  avgIntentScore: number;
  recommendedAutomationType: AutomationTypeId;
  recommendedTone: AiToneId;
  recommendedTrigger: TriggerEventId;
  aiRationale: string;
}

export interface CrmContactTarget {
  id: string;
  name: string;
  email: string;
  companyName: string;
  roleTitle: string;
  corridorMarket: string;
  engine: EmailBusinessEngine;
  sourceModule: "CRM" | "Smart Lead" | "Customers";
  intentScore: number;
  intentSignalSummary: string;
}

export interface TrackedLinkItem {
  id: string;
  url: string;
  label: string;
  clicks: number;
  uniqueClicks: number;
  ctrPct: number;
}

export interface EmailSequenceStep {
  id: string;
  stepNumber: number;
  delayLabel: string;
  waitDays?: number;
  subject: string;
  previewText: string;
  body: string;
  openRatePct: number;
  clickRatePct: number;
  replyRatePct: number;
}

export interface EmailAutomationWorkflow {
  id: string;
  name: string;
  engine: EmailBusinessEngine;
  status: AutomationStatus;
  automationType: AutomationTypeId;
  tone: AiToneId;
  trigger: TriggerEventId;
  audienceSegmentId: string;
  audienceName: string;
  sourceModule: "CRM" | "Customers" | "Smart Lead" | "Campaigns";
  linkedCampaignId?: string;
  linkedCampaignName?: string;
  prospectName?: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectRole?: string;
  selectedContactIds?: string[];
  enrolledCount: number;
  sentCount: number;
  deliveredCount: number;
  deliveredRatePct: number;
  openedCount: number;
  openRatePct: number;
  clickedCount: number;
  clickRatePct: number;
  repliedCount: number;
  replyRatePct: number;
  convertedCount: number;
  revenueAttributedUsd: number;
  revenueFormatted: string;
  sendWindow: string;
  sequenceDurationLabel?: string;
  smartLeadSyncedCount?: number;
  lastUpdatedLabel: string;
  trackedLinks?: TrackedLinkItem[];
  steps: EmailSequenceStep[];
}

export type EmailTrackingEventType = "sent" | "delivered" | "opened" | "clicked";

export interface EmailTrackingEventRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  eventType: EmailTrackingEventType;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  linkUrl?: string;
  sourceModule: "Smart Lead" | "Email Automation" | "CRM";
  timestamp: string;
}

// ============================================================================
// CORE SPECIFICATIONS CATALOG (TICKET 1 DELIVERABLE)
// ============================================================================

export const AUTOMATION_TYPE_SPECS: Record<AutomationTypeId, AutomationTypeSpec> = {
  sequential_nurture: {
    id: "sequential_nurture",
    name: "Sequential Drip & Multi-Step Nurture",
    shortLabel: "Sequential Nurture",
    description:
      "Multi-stage educational sequence warming prospects with regional market theses, case studies, and consultation CTAs.",
    bestFor: "B2B Market Entry prospects & newly captured CRM leads",
    defaultStepCount: 4,
    recommendedIntervals: [
      "Day 0 (Immediate)",
      "Day 3 (+72h)",
      "Day 7 (+96h)",
      "Day 14 (+168h)",
    ],
    badgeColor: "#1d4ed8",
    badgeBg: "#dbeafe",
  },
  onboarding_welcome: {
    id: "onboarding_welcome",
    name: "Onboarding & Welcome Series",
    shortLabel: "Onboarding Series",
    description:
      "Immediate post-conversion activation sequence introducing relationship owners, community portals, and first-30-day milestones.",
    bestFor: "New Membership accounts & recently converted Customers",
    defaultStepCount: 3,
    recommendedIntervals: ["Immediate (+5m)", "Day 2 (+48h)", "Day 6 (+96h)"],
    badgeColor: "#6d28d9",
    badgeBg: "#ede9fe",
  },
  behavioral_trigger: {
    id: "behavioral_trigger",
    name: "Behavioral & Intent Signal Trigger",
    shortLabel: "Behavioral Trigger",
    description:
      "Event-driven outreach fired automatically when Smart Lead detects buying intent or a prospect clicks high-intent collateral.",
    bestFor: "Smart Lead ICP matches & high-intent link clickers",
    defaultStepCount: 3,
    recommendedIntervals: ["+15 mins after signal", "Day 2 (+48h)", "Day 5 (+72h)"],
    badgeColor: "#0f766e",
    badgeBg: "#ccfbf1",
  },
  re_engagement_winback: {
    id: "re_engagement_winback",
    name: "Re-Engagement & Dormant Win-Back",
    shortLabel: "Win-Back Flow",
    description:
      "Automated check-in sequence for stalled opportunities or at-risk customer accounts with 21+ days of zero activity.",
    bestFor: "At-risk Customers & dormant CRM pipeline deals",
    defaultStepCount: 3,
    recommendedIntervals: ["Day 0 (Trigger)", "Day 4 (+96h)", "Day 10 (+144h)"],
    badgeColor: "#b45309",
    badgeBg: "#fef3c7",
  },
  event_programme_countdown: {
    id: "event_programme_countdown",
    name: "Event & Cohort Launch Countdown",
    shortLabel: "Cohort Countdown",
    description:
      "Time-anchored sequence driving urgency for accelerator cohort deadlines, executive roundtables, and summits.",
    bestFor: "Paid Programmes applicants & Summit registrants",
    defaultStepCount: 4,
    recommendedIntervals: ["T-14 Days", "T-7 Days", "T-72 Hours", "T-24 Hours (Final)"],
    badgeColor: "#be185d",
    badgeBg: "#fce7f3",
  },
  milestone_renewal: {
    id: "milestone_renewal",
    name: "Renewal & Expansion Milestone",
    shortLabel: "Renewal Milestone",
    description:
      "Proactive ROI recap and renewal prompts triggered 30 days prior to membership expiry or programme completion.",
    bestFor: "Customers with upcoming renewals & expansion opportunities",
    defaultStepCount: 3,
    recommendedIntervals: ["30 Days Prior", "14 Days Prior", "3 Days Prior"],
    badgeColor: "#15803d",
    badgeBg: "#dcfce7",
  },
};

export const AI_TONE_SPECS: Record<AiToneId, AiToneSpec> = {
  executive_corporate: {
    id: "executive_corporate",
    name: "Executive & Institutional Authority",
    tagline: "Boardroom-ready, data-backed, concise ROI & regulatory clarity",
    promptRules: [
      "Zero exclamation marks or hype adjectives in subject lines",
      "Lead with cross-border market thesis or quantified benchmark",
      "Keep email body under 130 words with a single calendar CTA",
    ],
    sampleSubjectPrefix: "Briefing:",
    sampleOpening:
      "Dear {{first_name}}, our Q4 West & East Africa regulatory benchmarking for {{company_name}} highlighted three high-leverage expansion corridors.",
    sampleClosing:
      "Would Thursday at 10:30 WAT suit for a 15-minute executive review with your P23 corridor lead?",
    accentColor: "#1e40af",
    badgeBg: "#dbeafe",
  },
  warm_consultative: {
    id: "warm_consultative",
    name: "Warm Consultative & Relationship-First",
    tagline: "Empathetic, advisory peer partnership tailored for community & retention",
    promptRules: [
      "Reference shared P23 ecosystem milestones and account health goals",
      "Ask one open-ended diagnostic question to spark a two-way reply",
      "Balance professional advisory depth with approachable human warmth",
    ],
    sampleSubjectPrefix: "Checking in on {{company_name}}:",
    sampleOpening:
      "Hi {{first_name}}, we loved seeing {{company_name}}'s momentum this quarter and wanted to share a tailored playbook from our {{primary_engine}} team.",
    sampleClosing:
      "Reply directly with your top priority for next month and I'll send over the exact peer benchmarks.",
    accentColor: "#6d28d9",
    badgeBg: "#ede9fe",
  },
  founder_casual: {
    id: "founder_casual",
    name: "Founder-to-Founder Direct & Casual",
    tagline: "Authentic, plain-text feel written like a quick note from a peer founder",
    promptRules: [
      "Conversational lowercase-friendly subject lines under 45 characters",
      "Short 2-sentence paragraphs with zero corporate jargon",
      "Low-friction reply prompt ('Worth a quick 10-min chat?')",
    ],
    sampleSubjectPrefix: "quick question re:",
    sampleOpening:
      "Hey {{first_name}} — noticed {{company_name}} is scaling across {{corridor_market}} and thought our latest founder playbook might save you a few weeks.",
    sampleClosing:
      "Open to a quick 10-min swap this week? Happy to share what worked for similar teams.",
    accentColor: "#0f766e",
    badgeBg: "#ccfbf1",
  },
  urgent_action: {
    id: "urgent_action",
    name: "High-Momentum & Deadline-Driven",
    tagline: "Crisp scarcity, social proof, and immediate next-step clarity",
    promptRules: [
      "Time-anchored subject line highlighting remaining seats or window",
      "3-bullet executive value recap above the fold",
      "Direct one-click confirmation or application link",
    ],
    sampleSubjectPrefix: "[Final 48h]",
    sampleOpening:
      "Hi {{first_name}}, final seats for {{company_name}} in our upcoming {{primary_engine}} cohort close this Friday at 17:00 WAT.",
    sampleClosing:
      "Confirm your priority allocation via the link below before we release waitlisted spots.",
    accentColor: "#be123c",
    badgeBg: "#ffe4e6",
  },
};

export const TRIGGER_CONFIG_SPECS: Record<TriggerEventId, TriggerConfigSpec> = {
  lead_created_crm: {
    id: "lead_created_crm",
    name: "New Lead Captured in CRM",
    sourceModule: "CRM",
    description:
      "Fires automatically when a new lead enters CRM via Website Intake, manual entry, or import.",
    defaultDelayLabel: "Immediate (+5 mins)",
    sendWindowLabel: "Tue–Thu · 09:30–11:30 WAT",
    maxFrequencyCapLabel: "Max 1 email / 48h",
    stopOnReply: true,
  },
  smart_lead_synced: {
    id: "smart_lead_synced",
    name: "Smart Lead ICP Match Synced (Score ≥ 75)",
    sourceModule: "Smart Lead",
    description:
      "Fires when Smart Lead discovers and syncs a high-fit ICP prospect or social buying signal.",
    defaultDelayLabel: "+15 mins after enrichment",
    sendWindowLabel: "Mon–Fri · 09:00–16:00 Local",
    maxFrequencyCapLabel: "Max 1 email / 48h",
    stopOnReply: true,
  },
  stage_moved_qualified: {
    id: "stage_moved_qualified",
    name: "CRM Stage Moved → Qualified / Proposal",
    sourceModule: "CRM",
    description:
      "Fires when a rep moves a lead card into Qualified or Proposal Sent on the CRM Kanban board.",
    defaultDelayLabel: "+30 mins after stage move",
    sendWindowLabel: "Tue–Thu · 09:30–14:00 WAT",
    maxFrequencyCapLabel: "Max 1 email / 72h",
    stopOnReply: true,
  },
  customer_health_drop: {
    id: "customer_health_drop",
    name: "Customer Health < 65 or Renewal Due",
    sourceModule: "Customers",
    description:
      "Fires when a customer account status shifts to 'Renewal due' or 'At risk' in the Customers directory.",
    defaultDelayLabel: "Next business morning (09:00 WAT)",
    sendWindowLabel: "Mon–Thu · 09:00–12:00 WAT",
    maxFrequencyCapLabel: "Max 1 email / 72h",
    stopOnReply: true,
  },
  intent_link_clicked: {
    id: "intent_link_clicked",
    name: "High-Intent Link Clicked / 2+ Opens in 48h",
    sourceModule: "Campaigns",
    description:
      "Fires when a campaign recipient clicks a pricing deck, summit agenda, or opens 2+ times.",
    defaultDelayLabel: "+20 mins after click event",
    sendWindowLabel: "Daily · 08:30–17:30 WAT",
    maxFrequencyCapLabel: "Max 1 email / 48h",
    stopOnReply: true,
  },
  inactivity_21d: {
    id: "inactivity_21d",
    name: "21 Days Without CRM or Email Activity",
    sourceModule: "CRM",
    description:
      "Fires when an active opportunity or member has zero logged touchpoints for 21 consecutive days.",
    defaultDelayLabel: "Day 21 at 10:00 WAT",
    sendWindowLabel: "Tue–Thu · 10:00–12:00 WAT",
    maxFrequencyCapLabel: "Max 1 email / 96h",
    stopOnReply: true,
  },
};

export const TARGET_AUDIENCE_SEGMENTS: TargetAudienceSegment[] = [
  {
    id: "aud-b2b-cfo-enterprise",
    name: "Enterprise CFOs & Heads of Expansion (West & East Africa)",
    sourceModule: "CRM",
    engine: "B2B Market Entry",
    recipientCount: 1420,
    description:
      "High-value B2B Market Entry leads in CRM seeking regulatory, tax, and cross-border expansion advisory.",
    avgIntentScore: 89,
    recommendedAutomationType: "sequential_nurture",
    recommendedTone: "executive_corporate",
    recommendedTrigger: "lead_created_crm",
    aiRationale:
      "Enterprise decision-makers respond best to a 4-step Executive Authority sequence spaced across 14 days with regulatory benchmarks.",
  },
  {
    id: "aud-smart-lead-icp",
    name: "Smart Lead AI-Discovered High-Intent Prospects",
    sourceModule: "Smart Lead",
    engine: "B2B Market Entry",
    recipientCount: 865,
    description:
      "Prospects synced from Smart Lead & Social Listening with ICP fit scores ≥ 78 and active expansion signals.",
    avgIntentScore: 92,
    recommendedAutomationType: "behavioral_trigger",
    recommendedTone: "founder_casual",
    recommendedTrigger: "smart_lead_synced",
    aiRationale:
      "Fresh Smart Lead signals convert 2.4x higher when contacted within 15 minutes using a conversational Founder-to-Founder tone.",
  },
  {
    id: "aud-membership-onboarding",
    name: "Q4 New & Renewing P23 Executive Members",
    sourceModule: "Customers",
    engine: "Membership",
    recipientCount: 960,
    description:
      "Converted customers in the Membership engine requiring onboarding activation or 30-day renewal check-ins.",
    avgIntentScore: 84,
    recommendedAutomationType: "onboarding_welcome",
    recommendedTone: "warm_consultative",
    recommendedTrigger: "customer_health_drop",
    aiRationale:
      "Warm Consultative onboarding + renewal touchpoints boost 90-day member retention to 94% across Nigeria and Kenya corridors.",
  },
  {
    id: "aud-programmes-cohort",
    name: "Founders Accelerator Cohort 5 & SME Masterclass Applicants",
    sourceModule: "Campaigns",
    engine: "Paid Programmes",
    recipientCount: 1220,
    description:
      "Founders and operators who engaged with Paid Programmes campaigns or clicked syllabus decks.",
    avgIntentScore: 86,
    recommendedAutomationType: "event_programme_countdown",
    recommendedTone: "urgent_action",
    recommendedTrigger: "intent_link_clicked",
    aiRationale:
      "Deadline-driven countdown reminders triggered on syllabus link clicks increase completed cohort enrolments by 31%.",
  },
  {
    id: "aud-dormant-winback",
    name: "At-Risk Customers & Stalled CRM Opportunities (21d+ Inactive)",
    sourceModule: "Customers",
    engine: "B2B Market Entry",
    recipientCount: 410,
    description:
      "Accounts with health score < 65 or CRM deals stalled in Proposal Sent for over 21 days.",
    avgIntentScore: 68,
    recommendedAutomationType: "re_engagement_winback",
    recommendedTone: "warm_consultative",
    recommendedTrigger: "inactivity_21d",
    aiRationale:
      "A low-pressure 3-step Consultative win-back sequence recovers 18.5% of stalled opportunities before quarter-end.",
  },
];

// ============================================================================
// TICKET 6: SPECIFIC CRM CONTACTS & SMART LEAD PROSPECTS FOR AUDIENCE SELECTOR
// ============================================================================

export const CRM_CONTACT_TARGETS: CrmContactTarget[] = [
  {
    id: "crm-contact-1",
    name: "Chidi Nwosu",
    email: "chidi.nwosu@techglobal.ng",
    companyName: "TechGlobal Ltd",
    roleTitle: "Chief Financial Officer",
    corridorMarket: "Nigeria & Ghana",
    engine: "B2B Market Entry",
    sourceModule: "CRM",
    intentScore: 94,
    intentSignalSummary: "Requested ECOWAS cross-border tax & entity structuring deck",
  },
  {
    id: "crm-contact-2",
    name: "Wanjiku Mwangi",
    email: "w.mwangi@korasystems.co.ke",
    companyName: "Kora Systems",
    roleTitle: "VP of Expansion",
    corridorMarket: "Kenya & Uganda",
    engine: "B2B Market Entry",
    sourceModule: "Smart Lead",
    intentScore: 91,
    intentSignalSummary: "Smart Lead ICP match: Hiring East Africa regulatory counsel",
  },
  {
    id: "crm-contact-3",
    name: "Tunde Bakare",
    email: "tunde@apexinfrastructure.ng",
    companyName: "Apex Infrastructure Ltd",
    roleTitle: "Managing Director",
    corridorMarket: "Nigeria",
    engine: "Membership",
    sourceModule: "Customers",
    intentScore: 87,
    intentSignalSummary: "Q4 Executive Membership tier upgrade candidate",
  },
  {
    id: "crm-contact-4",
    name: "Amina Mensah",
    email: "amina@paystackscale.io",
    companyName: "Paystack Scale Tech",
    roleTitle: "Co-Founder & CEO",
    corridorMarket: "Ghana & Côte d'Ivoire",
    engine: "Paid Programmes",
    sourceModule: "CRM",
    intentScore: 89,
    intentSignalSummary: "Clicked Founders Accelerator Cohort 5 curriculum link 3x",
  },
  {
    id: "crm-contact-5",
    name: "Kelechi Okafor",
    email: "kelechi@bluepeak.africa",
    companyName: "BluePeak Strategy Partners",
    roleTitle: "Senior Partner",
    corridorMarket: "South Africa & Nigeria",
    engine: "Membership",
    sourceModule: "Smart Lead",
    intentScore: 85,
    intentSignalSummary: "Attended Lagos CFO Roundtable briefing",
  },
  {
    id: "crm-contact-6",
    name: "Zainab Danjuma",
    email: "z.danjuma@novahealth.africa",
    companyName: "Nova Health",
    roleTitle: "Head of Operations",
    corridorMarket: "Kenya & Rwanda",
    engine: "Paid Programmes",
    sourceModule: "CRM",
    intentScore: 82,
    intentSignalSummary: "Downloaded SME Growth Masterclass application guide",
  },
];

export const CAMPAIGN_ACTIVATION_OPTIONS = [
  { id: "camp-west-africa-summit", name: "West Africa Market Entry Summit", engine: "B2B Market Entry" as const },
  { id: "camp-linkedin-abm", name: "LinkedIn ABM: Enterprise CFOs", engine: "B2B Market Entry" as const },
  { id: "camp-membership-q4", name: "Membership Drive Q4", engine: "Membership" as const },
  { id: "camp-founders-cohort-5", name: "Founders Accelerator Cohort 5", engine: "Paid Programmes" as const },
  { id: "camp-referral-rewards", name: "Referral Rewards", engine: "Membership" as const },
];

/**
 * Ticket 1 & Ticket 5/6 AI Drafter:
 * Dynamically recommends automation type, tone/vibe, trigger setup, and pre-populated content
 * based on a selected target audience segment OR specific CRM contacts.
 */
export function getAiRecommendationForAudience(
  audienceId: string,
  selectedContactIds?: string[]
): {
  audience: TargetAudienceSegment;
  automationType: AutomationTypeSpec;
  tone: AiToneSpec;
  trigger: TriggerConfigSpec;
  suggestedSteps: EmailSequenceStep[];
  primaryContact: CrmContactTarget | null;
} {
  const audience =
    TARGET_AUDIENCE_SEGMENTS.find((a) => a.id === audienceId) ??
    TARGET_AUDIENCE_SEGMENTS[0];
  const automationType = AUTOMATION_TYPE_SPECS[audience.recommendedAutomationType];
  const tone = AI_TONE_SPECS[audience.recommendedTone];
  const trigger = TRIGGER_CONFIG_SPECS[audience.recommendedTrigger];

  const primaryContact =
    selectedContactIds && selectedContactIds.length > 0
      ? CRM_CONTACT_TARGETS.find((c) => c.id === selectedContactIds[0]) ?? null
      : null;

  const targetContextNote = primaryContact
    ? `Specifically tailored for ${primaryContact.name} (${primaryContact.roleTitle} at ${primaryContact.companyName}) following signal: "${primaryContact.intentSignalSummary}".`
    : `Based on our work with {{corridor_market}} leaders in ${audience.engine}, we prepared a concise 3-point execution brief tailored for {{company_name}}.`;

  const suggestedSteps: EmailSequenceStep[] = automationType.recommendedIntervals.map(
    (delayLabel, idx) => {
      const stepNum = idx + 1;
      const waitDays = idx === 0 ? 0 : idx === 1 ? 3 : idx === 2 ? 7 : 14;
      if (stepNum === 1) {
        return {
          id: `ai-step-1`,
          stepNumber: 1,
          delayLabel,
          waitDays,
          subject: `${tone.sampleSubjectPrefix} ${audience.engine} roadmap for {{company_name}}`,
          previewText: `Tailored ${audience.engine} insights and corridor benchmarks for {{first_name}}`,
          body: `${tone.sampleOpening}\n\n${targetContextNote}\n\nExplore our interactive corridor playbook here: https://p23africa.com/playbooks/corridor-brief\n\n${tone.sampleClosing}\n\nBest regards,\n{{owner_name}}\nP23 Africa`,
          openRatePct: 68.4,
          clickRatePct: 24.2,
          replyRatePct: 14.8,
        };
      }
      if (stepNum === 2) {
        return {
          id: `ai-step-2`,
          stepNumber: 2,
          delayLabel,
          waitDays,
          subject: `Re: ${audience.engine} benchmark & case study for {{company_name}}`,
          previewText: `How peer teams accelerated ${audience.engine} outcomes in 30 days`,
          body: `Hi {{first_name}},\n\nFollowing up on my note — I wanted to share how a comparable organization in {{corridor_market}} shortened their ${audience.engine} cycle by 38% last quarter: https://p23africa.com/case-studies/expansion-roi\n\n${tone.sampleClosing}\n\nWarmly,\n{{owner_name}}`,
          openRatePct: 61.0,
          clickRatePct: 21.5,
          replyRatePct: 16.2,
        };
      }
      return {
        id: `ai-step-${stepNum}`,
        stepNumber: stepNum,
        delayLabel,
        waitDays,
        subject: `${tone.sampleSubjectPrefix} Next steps for {{company_name}} (${audience.engine})`,
        previewText: `Priority allocation & executive briefing window`,
        body: `Hi {{first_name}},\n\nWe are finalizing our ${audience.engine} allocations for this cycle. Book a 15-minute alignment call directly on {{owner_calendar_link}} or let me know if we should reconnect next quarter.\n\n${tone.sampleClosing}\n\nRegards,\n{{owner_name}}`,
        openRatePct: 54.8,
        clickRatePct: 19.4,
        replyRatePct: 18.1,
      };
    }
  );

  return {
    audience,
    automationType,
    tone,
    trigger,
    suggestedSteps,
    primaryContact,
  };
}

/**
 * Rewrites a step's subject and body when the user switches the AI Tone/Vibe in the Template Editor.
 */
export function applyAiToneToStep(
  step: EmailSequenceStep,
  toneId: AiToneId,
  engine: EmailBusinessEngine,
  audienceNote?: string
): EmailSequenceStep {
  const tone = AI_TONE_SPECS[toneId];
  const extraContext = audienceNote
    ? `\n\nContext: ${audienceNote}`
    : `\n\nWe tailored this ${engine} sequence step specifically for {{company_name}} in {{corridor_market}} (https://p23africa.com/playbooks/corridor-brief).`;
  return {
    ...step,
    subject: `${tone.sampleSubjectPrefix} ${engine} briefing for {{company_name}} (Step ${step.stepNumber})`,
    body: `${tone.sampleOpening}${extraContext}\n\n${tone.sampleClosing}\n\nBest,\n{{owner_name}}\nP23 Africa`,
  };
}

// ============================================================================
// INITIAL SEED WORKFLOWS & ANALYTICS TELEMETRY
// ============================================================================

export const INITIAL_EMAIL_WORKFLOWS: EmailAutomationWorkflow[] = [
  {
    id: "wf-b2b-west-africa-cfo",
    name: "West Africa Market Entry Executive Nurture",
    engine: "B2B Market Entry",
    status: "Active",
    automationType: "sequential_nurture",
    tone: "executive_corporate",
    trigger: "lead_created_crm",
    audienceSegmentId: "aud-b2b-cfo-enterprise",
    audienceName: "Enterprise CFOs & Heads of Expansion",
    sourceModule: "CRM",
    linkedCampaignId: "camp-west-africa-summit",
    linkedCampaignName: "West Africa Market Entry Summit",
    prospectName: "Chidi Nwosu",
    prospectCompany: "TechGlobal Ltd",
    prospectEmail: "chidi.nwosu@techglobal.ng",
    prospectRole: "Chief Financial Officer",
    selectedContactIds: ["crm-contact-1", "crm-contact-2"],
    enrolledCount: 1420,
    sentCount: 4860,
    deliveredCount: 4816,
    deliveredRatePct: 99.1,
    openedCount: 3149,
    openRatePct: 64.8,
    clickedCount: 1137,
    clickRatePct: 23.4,
    repliedCount: 738,
    replyRatePct: 15.2,
    convertedCount: 304,
    revenueAttributedUsd: 74200,
    revenueFormatted: "$74,200",
    sendWindow: "Tue–Thu · 09:30–11:30 WAT",
    sequenceDurationLabel: "14 Days (3 Steps)",
    smartLeadSyncedCount: 310,
    lastUpdatedLabel: "12m ago",
    trackedLinks: [
      {
        id: "lnk-1",
        url: "https://p23africa.com/playbooks/west-africa-regulatory-2026",
        label: "West Africa Regulatory & Tax Playbook PDF",
        clicks: 642,
        uniqueClicks: 518,
        ctrPct: 13.2,
      },
      {
        id: "lnk-2",
        url: "https://cal.p23africa.com/corridor-advisory",
        label: "1:1 Corridor Advisory Booking Link",
        clicks: 495,
        uniqueClicks: 412,
        ctrPct: 10.2,
      },
    ],
    steps: [
      {
        id: "st-1",
        stepNumber: 1,
        delayLabel: "Day 0 (Immediate)",
        waitDays: 0,
        subject: "Briefing: West Africa regulatory & tax entry playbook for {{company_name}}",
        previewText: "Key ECOWAS & Nigeria/Ghana market entry benchmarks for Q4",
        body: "Dear {{first_name}},\n\nOur Q4 West Africa regulatory benchmarking for {{company_name}} highlighted three high-leverage expansion corridors across Nigeria, Ghana, and Côte d'Ivoire.\n\nReview the executive brief: https://p23africa.com/playbooks/west-africa-regulatory-2026\n\nWould Thursday at 10:30 WAT suit for a 15-minute executive review with your P23 corridor lead?\n\nBest regards,\n{{owner_name}}\nP23 Africa",
        openRatePct: 71.2,
        clickRatePct: 28.4,
        replyRatePct: 14.1,
      },
      {
        id: "st-2",
        stepNumber: 2,
        delayLabel: "Day 3 (+72h)",
        waitDays: 3,
        subject: "Briefing: Cross-border treasury & repatriation framework for {{company_name}}",
        previewText: "How peer CFOs structured multi-currency operations in Lagos & Nairobi",
        body: "Dear {{first_name}},\n\nFollowing our regulatory overview, I attached the cross-border treasury case study showing how three enterprise teams reduced entity setup time by 42%.\n\nLet me know if you'd like the full compliance checklist sent over.\n\nRegards,\n{{owner_name}}",
        openRatePct: 63.5,
        clickRatePct: 22.1,
        replyRatePct: 16.4,
      },
      {
        id: "st-3",
        stepNumber: 3,
        delayLabel: "Day 7 (+96h)",
        waitDays: 7,
        subject: "Briefing: Lagos CFO Roundtable & 1:1 Corridor Advisory allocation",
        previewText: "Private executive briefing invitation for {{company_name}}",
        body: "Dear {{first_name}},\n\nWe have two advisory slots open next week with our Senior Market Entry Partners in {{corridor_market}}.\n\nReply directly or select a time on https://cal.p23africa.com/corridor-advisory to confirm.\n\nBest regards,\n{{owner_name}}",
        openRatePct: 59.7,
        clickRatePct: 19.8,
        replyRatePct: 15.1,
      },
    ],
  },
  {
    id: "wf-smart-lead-signal-trigger",
    name: "Smart Lead AI Intent Signal Rapid Outreach",
    engine: "B2B Market Entry",
    status: "Active",
    automationType: "behavioral_trigger",
    tone: "founder_casual",
    trigger: "smart_lead_synced",
    audienceSegmentId: "aud-smart-lead-icp",
    audienceName: "Smart Lead AI-Discovered High-Intent Prospects",
    sourceModule: "Smart Lead",
    linkedCampaignId: "camp-linkedin-abm",
    linkedCampaignName: "LinkedIn ABM: Enterprise CFOs",
    prospectName: "Wanjiku Mwangi",
    prospectCompany: "Kora Systems",
    prospectEmail: "w.mwangi@korasystems.co.ke",
    prospectRole: "VP of Expansion",
    selectedContactIds: ["crm-contact-2"],
    enrolledCount: 865,
    sentCount: 2340,
    deliveredCount: 2312,
    deliveredRatePct: 98.8,
    openedCount: 1624,
    openRatePct: 69.4,
    clickedCount: 651,
    clickRatePct: 27.8,
    repliedCount: 458,
    replyRatePct: 19.6,
    convertedCount: 215,
    revenueAttributedUsd: 52800,
    revenueFormatted: "$52,800",
    sendWindow: "Mon–Fri · +15m after Smart Lead sync",
    sequenceDurationLabel: "5 Days (2 Steps)",
    smartLeadSyncedCount: 865,
    lastUpdatedLabel: "Just now",
    trackedLinks: [
      {
        id: "lnk-sl-1",
        url: "https://p23africa.com/maps/east-africa-partner-ecosystem",
        label: "East Africa Partner & Regulatory Map",
        clicks: 418,
        uniqueClicks: 365,
        ctrPct: 17.8,
      },
      {
        id: "lnk-sl-2",
        url: "https://cal.p23africa.com/founder-10min-swap",
        label: "Founder 10-Min Intro Calendar",
        clicks: 233,
        uniqueClicks: 198,
        ctrPct: 10.0,
      },
    ],
    steps: [
      {
        id: "sl-st-1",
        stepNumber: 1,
        delayLabel: "+15 mins after signal",
        waitDays: 0,
        subject: "quick question re: {{company_name}}'s {{corridor_market}} expansion",
        previewText: "Noticed your recent {{intent_signal_summary}} signal",
        body: "Hey {{first_name}} — noticed {{company_name}} is scaling across {{corridor_market}} ({{intent_signal_summary}}) and thought our latest market-entry playbook might save your team a few weeks: https://p23africa.com/maps/east-africa-partner-ecosystem\n\nOpen to a quick 10-min swap this Thursday?\n\nBest,\n{{owner_name}}",
        openRatePct: 74.0,
        clickRatePct: 31.2,
        replyRatePct: 21.4,
      },
      {
        id: "sl-st-2",
        stepNumber: 2,
        delayLabel: "Day 2 (+48h)",
        waitDays: 2,
        subject: "re: {{company_name}} in {{corridor_market}}",
        previewText: "2-page market map for {{first_name}}",
        body: "Hey {{first_name}} — sharing the 2-page partner & regulatory map we built for {{corridor_market}} operators.\n\nGrab a 10-min slot here if helpful: https://cal.p23africa.com/founder-10min-swap\n\nCheers,\n{{owner_name}}",
        openRatePct: 64.8,
        clickRatePct: 24.4,
        replyRatePct: 17.8,
      },
    ],
  },
  {
    id: "wf-membership-q4-onboarding",
    name: "Executive Membership Welcome & 30-Day Activation",
    engine: "Membership",
    status: "Active",
    automationType: "onboarding_welcome",
    tone: "warm_consultative",
    trigger: "customer_health_drop",
    audienceSegmentId: "aud-membership-onboarding",
    audienceName: "Q4 New & Renewing P23 Executive Members",
    sourceModule: "Customers",
    linkedCampaignId: "camp-membership-q4",
    linkedCampaignName: "Membership Drive Q4",
    prospectName: "Tunde Bakare",
    prospectCompany: "Apex Infrastructure Ltd",
    prospectEmail: "tunde@apexinfrastructure.ng",
    prospectRole: "Managing Director",
    selectedContactIds: ["crm-contact-3", "crm-contact-5"],
    enrolledCount: 960,
    sentCount: 2880,
    deliveredCount: 2863,
    deliveredRatePct: 99.4,
    openedCount: 1906,
    openRatePct: 66.2,
    clickedCount: 746,
    clickRatePct: 25.9,
    repliedCount: 417,
    replyRatePct: 14.5,
    convertedCount: 236,
    revenueAttributedUsd: 34600,
    revenueFormatted: "$34,600",
    sendWindow: "Mon–Thu · 09:00–12:00 WAT",
    sequenceDurationLabel: "6 Days (2 Steps)",
    smartLeadSyncedCount: 180,
    lastUpdatedLabel: "28m ago",
    trackedLinks: [
      {
        id: "lnk-mem-1",
        url: "https://p23africa.com/portal/deal-room-vault",
        label: "P23 Private Deal Room & Research Vault",
        clicks: 492,
        uniqueClicks: 410,
        ctrPct: 17.1,
      },
      {
        id: "lnk-mem-2",
        url: "https://p23africa.com/events/q4-member-roundtables",
        label: "Q4 Executive Member Roundtables RSVP",
        clicks: 254,
        uniqueClicks: 219,
        ctrPct: 8.8,
      },
    ],
    steps: [
      {
        id: "mem-st-1",
        stepNumber: 1,
        delayLabel: "Immediate (+5m)",
        waitDays: 0,
        subject: "Welcome to P23 Africa, {{first_name}} — your executive concierge & peer circle",
        previewText: "Your dedicated relationship manager and Q4 member roundtables",
        body: "Hi {{first_name}},\n\nWelcome to the P23 Executive Membership network! We are thrilled to partner with {{company_name}} across {{corridor_market}}.\n\nAccess your private member portal: https://p23africa.com/portal/deal-room-vault\n\nReply directly with your top priority for the next 60 days so we can curate your first peer introductions.\n\nWarmly,\n{{owner_name}}",
        openRatePct: 72.5,
        clickRatePct: 29.0,
        replyRatePct: 16.0,
      },
      {
        id: "mem-st-2",
        stepNumber: 2,
        delayLabel: "Day 2 (+48h)",
        waitDays: 2,
        subject: "Checking in on {{company_name}}: Your private deal room & research vault",
        previewText: "Unlocking your P23 member intelligence reports",
        body: "Hi {{first_name}},\n\nYour team at {{company_name}} now has full access to our cross-border intelligence briefings and private deal network: https://p23africa.com/events/q4-member-roundtables\n\nLet us know which sector briefing you'd like unlocked first.\n\nBest,\n{{owner_name}}",
        openRatePct: 59.9,
        clickRatePct: 22.8,
        replyRatePct: 13.0,
      },
    ],
  },
  {
    id: "wf-founders-cohort-5-countdown",
    name: "Founders Accelerator Cohort 5 Application Countdown",
    engine: "Paid Programmes",
    status: "Active",
    automationType: "event_programme_countdown",
    tone: "urgent_action",
    trigger: "intent_link_clicked",
    audienceSegmentId: "aud-programmes-cohort",
    audienceName: "Founders Accelerator Cohort 5 Applicants",
    sourceModule: "Campaigns",
    linkedCampaignId: "camp-founders-cohort-5",
    linkedCampaignName: "Founders Accelerator Cohort 5",
    prospectName: "Amina Mensah",
    prospectCompany: "Paystack Scale Tech",
    prospectEmail: "amina@paystackscale.io",
    prospectRole: "Co-Founder & CEO",
    selectedContactIds: ["crm-contact-4", "crm-contact-6"],
    enrolledCount: 840,
    sentCount: 2520,
    deliveredCount: 2492,
    deliveredRatePct: 98.9,
    openedCount: 1550,
    openRatePct: 61.5,
    clickedCount: 665,
    clickRatePct: 26.4,
    repliedCount: 322,
    replyRatePct: 12.8,
    convertedCount: 127,
    revenueAttributedUsd: 22600,
    revenueFormatted: "$22,600",
    sendWindow: "Daily · 08:30–17:30 WAT",
    sequenceDurationLabel: "7 Days (2 Steps)",
    smartLeadSyncedCount: 220,
    lastUpdatedLabel: "1h ago",
    trackedLinks: [
      {
        id: "lnk-prog-1",
        url: "https://p23africa.com/programmes/cohort-5-priority-seat",
        label: "Cohort 5 Priority Seat Confirmation",
        clicks: 445,
        uniqueClicks: 390,
        ctrPct: 17.7,
      },
      {
        id: "lnk-prog-2",
        url: "https://p23africa.com/programmes/cohort-5-syllabus.pdf",
        label: "Accelerator Cohort 5 Curriculum & Mentors Deck",
        clicks: 220,
        uniqueClicks: 195,
        ctrPct: 8.7,
      },
    ],
    steps: [
      {
        id: "prog-st-1",
        stepNumber: 1,
        delayLabel: "+20 mins after click",
        waitDays: 0,
        subject: "[Final 48h] Priority seat allocation for {{company_name}} — Cohort 5",
        previewText: "Complete your Founders Accelerator Cohort 5 enrolment",
        body: "Hi {{first_name}},\n\nFinal seats for {{company_name}} in our Founders Accelerator Cohort 5 close this Friday at 17:00 WAT.\n\nConfirm your priority allocation via https://p23africa.com/programmes/cohort-5-priority-seat before waitlisted founders are admitted.\n\nRegards,\n{{owner_name}}",
        openRatePct: 61.5,
        clickRatePct: 26.4,
        replyRatePct: 12.8,
      },
    ],
  },
  {
    id: "wf-customer-renewal-winback",
    name: "At-Risk Account Health & 21-Day Win-Back Sequence",
    engine: "B2B Market Entry",
    status: "Paused",
    automationType: "re_engagement_winback",
    tone: "warm_consultative",
    trigger: "inactivity_21d",
    audienceSegmentId: "aud-dormant-winback",
    audienceName: "At-Risk Customers & Stalled CRM Opportunities",
    sourceModule: "Customers",
    linkedCampaignId: "camp-referral-rewards",
    linkedCampaignName: "Referral Rewards",
    prospectName: "Kelechi Okafor",
    prospectCompany: "BluePeak Strategy Partners",
    prospectEmail: "kelechi@bluepeak.africa",
    prospectRole: "Senior Partner",
    selectedContactIds: ["crm-contact-5"],
    enrolledCount: 410,
    sentCount: 1120,
    deliveredCount: 1102,
    deliveredRatePct: 98.4,
    openedCount: 596,
    openRatePct: 53.2,
    clickedCount: 200,
    clickRatePct: 17.9,
    repliedCount: 128,
    replyRatePct: 11.4,
    convertedCount: 62,
    revenueAttributedUsd: 14800,
    revenueFormatted: "$14,800",
    sendWindow: "Tue–Thu · 10:00–12:00 WAT",
    sequenceDurationLabel: "10 Days (2 Steps)",
    smartLeadSyncedCount: 95,
    lastUpdatedLabel: "Yesterday",
    trackedLinks: [
      {
        id: "lnk-wb-1",
        url: "https://p23africa.com/benchmarks/q4-corridor-update",
        label: "Q4 Corridor Benchmark Update Report",
        clicks: 200,
        uniqueClicks: 174,
        ctrPct: 17.9,
      },
    ],
    steps: [
      {
        id: "wb-st-1",
        stepNumber: 1,
        delayLabel: "Day 0 (Trigger)",
        waitDays: 0,
        subject: "Checking in on {{company_name}}'s Q4 priorities in {{corridor_market}}",
        previewText: "Updated market entry & renewal roadmap for {{first_name}}",
        body: "Hi {{first_name}},\n\nIt's been a few weeks since we last reviewed {{company_name}}'s roadmap. We recently updated our {{corridor_market}} benchmark data and thought of your team: https://p23africa.com/benchmarks/q4-corridor-update\n\nAre you still prioritizing this initiative for Q4?\n\nWarmly,\n{{owner_name}}",
        openRatePct: 53.2,
        clickRatePct: 17.9,
        replyRatePct: 11.4,
      },
    ],
  },
];

export const INITIAL_TRACKING_EVENTS: EmailTrackingEventRecord[] = [
  {
    id: "evt-1",
    workflowId: "wf-smart-lead-signal-trigger",
    workflowName: "Smart Lead AI Intent Signal Rapid Outreach",
    eventType: "clicked",
    recipientEmail: "w.mwangi@korasystems.co.ke",
    recipientName: "Wanjiku Mwangi",
    companyName: "Kora Systems",
    linkUrl: "https://p23africa.com/maps/east-africa-partner-ecosystem",
    sourceModule: "Smart Lead",
    timestamp: "2m ago",
  },
  {
    id: "evt-2",
    workflowId: "wf-b2b-west-africa-cfo",
    workflowName: "West Africa Market Entry Executive Nurture",
    eventType: "opened",
    recipientEmail: "chidi.nwosu@techglobal.ng",
    recipientName: "Chidi Nwosu",
    companyName: "TechGlobal Ltd",
    sourceModule: "Email Automation",
    timestamp: "6m ago",
  },
  {
    id: "evt-3",
    workflowId: "wf-membership-q4-onboarding",
    workflowName: "Executive Membership Welcome & 30-Day Activation",
    eventType: "delivered",
    recipientEmail: "tunde@apexinfrastructure.ng",
    recipientName: "Tunde Bakare",
    companyName: "Apex Infrastructure Ltd",
    sourceModule: "CRM",
    timestamp: "11m ago",
  },
  {
    id: "evt-4",
    workflowId: "wf-founders-cohort-5-countdown",
    workflowName: "Founders Accelerator Cohort 5 Application Countdown",
    eventType: "clicked",
    recipientEmail: "amina@paystackscale.io",
    recipientName: "Amina Mensah",
    companyName: "Paystack Scale Tech",
    linkUrl: "https://p23africa.com/programmes/cohort-5-priority-seat",
    sourceModule: "Email Automation",
    timestamp: "18m ago",
  },
];

// ============================================================================
// DEDICATED EMAIL AUTOMATION ANALYTICS CONTRACT (TICKET 3 & 7 REQUIREMENT)
// ============================================================================

export interface EmailAutomationAnalyticsOverview {
  totalEmailsSent: number;
  totalEmailsSentFormatted: string;
  sentDeltaPct: number;
  totalDelivered: number;
  totalDeliveredFormatted: string;
  deliverabilityRatePct: number;
  totalOpened: number;
  totalOpenedFormatted: string;
  openRatePct: number;
  openRateDeltaPct: number;
  totalClicked: number;
  totalClickedFormatted: string;
  clickThroughRatePct: number;
  clickRateDeltaPct: number;
  totalReplied: number;
  replyRatePct: number;
  replyRateDeltaPct: number;
  unsubscribeRatePct: number;
  bounceRatePct: number;
  automatedRevenueUsd: number;
  automatedRevenueFormatted: string;
  revenueDeltaPct: number;
  activeWorkflowsCount: number;
  smartLeadSyncedEmails: number;
  topTrackedLinks: TrackedLinkItem[];
  performanceByTone: Array<{
    toneId: AiToneId;
    toneLabel: string;
    sent: number;
    openRatePct: number;
    clickRatePct: number;
    replyRatePct: number;
    conversions: number;
    color: string;
  }>;
  performanceByType: Array<{
    typeId: AutomationTypeId;
    typeLabel: string;
    workflows: number;
    enrolled: number;
    openRatePct: number;
    clickRatePct: number;
    conversionRatePct: number;
    revenueFormatted: string;
    color: string;
  }>;
  sequenceFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
    dropOffNote: string;
    color: string;
  }>;
  dailyEngagementTrend: Array<{
    day: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
  }>;
}

export const EMAIL_AUTOMATION_ANALYTICS_DATA: EmailAutomationAnalyticsOverview = {
  totalEmailsSent: 13720,
  totalEmailsSentFormatted: "13,720",
  sentDeltaPct: 24.6,
  totalDelivered: 13585,
  totalDeliveredFormatted: "13,585",
  deliverabilityRatePct: 99.0,
  totalOpened: 8825,
  totalOpenedFormatted: "8,825",
  openRatePct: 64.2,
  openRateDeltaPct: 8.4,
  totalClicked: 3399,
  totalClickedFormatted: "3,399",
  clickThroughRatePct: 24.8,
  clickRateDeltaPct: 5.2,
  totalReplied: 2063,
  replyRatePct: 15.7,
  replyRateDeltaPct: 4.1,
  unsubscribeRatePct: 0.4,
  bounceRatePct: 1.0,
  automatedRevenueUsd: 199000,
  automatedRevenueFormatted: "$199,000",
  revenueDeltaPct: 21.8,
  activeWorkflowsCount: 4,
  smartLeadSyncedEmails: 2340,
  topTrackedLinks: [
    {
      id: "top-lnk-1",
      url: "https://p23africa.com/playbooks/west-africa-regulatory-2026",
      label: "West Africa Regulatory & Tax Playbook PDF",
      clicks: 1140,
      uniqueClicks: 920,
      ctrPct: 28.4,
    },
    {
      id: "top-lnk-2",
      url: "https://p23africa.com/maps/east-africa-partner-ecosystem",
      label: "East Africa Partner & Regulatory Map (Smart Lead)",
      clicks: 895,
      uniqueClicks: 740,
      ctrPct: 26.8,
    },
    {
      id: "top-lnk-3",
      url: "https://cal.p23africa.com/corridor-advisory",
      label: "1:1 Corridor Executive Advisory Booking Link",
      clicks: 784,
      uniqueClicks: 650,
      ctrPct: 23.1,
    },
    {
      id: "top-lnk-4",
      url: "https://p23africa.com/programmes/cohort-5-priority-seat",
      label: "Founders Accelerator Cohort 5 Priority Seat Allocation",
      clicks: 580,
      uniqueClicks: 492,
      ctrPct: 21.5,
    },
  ],
  performanceByTone: [
    {
      toneId: "founder_casual",
      toneLabel: "Founder-to-Founder Direct",
      sent: 3420,
      openRatePct: 69.4,
      clickRatePct: 27.8,
      replyRatePct: 19.6,
      conversions: 248,
      color: "#14b8a6",
    },
    {
      toneId: "executive_corporate",
      toneLabel: "Executive Authority",
      sent: 4860,
      openRatePct: 64.8,
      clickRatePct: 23.4,
      replyRatePct: 15.2,
      conversions: 304,
      color: "#3b82f6",
    },
    {
      toneId: "warm_consultative",
      toneLabel: "Warm Consultative",
      sent: 3120,
      openRatePct: 63.1,
      clickRatePct: 24.2,
      replyRatePct: 14.8,
      conversions: 265,
      color: "#8b5cf6",
    },
    {
      toneId: "urgent_action",
      toneLabel: "High-Momentum Action",
      sent: 2320,
      openRatePct: 61.5,
      clickRatePct: 26.4,
      replyRatePct: 12.8,
      conversions: 127,
      color: "#ec4899",
    },
  ],
  performanceByType: [
    {
      typeId: "sequential_nurture",
      typeLabel: "Sequential Drip & Nurture",
      workflows: 2,
      enrolled: 1420,
      openRatePct: 64.8,
      clickRatePct: 23.4,
      conversionRatePct: 21.4,
      revenueFormatted: "$74,200",
      color: "#3b82f6",
    },
    {
      typeId: "behavioral_trigger",
      typeLabel: "Behavioral & Smart Lead Trigger",
      workflows: 1,
      enrolled: 865,
      openRatePct: 69.4,
      clickRatePct: 27.8,
      conversionRatePct: 24.8,
      revenueFormatted: "$52,800",
      color: "#14b8a6",
    },
    {
      typeId: "onboarding_welcome",
      typeLabel: "Onboarding & Welcome Series",
      workflows: 1,
      enrolled: 960,
      openRatePct: 66.2,
      clickRatePct: 25.9,
      conversionRatePct: 24.6,
      revenueFormatted: "$34,600",
      color: "#8b5cf6",
    },
    {
      typeId: "event_programme_countdown",
      typeLabel: "Event & Cohort Countdown",
      workflows: 1,
      enrolled: 840,
      openRatePct: 61.5,
      clickRatePct: 26.4,
      conversionRatePct: 15.1,
      revenueFormatted: "$22,600",
      color: "#ec4899",
    },
    {
      typeId: "re_engagement_winback",
      typeLabel: "Re-Engagement & Win-Back",
      workflows: 1,
      enrolled: 410,
      openRatePct: 53.2,
      clickRatePct: 17.9,
      conversionRatePct: 15.1,
      revenueFormatted: "$14,800",
      color: "#f59e0b",
    },
  ],
  sequenceFunnel: [
    {
      stage: "Sent (Dispatched)",
      count: 13720,
      percentage: 100,
      dropOffNote: "All triggered automation sends across 3 engines & Smart Lead",
      color: "#022228",
    },
    {
      stage: "Delivered to Inbox",
      count: 13585,
      percentage: 99.0,
      dropOffNote: "1.0% soft/hard bounce guardrailed",
      color: "#0d9488",
    },
    {
      stage: "Opened Email",
      count: 8825,
      percentage: 64.2,
      dropOffNote: "+8.4% above B2B Africa benchmark",
      color: "#7c3aed",
    },
    {
      stage: "Link Performance (Clicks)",
      count: 3399,
      percentage: 24.8,
      dropOffNote: "Deck views, syllabus clicks & calendar links",
      color: "#2563eb",
    },
    {
      stage: "Replied / Converted Deal",
      count: 944,
      percentage: 15.7,
      dropOffNote: "$199,000 attributed pipeline conversion",
      color: "#16a34a",
    },
  ],
  dailyEngagementTrend: [
    { day: "Mon", sent: 1840, delivered: 1822, opened: 1190, clicked: 460, replied: 290 },
    { day: "Tue", sent: 2420, delivered: 2398, opened: 1620, clicked: 640, replied: 410 },
    { day: "Wed", sent: 2560, delivered: 2536, opened: 1710, clicked: 685, replied: 435 },
    { day: "Thu", sent: 2390, delivered: 2368, opened: 1580, clicked: 615, replied: 385 },
    { day: "Fri", sent: 1980, delivered: 1960, opened: 1230, clicked: 475, replied: 295 },
    { day: "Sat", sent: 1240, delivered: 1226, opened: 740, clicked: 260, replied: 165 },
    { day: "Sun", sent: 1290, delivered: 1275, opened: 755, clicked: 264, replied: 174 },
  ],
};

// ============================================================================
// SHARED PERSISTENT STORE & BACK-END TRACKING SYNC (TICKETS 4, 5, 6, 7)
// ============================================================================

const EMAIL_AUTOMATION_STORAGE_KEY = "p23-email-automation-store:v2";
const EMAIL_AUTOMATION_SYNC_EVENT = "p23-email-automation-updated";

export interface EmailAutomationStoreState {
  workflows: EmailAutomationWorkflow[];
  trackingEvents: EmailTrackingEventRecord[];
  smartLeadSyncedEmails: number;
}

let memoryEmailStore: EmailAutomationStoreState | null = null;

function buildInitialEmailStore(): EmailAutomationStoreState {
  return {
    workflows: INITIAL_EMAIL_WORKFLOWS.map((w) => ({
      ...w,
      steps: w.steps.map((s) => ({ ...s })),
      trackedLinks: w.trackedLinks ? w.trackedLinks.map((l) => ({ ...l })) : [],
    })),
    trackingEvents: [...INITIAL_TRACKING_EVENTS],
    smartLeadSyncedEmails: EMAIL_AUTOMATION_ANALYTICS_DATA.smartLeadSyncedEmails,
  };
}

export function getEmailAutomationStore(): EmailAutomationStoreState {
  if (memoryEmailStore) return memoryEmailStore;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(EMAIL_AUTOMATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EmailAutomationStoreState;
        if (parsed && Array.isArray(parsed.workflows) && parsed.workflows.length > 0) {
          memoryEmailStore = parsed;
          return memoryEmailStore;
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  memoryEmailStore = buildInitialEmailStore();
  return memoryEmailStore;
}

export function saveEmailAutomationStore(next: EmailAutomationStoreState) {
  memoryEmailStore = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(EMAIL_AUTOMATION_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EMAIL_AUTOMATION_SYNC_EVENT));
    } catch {
      // ignore quota errors
    }
  }
}

export function resetEmailAutomationStore(): EmailAutomationStoreState {
  const fresh = buildInitialEmailStore();
  saveEmailAutomationStore(fresh);
  return fresh;
}

export function subscribeEmailAutomationStore(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener(EMAIL_AUTOMATION_SYNC_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EMAIL_AUTOMATION_SYNC_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Ticket 7: Dynamically computes aggregate Sent, Delivered, Opened, and Link Performance (Clicks)
 * across all active & paused workflows, staying 100% in sync between Smart Lead, Campaigns,
 * the Email Automation Dashboard, and the Analytics tab.
 */
export function computeDynamicEmailPerformance(
  store: EmailAutomationStoreState = getEmailAutomationStore()
) {
  const workflows = store.workflows;
  const totalSent = workflows.reduce((acc, w) => acc + w.sentCount, 0);
  const totalDelivered = workflows.reduce((acc, w) => acc + (w.deliveredCount ?? Math.round(w.sentCount * (w.deliveredRatePct / 100))), 0);
  const totalOpened = workflows.reduce((acc, w) => acc + (w.openedCount ?? Math.round(w.sentCount * (w.openRatePct / 100))), 0);
  const totalClicked = workflows.reduce((acc, w) => acc + (w.clickedCount ?? Math.round(w.sentCount * (w.clickRatePct / 100))), 0);
  const totalReplied = workflows.reduce((acc, w) => acc + (w.repliedCount ?? Math.round(w.sentCount * (w.replyRatePct / 100))), 0);
  const totalRevenueUsd = workflows.reduce((acc, w) => acc + w.revenueAttributedUsd, 0);
  const totalConverted = workflows.reduce((acc, w) => acc + w.convertedCount, 0);
  const smartLeadSynced = workflows.reduce((acc, w) => acc + (w.smartLeadSyncedCount ?? (w.sourceModule === "Smart Lead" ? w.sentCount : 0)), 0);

  const deliverabilityRatePct =
    totalSent > 0 ? Number(((totalDelivered / totalSent) * 100).toFixed(1)) : 99.0;
  const openRatePct =
    totalSent > 0 ? Number(((totalOpened / totalSent) * 100).toFixed(1)) : 64.2;
  const clickRatePct =
    totalSent > 0 ? Number(((totalClicked / totalSent) * 100).toFixed(1)) : 24.8;
  const replyRatePct =
    totalSent > 0 ? Number(((totalReplied / totalSent) * 100).toFixed(1)) : 15.7;

  const allTrackedLinks: TrackedLinkItem[] = workflows.flatMap(
    (w) => w.trackedLinks ?? []
  );

  return {
    totalSent,
    totalSentFormatted: totalSent.toLocaleString("en-US"),
    totalDelivered,
    totalDeliveredFormatted: totalDelivered.toLocaleString("en-US"),
    deliverabilityRatePct,
    totalOpened,
    totalOpenedFormatted: totalOpened.toLocaleString("en-US"),
    openRatePct,
    totalClicked,
    totalClickedFormatted: totalClicked.toLocaleString("en-US"),
    clickRatePct,
    totalReplied,
    totalRepliedFormatted: totalReplied.toLocaleString("en-US"),
    replyRatePct,
    totalRevenueUsd,
    totalRevenueFormatted: `$${totalRevenueUsd.toLocaleString("en-US")}`,
    totalConverted,
    smartLeadSynced,
    smartLeadSyncedFormatted: smartLeadSynced.toLocaleString("en-US"),
    activeWorkflowsCount: workflows.filter((w) => w.status === "Active").length,
    allTrackedLinks,
  };
}

/**
 * Ticket 7: Dispatches a batch of automated emails or records a tracking event
 * (Sent -> Delivered -> Opened -> Link Clicked) and updates metrics dynamically.
 */
export function recordEmailDispatchAndTrackingEvent(params: {
  workflowId?: string;
  batchSize?: number;
  sourceModule?: "Smart Lead" | "Email Automation" | "CRM";
  recipientName?: string;
  recipientEmail?: string;
  companyName?: string;
}): EmailAutomationStoreState {
  const store = getEmailAutomationStore();
  const targetId = params.workflowId ?? store.workflows[0]?.id;
  const batch = params.batchSize ?? 25;
  const deliveredAdd = Math.max(1, Math.round(batch * 0.99));
  const openedAdd = Math.max(1, Math.round(batch * 0.68));
  const clickedAdd = Math.max(1, Math.round(batch * 0.28));
  const repliedAdd = Math.max(1, Math.round(batch * 0.16));

  let targetWfName = "AI Email Sequence";

  const updatedWorkflows = store.workflows.map((wf) => {
    if (wf.id !== targetId) return wf;
    targetWfName = wf.name;
    const nextSent = wf.sentCount + batch;
    const nextDelivered = (wf.deliveredCount ?? Math.round(wf.sentCount * 0.99)) + deliveredAdd;
    const nextOpened = (wf.openedCount ?? Math.round(wf.sentCount * (wf.openRatePct / 100))) + openedAdd;
    const nextClicked = (wf.clickedCount ?? Math.round(wf.sentCount * (wf.clickRatePct / 100))) + clickedAdd;
    const nextReplied = (wf.repliedCount ?? Math.round(wf.sentCount * (wf.replyRatePct / 100))) + repliedAdd;

    const nextDeliveredPct = Number(((nextDelivered / nextSent) * 100).toFixed(1));
    const nextOpenPct = Number(((nextOpened / nextSent) * 100).toFixed(1));
    const nextClickPct = Number(((nextClicked / nextSent) * 100).toFixed(1));
    const nextReplyPct = Number(((nextReplied / nextSent) * 100).toFixed(1));

    const nextLinks = (wf.trackedLinks ?? []).map((lnk, idx) =>
      idx === 0
        ? {
            ...lnk,
            clicks: lnk.clicks + clickedAdd,
            uniqueClicks: lnk.uniqueClicks + Math.max(1, clickedAdd - 1),
          }
        : lnk
    );

    return {
      ...wf,
      sentCount: nextSent,
      deliveredCount: nextDelivered,
      deliveredRatePct: Math.min(99.9, nextDeliveredPct),
      openedCount: nextOpened,
      openRatePct: Math.min(98.0, nextOpenPct),
      clickedCount: nextClicked,
      clickRatePct: Math.min(95.0, nextClickPct),
      repliedCount: nextReplied,
      replyRatePct: Math.min(90.0, nextReplyPct),
      smartLeadSyncedCount:
        (wf.smartLeadSyncedCount ?? 0) +
        (params.sourceModule === "Smart Lead" || wf.sourceModule === "Smart Lead" ? batch : 0),
      trackedLinks: nextLinks,
      lastUpdatedLabel: "Just now",
    };
  });

  const newEvent: EmailTrackingEventRecord = {
    id: `evt-${Date.now()}`,
    workflowId: targetId ?? "wf-b2b-west-africa-cfo",
    workflowName: targetWfName,
    eventType: "clicked",
    recipientName: params.recipientName ?? "Chidi Nwosu",
    recipientEmail: params.recipientEmail ?? "chidi.nwosu@techglobal.ng",
    companyName: params.companyName ?? "TechGlobal Ltd",
    linkUrl: "https://p23africa.com/playbooks/west-africa-regulatory-2026",
    sourceModule: params.sourceModule ?? "Smart Lead",
    timestamp: "Just now",
  };

  const nextStore: EmailAutomationStoreState = {
    workflows: updatedWorkflows,
    trackingEvents: [newEvent, ...store.trackingEvents.slice(0, 14)],
    smartLeadSyncedEmails: store.smartLeadSyncedEmails + batch,
  };

  saveEmailAutomationStore(nextStore);
  return nextStore;
}
