"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Layers,
  Link2,
  Mail,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Target,
  Trash2,
  UserCheck,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  AI_TONE_SPECS,
  AUTOMATION_TYPE_SPECS,
  CAMPAIGN_ACTIVATION_OPTIONS,
  CRM_CONTACT_TARGETS,
  TARGET_AUDIENCE_SEGMENTS,
  TRIGGER_CONFIG_SPECS,
  applyAiToneToStep,
  computeDynamicEmailPerformance,
  getAiRecommendationForAudience,
  getEmailAutomationStore,
  recordEmailDispatchAndTrackingEvent,
  saveEmailAutomationStore,
  subscribeEmailAutomationStore,
  type AiToneId,
  type AutomationStatus,
  type AutomationTypeId,
  type EmailAutomationStoreState,
  type EmailAutomationWorkflow,
  type EmailBusinessEngine,
  type EmailSequenceStep,
  type TriggerEventId,
} from "@/lib/api/contracts/email-automation";

const MERGE_TAGS = [
  "{{first_name}}",
  "{{company_name}}",
  "{{corridor_market}}",
  "{{primary_engine}}",
  "{{intent_signal_summary}}",
  "{{owner_name}}",
  "{{owner_calendar_link}}",
] as const;

type WorkspaceTab =
  | "workflows"
  | "template-studio"
  | "audience-triggers"
  | "performance-metrics"
  | "ai-specs";

function EngineBadge({
  engine,
  activeRow = false,
}: {
  engine: EmailBusinessEngine;
  activeRow?: boolean;
}) {
  if (activeRow) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-[#2ae9c9] whitespace-nowrap">
        {engine}
      </span>
    );
  }
  const styles: Record<EmailBusinessEngine, { bg: string; text: string }> = {
    "B2B Market Entry": { bg: "#dbeafe", text: "#1d4ed8" },
    Membership: { bg: "#ede9fe", text: "#6d28d9" },
    "Paid Programmes": { bg: "#ccfbf1", text: "#0f766e" },
  };
  const s = styles[engine];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {engine}
    </span>
  );
}

function StatusPill({
  status,
  activeRow = false,
}: {
  status: AutomationStatus;
  activeRow?: boolean;
}) {
  if (status === "Active") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
          activeRow
            ? "bg-[#2ae9c9]/20 text-[#2ae9c9]"
            : "bg-[#ecfccb] text-[#15803d]"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            activeRow ? "bg-[#2ae9c9]" : "bg-[#16a34a]"
          }`}
        />
        Active
      </span>
    );
  }
  if (status === "Paused") {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
          activeRow
            ? "bg-amber-400/20 text-amber-300"
            : "bg-[#fef3c7] text-[#b45309]"
        }`}
      >
        Paused
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
        activeRow
          ? "bg-white/15 text-white/80"
          : "bg-slate-100 text-[#475569]"
      }`}
    >
      Draft
    </span>
  );
}

function AutomationScoreGauge({
  score,
  dark = false,
}: {
  score: number;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative grid size-[34px] place-items-center">
        <span
          className={`sales-gauge-spin absolute inset-0 rounded-full border-[2.5px] border-[#2ae9c9] border-l-transparent rotate-[-35deg] ${
            dark ? "bg-[#153841]" : "bg-white"
          }`}
        />
        <span
          className={`absolute inset-[3.5px] rounded-full ${
            dark ? "bg-[#14343e]" : "bg-white"
          }`}
        />
        <span
          className={`relative text-[8.5px] font-bold tabular-nums ${
            dark ? "text-white" : "text-[#09232d]"
          }`}
        >
          {Math.round(score)}%
        </span>
      </div>
      <span
        className={`mt-0.5 text-[7.5px] leading-tight font-medium ${
          dark ? "text-white/80" : "text-[#616263]"
        }`}
      >
        Open Rate
      </span>
    </div>
  );
}

export function EmailAutomationView({
  embeddedInCampaigns = false,
}: {
  embeddedInCampaigns?: boolean;
}) {
  const searchParams = useSearchParams();
  const sourceModuleParam = searchParams?.get("source") ?? null;

  const [storeState, setStoreState] = useState<EmailAutomationStoreState>(() =>
    getEmailAutomationStore()
  );

  useEffect(() => {
    setStoreState(getEmailAutomationStore());
    return subscribeEmailAutomationStore(() => {
      setStoreState({ ...getEmailAutomationStore() });
    });
  }, []);

  const workflows = storeState.workflows;

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    () => workflows[0]?.id ?? "wf-b2b-west-africa-cfo"
  );
  const [selectedStepId, setSelectedStepId] = useState<string>(
    () => workflows[0]?.steps[0]?.id ?? "st-1"
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("workflows");

  // Filtering
  const [statusFilter, setStatusFilter] = useState<"All" | AutomationStatus>(
    "All"
  );
  const [engineFilter, setEngineFilter] = useState<
    "All engines" | EmailBusinessEngine
  >("All engines");
  const [searchQuery, setSearchQuery] = useState("");
  const [smartLeadAutoSync, setSmartLeadAutoSync] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ticket 4: Edit Prospect Details & Workflow Settings Modal
  const [editSettingsWorkflowId, setEditSettingsWorkflowId] = useState<
    string | null
  >(null);
  const [editWfName, setEditWfName] = useState("");
  const [editProspectName, setEditProspectName] = useState("");
  const [editProspectCompany, setEditProspectCompany] = useState("");
  const [editProspectEmail, setEditProspectEmail] = useState("");
  const [editSendWindow, setEditSendWindow] = useState("");

  // Ticket 5 & 6: "Create Automation" Flow & AI Workflow Builder Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<"ai" | "scratch">("ai");
  const [audienceTargetMode, setAudienceTargetMode] = useState<
    "segment" | "contacts"
  >("segment");
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(
    TARGET_AUDIENCE_SEGMENTS[0].id
  );
  const [selectedCrmContactIds, setSelectedCrmContactIds] = useState<string[]>([
    CRM_CONTACT_TARGETS[0].id,
  ]);
  const [customWorkflowName, setCustomWorkflowName] = useState("");
  const [overrideType, setOverrideType] = useState<AutomationTypeId | null>(
    null
  );
  const [overrideTone, setOverrideTone] = useState<AiToneId | null>(null);
  const [overrideTrigger, setOverrideTrigger] = useState<TriggerEventId | null>(
    null
  );
  const [selectedCampaignActivationId, setSelectedCampaignActivationId] =
    useState<string>(CAMPAIGN_ACTIVATION_OPTIONS[0].id);
  const [customSendInterval, setCustomSendInterval] = useState<string>(
    "Tue–Thu · 09:30–11:30 WAT"
  );
  const [builderSteps, setBuilderSteps] = useState<EmailSequenceStep[]>(() => {
    const rec = getAiRecommendationForAudience(TARGET_AUDIENCE_SEGMENTS[0].id);
    return rec.suggestedSteps;
  });
  const [activeBuilderStepIdx, setActiveBuilderStepIdx] = useState<number>(0);

  // Test email recipient
  const [testEmailAddress, setTestEmailAddress] = useState(
    "emmanuel@p23africa.com"
  );

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }

  function updateWorkflows(
    updater: (prev: EmailAutomationWorkflow[]) => EmailAutomationWorkflow[]
  ) {
    const current = getEmailAutomationStore();
    const nextWorkflows = updater(current.workflows);
    const nextStore: EmailAutomationStoreState = {
      ...current,
      workflows: nextWorkflows,
    };
    saveEmailAutomationStore(nextStore);
    setStoreState(nextStore);
  }

  const aiRec = useMemo(
    () =>
      getAiRecommendationForAudience(
        selectedAudienceId,
        audienceTargetMode === "contacts" ? selectedCrmContactIds : undefined
      ),
    [selectedAudienceId, audienceTargetMode, selectedCrmContactIds]
  );

  const effectiveType = overrideType ?? aiRec.automationType.id;
  const effectiveTone = overrideTone ?? aiRec.tone.id;
  const effectiveTrigger = overrideTrigger ?? aiRec.trigger.id;

  // Synchronize builder steps when audience, tone, or creation mode changes inside Create Automation modal
  function syncBuilderWithAiBlueprint(
    nextAudienceId = selectedAudienceId,
    nextToneId?: AiToneId,
    nextContactIds = selectedCrmContactIds,
    nextTargetMode = audienceTargetMode
  ) {
    const rec = getAiRecommendationForAudience(
      nextAudienceId,
      nextTargetMode === "contacts" ? nextContactIds : undefined
    );
    const toneToUse = nextToneId ?? overrideTone ?? rec.tone.id;
    const contactNote =
      nextTargetMode === "contacts" && rec.primaryContact
        ? `Tailored for ${rec.primaryContact.name} (${rec.primaryContact.roleTitle} at ${rec.primaryContact.companyName}) — ${rec.primaryContact.intentSignalSummary}`
        : undefined;

    const synced = rec.suggestedSteps.map((st, idx) =>
      applyAiToneToStep(
        { ...st, id: `bld-step-${idx + 1}` },
        toneToUse,
        rec.audience.engine,
        contactNote
      )
    );
    setBuilderSteps(synced);
    setActiveBuilderStepIdx(0);
  }

  function handleOpenCreateAutomationModal(mode: "ai" | "scratch" = "ai") {
    setCreationMode(mode);
    if (mode === "scratch") {
      setBuilderSteps([
        {
          id: `scratch-step-1`,
          stepNumber: 1,
          delayLabel: "Day 0 (Immediate)",
          waitDays: 0,
          subject: "Introduction: {{company_name}} × P23 Africa",
          previewText: " Strategic partnership overview for {{first_name}}",
          body: "Hi {{first_name}},\n\nReaching out regarding {{company_name}}'s growth across {{corridor_market}}.\n\nLet's connect: {{owner_calendar_link}}\n\nBest,\n{{owner_name}}",
          openRatePct: 65.0,
          clickRatePct: 22.0,
          replyRatePct: 14.0,
        },
      ]);
      setActiveBuilderStepIdx(0);
    } else {
      syncBuilderWithAiBlueprint(selectedAudienceId);
    }
    setCreateModalOpen(true);
  }

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((wf) => {
      if (statusFilter !== "All" && wf.status !== statusFilter) return false;
      if (engineFilter !== "All engines" && wf.engine !== engineFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = wf.name.toLowerCase().includes(q);
        const matchAudience = wf.audienceName.toLowerCase().includes(q);
        const matchEngine = wf.engine.toLowerCase().includes(q);
        const matchProspect =
          (wf.prospectName ?? "").toLowerCase().includes(q) ||
          (wf.prospectCompany ?? "").toLowerCase().includes(q);
        if (!matchName && !matchAudience && !matchEngine && !matchProspect) {
          return false;
        }
      }
      return true;
    });
  }, [workflows, statusFilter, engineFilter, searchQuery]);

  const selectedWorkflow = useMemo(() => {
    return (
      workflows.find((w) => w.id === selectedWorkflowId) ??
      filteredWorkflows[0] ??
      workflows[0]
    );
  }, [workflows, filteredWorkflows, selectedWorkflowId]);

  const selectedStep = useMemo(() => {
    if (!selectedWorkflow) return null;
    return (
      selectedWorkflow.steps.find((s) => s.id === selectedStepId) ??
      selectedWorkflow.steps[0] ??
      null
    );
  }, [selectedWorkflow, selectedStepId]);

  const dynamicPerf = useMemo(
    () => computeDynamicEmailPerformance(storeState),
    [storeState]
  );

  function handleSelectWorkflow(wf: EmailAutomationWorkflow) {
    setSelectedWorkflowId(wf.id);
    if (wf.steps.length > 0) {
      setSelectedStepId(wf.steps[0].id);
    }
  }

  // Ticket 4: Pause / Resume active automation
  function handleToggleWorkflowStatus(id: string) {
    updateWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const nextStatus: AutomationStatus =
          w.status === "Active" ? "Paused" : "Active";
        showToast(`Automation "${w.name}" is now ${nextStatus}`);
        return { ...w, status: nextStatus, lastUpdatedLabel: "Just now" };
      })
    );
  }

  // Ticket 4: Delete automation
  function handleDeleteWorkflow(id: string) {
    const target = workflows.find((w) => w.id === id);
    if (!target) return;
    updateWorkflows((prev) => {
      const remaining = prev.filter((w) => w.id !== id);
      if (selectedWorkflowId === id && remaining.length > 0) {
        setSelectedWorkflowId(remaining[0].id);
        if (remaining[0].steps[0]) {
          setSelectedStepId(remaining[0].steps[0].id);
        }
      }
      return remaining;
    });
    showToast(`Deleted automation "${target.name}"`);
  }

  // Ticket 4: Open Prospect Details & Workflow Settings Editor
  function handleOpenEditSettingsModal(wf: EmailAutomationWorkflow) {
    setEditSettingsWorkflowId(wf.id);
    setEditWfName(wf.name);
    setEditProspectName(wf.prospectName ?? "Chidi Nwosu");
    setEditProspectCompany(wf.prospectCompany ?? "TechGlobal Ltd");
    setEditProspectEmail(wf.prospectEmail ?? "chidi.nwosu@techglobal.ng");
    setEditSendWindow(wf.sendWindow);
  }

  function handleSaveWorkflowSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!editSettingsWorkflowId) return;
    updateWorkflows((prev) =>
      prev.map((w) =>
        w.id === editSettingsWorkflowId
          ? {
              ...w,
              name: editWfName.trim() || w.name,
              prospectName: editProspectName.trim() || w.prospectName,
              prospectCompany: editProspectCompany.trim() || w.prospectCompany,
              prospectEmail: editProspectEmail.trim() || w.prospectEmail,
              sendWindow: editSendWindow.trim() || w.sendWindow,
              lastUpdatedLabel: "Just now",
            }
          : w
      )
    );
    setEditSettingsWorkflowId(null);
    showToast(`Updated prospect & workflow settings for "${editWfName}"`);
  }

  function handleDuplicateWorkflow(wf: EmailAutomationWorkflow) {
    const copy: EmailAutomationWorkflow = {
      ...wf,
      id: `wf-copy-${Date.now()}`,
      name: `${wf.name} (Copy)`,
      status: "Active",
      lastUpdatedLabel: "Just now",
    };
    updateWorkflows((prev) => [copy, ...prev]);
    setSelectedWorkflowId(copy.id);
    showToast(`Duplicated automation "${wf.name}"`);
  }

  // Ticket 4: Create/Add steps to an existing automation (directly from row or inspector)
  function handleAddSequenceStepToWorkflow(targetWf?: EmailAutomationWorkflow) {
    const wfToUpdate = targetWf ?? selectedWorkflow;
    if (!wfToUpdate) return;
    const nextNum = wfToUpdate.steps.length + 1;
    const tone = AI_TONE_SPECS[wfToUpdate.tone];
    const newStep: EmailSequenceStep = {
      id: `st-${Date.now()}`,
      stepNumber: nextNum,
      delayLabel: `Day ${nextNum * 3} (+72h)`,
      waitDays: nextNum * 3,
      subject: `${tone.sampleSubjectPrefix} Follow-up #${nextNum} for {{company_name}}`,
      previewText: `Tailored ${wfToUpdate.engine} check-in`,
      body: `${tone.sampleOpening}\n\nChecking in on our ${wfToUpdate.engine} roadmap for {{company_name}}: https://p23africa.com/playbooks/corridor-brief\n\n${tone.sampleClosing}\n\nRegards,\n{{owner_name}}`,
      openRatePct: 58.0,
      clickRatePct: 20.5,
      replyRatePct: 14.2,
    };
    updateWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === wfToUpdate.id
          ? {
              ...wf,
              steps: [...wf.steps, newStep],
              sequenceDurationLabel: `${nextNum * 3} Days (${nextNum} Steps)`,
              lastUpdatedLabel: "Just now",
            }
          : wf
      )
    );
    setSelectedWorkflowId(wfToUpdate.id);
    setSelectedStepId(newStep.id);
    showToast(`Added Step ${nextNum} to "${wfToUpdate.name}"`);
  }

  function handleUpdateStepField(
    field: "subject" | "previewText" | "body" | "delayLabel",
    value: string
  ) {
    if (!selectedWorkflow || !selectedStep) return;
    updateWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== selectedWorkflow.id) return wf;
        return {
          ...wf,
          lastUpdatedLabel: "Just now",
          steps: wf.steps.map((st) =>
            st.id === selectedStep.id ? { ...st, [field]: value } : st
          ),
        };
      })
    );
  }

  function handleApplyAiToneToSelectedStep(toneId: AiToneId) {
    if (!selectedWorkflow || !selectedStep) return;
    const rewritten = applyAiToneToStep(
      selectedStep,
      toneId,
      selectedWorkflow.engine,
      selectedWorkflow.prospectName
        ? `Tailored for ${selectedWorkflow.prospectName} at ${selectedWorkflow.prospectCompany}`
        : undefined
    );
    updateWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== selectedWorkflow.id) return wf;
        return {
          ...wf,
          tone: toneId,
          lastUpdatedLabel: "Just now",
          steps: wf.steps.map((st) =>
            st.id === selectedStep.id ? rewritten : st
          ),
        };
      })
    );
    showToast(
      `AI rewrote Step ${selectedStep.stepNumber} in "${AI_TONE_SPECS[toneId].name}" tone`
    );
  }

  // Ticket 5: Workflow Sequence Builder inside Create Automation Modal
  function handleBuilderAddStep() {
    const nextNum = builderSteps.length + 1;
    const toneSpec = AI_TONE_SPECS[effectiveTone];
    const waitDays = nextNum * 3;
    const newStep: EmailSequenceStep = {
      id: `bld-step-${Date.now()}`,
      stepNumber: nextNum,
      delayLabel: `Wait ${waitDays} days (+${waitDays * 24}h)`,
      waitDays,
      subject: `${toneSpec.sampleSubjectPrefix} Step ${nextNum} follow-up for {{company_name}}`,
      previewText: `Follow-up ${nextNum} from P23 Africa`,
      body: `${toneSpec.sampleOpening}\n\nSharing our Step ${nextNum} resource for {{company_name}}: https://p23africa.com/playbooks/corridor-brief\n\n${toneSpec.sampleClosing}\n\nBest,\n{{owner_name}}`,
      openRatePct: 60.0,
      clickRatePct: 22.0,
      replyRatePct: 15.0,
    };
    setBuilderSteps((prev) => [...prev, newStep]);
    setActiveBuilderStepIdx(builderSteps.length);
  }

  function handleBuilderRemoveStep(idx: number) {
    if (builderSteps.length <= 1) return;
    setBuilderSteps((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
    setActiveBuilderStepIdx((prev) => Math.max(0, Math.min(prev, builderSteps.length - 2)));
  }

  function handleBuilderMoveStep(idx: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= builderSteps.length) return;
    setBuilderSteps((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    });
    setActiveBuilderStepIdx(targetIdx);
  }

  function handleBuilderStepFieldChange(
    idx: number,
    field: "subject" | "body" | "delayLabel" | "waitDays",
    value: string | number
  ) {
    setBuilderSteps((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        if (field === "waitDays") {
          const days = Math.max(0, Number(value) || 0);
          return {
            ...s,
            waitDays: days,
            delayLabel:
              days === 0
                ? "Day 0 (Immediate)"
                : `Wait ${days} day${days === 1 ? "" : "s"} (+${days * 24}h)`,
          };
        }
        return { ...s, [field]: value };
      })
    );
  }

  function toggleCrmContactInBuilder(contactId: string) {
    setSelectedCrmContactIds((prev) => {
      const next = prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId];
      const safeNext = next.length > 0 ? next : [contactId];
      syncBuilderWithAiBlueprint(
        selectedAudienceId,
        effectiveTone,
        safeNext,
        "contacts"
      );
      return safeNext;
    });
  }

  function handleCreateAiAutomation(e: React.FormEvent) {
    e.preventDefault();
    const aud = aiRec.audience;
    const typeSpec = AUTOMATION_TYPE_SPECS[effectiveType];
    const campaignOpt =
      CAMPAIGN_ACTIVATION_OPTIONS.find(
        (c) => c.id === selectedCampaignActivationId
      ) ?? CAMPAIGN_ACTIVATION_OPTIONS[0];

    const chosenContacts = CRM_CONTACT_TARGETS.filter((c) =>
      selectedCrmContactIds.includes(c.id)
    );
    const leadContact = chosenContacts[0] ?? CRM_CONTACT_TARGETS[0];

    const audienceDisplayName =
      audienceTargetMode === "contacts"
        ? chosenContacts.length === 1
          ? `${leadContact.name} (${leadContact.companyName})`
          : `${chosenContacts.length} Selected CRM Contacts (${ chosenContacts.map((c) => c.companyName).join(", ") })`
        : aud.name;

    const enrolledTotal =
      audienceTargetMode === "contacts"
        ? chosenContacts.length
        : aud.recipientCount;

    const wfName =
      customWorkflowName.trim() ||
      `${aud.engine}: ${typeSpec.shortLabel} (${
        audienceTargetMode === "contacts"
          ? leadContact.companyName
          : aud.sourceModule
      })`;

    const totalDurationDays = builderSteps.reduce(
      (sum, st) => sum + (st.waitDays ?? 3),
      0
    );

    const created: EmailAutomationWorkflow = {
      id: `wf-ai-${Date.now()}`,
      name: wfName,
      engine:
        audienceTargetMode === "contacts" ? leadContact.engine : aud.engine,
      status: "Active",
      automationType: effectiveType,
      tone: effectiveTone,
      trigger: effectiveTrigger,
      audienceSegmentId: aud.id,
      audienceName: audienceDisplayName,
      sourceModule:
        audienceTargetMode === "contacts"
          ? leadContact.sourceModule
          : aud.sourceModule,
      linkedCampaignId: campaignOpt.id,
      linkedCampaignName: campaignOpt.name,
      prospectName: leadContact.name,
      prospectCompany: leadContact.companyName,
      prospectEmail: leadContact.email,
      prospectRole: leadContact.roleTitle,
      selectedContactIds:
        audienceTargetMode === "contacts" ? selectedCrmContactIds : undefined,
      enrolledCount: enrolledTotal,
      sentCount: enrolledTotal,
      deliveredCount: Math.max(1, Math.round(enrolledTotal * 0.99)),
      deliveredRatePct: 99.2,
      openedCount: Math.max(1, Math.round(enrolledTotal * 0.668)),
      openRatePct: 66.8,
      clickedCount: Math.max(1, Math.round(enrolledTotal * 0.254)),
      clickRatePct: 25.4,
      repliedCount: Math.max(1, Math.round(enrolledTotal * 0.164)),
      replyRatePct: 16.4,
      convertedCount: Math.max(1, Math.round(enrolledTotal * 0.16)),
      revenueAttributedUsd: 28500,
      revenueFormatted: "$28,500",
      sendWindow: customSendInterval,
      sequenceDurationLabel: `${totalDurationDays} Days (${builderSteps.length} Steps)`,
      smartLeadSyncedCount:
        leadContact.sourceModule === "Smart Lead" ? enrolledTotal : 45,
      lastUpdatedLabel: "Just now",
      trackedLinks: [
        {
          id: `lnk-new-${Date.now()}`,
          url: "https://p23africa.com/playbooks/corridor-brief",
          label: `${aud.engine} Corridor Execution Brief`,
          clicks: Math.max(1, Math.round(enrolledTotal * 0.25)),
          uniqueClicks: Math.max(1, Math.round(enrolledTotal * 0.21)),
          ctrPct: 25.4,
        },
      ],
      steps: builderSteps.map((s, idx) => ({
        ...s,
        id: `st-new-${Date.now()}-${idx}`,
        stepNumber: idx + 1,
      })),
    };

    updateWorkflows((prev) => [created, ...prev]);
    setSelectedWorkflowId(created.id);
    setSelectedStepId(created.steps[0].id);
    setCustomWorkflowName("");
    setOverrideType(null);
    setOverrideTone(null);
    setOverrideTrigger(null);
    setCreateModalOpen(false);
    showToast(`Created & activated automation "${created.name}"`);
  }

  // Ticket 7: Live Dispatch & Tracking Simulator (updates Sent, Delivered, Opened, Link Clicks dynamically)
  function handleSimulateEmailDispatch(wf?: EmailAutomationWorkflow) {
    const target = wf ?? selectedWorkflow;
    const nextStore = recordEmailDispatchAndTrackingEvent({
      workflowId: target?.id,
      batchSize: 50,
      sourceModule:
        target?.sourceModule === "Smart Lead"
          ? "Smart Lead"
          : "Email Automation",
      recipientName: target?.prospectName ?? "Chidi Nwosu",
      recipientEmail: target?.prospectEmail ?? "chidi.nwosu@techglobal.ng",
      companyName: target?.prospectCompany ?? "TechGlobal Ltd",
    });
    setStoreState({ ...nextStore });
    showToast(
      `Dispatched 50 automated emails for "${
        target?.name ?? "Sequence"
      }" — Sent, Delivered, Opened & Link Click metrics updated`
    );
  }

  const activeBuilderStep =
    builderSteps[activeBuilderStepIdx] ?? builderSteps[0];

  return (
    <div
      className={
        embeddedInCampaigns
          ? "w-full select-none"
          : "w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 select-none"
      }
      data-testid="email-automation-dashboard"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          data-testid="email-automation-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold bg-[#0b0d14] text-white border border-white/10"
        >
          <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          HEADER & PRIMARY "CREATE AUTOMATION" CTA (TICKET 4)
          ===================================================================== */}
      {!embeddedInCampaigns && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--p23-text-eyebrow)" }}
                data-testid="email-automation-eyebrow"
              >
                CAMPAIGNS · AI EMAIL AUTOMATION ENGINE
              </p>
              {sourceModuleParam && (
                <span
                  data-testid="email-automation-source-badge"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#ede9fe] text-[#6d28d9]"
                >
                  <Sparkles className="w-3 h-3" />
                  Routed from {sourceModuleParam.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-[34px] font-bold tracking-[-0.025em] leading-tight text-[#070b16]">
              Email Automation Dashboard
            </h1>
            <p className="text-[13.5px] mt-1 text-[#64748b]">
              AI-assisted sequence builder, audience targeting, template editor, and real-time link &amp; delivery performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
            <button
              type="button"
              onClick={() => handleSimulateEmailDispatch()}
              data-testid="dispatch-automated-emails-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-[#070b16] text-xs font-semibold shadow-2xs hover:border-[#2ae9c9] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#0d9488]" />
              <span>Dispatch Batch (+50 Sends)</span>
            </button>

            <Link
              href="/analytics"
              data-testid="view-email-analytics-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-[#070b16] text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Email Analytics &amp; Reports</span>
            </Link>

            {/* Ticket 4 Primary "Create Automation" CTA Button */}
            <button
              type="button"
              onClick={() => handleOpenCreateAutomationModal("ai")}
              data-testid="new-ai-automation-btn"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0b0d14] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#2ae9c9]" />
              <span>Create Automation</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROW 1: 5 TOP-SHELF KPI CARDS — SENT, DELIVERED, OPENED, LINK CLICKS, REVENUE (TICKET 7)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {/* Card 1: Sent (Hero Teal-Ink Gradient) */}
        <div
          data-testid="kpi-emails-sent"
          className="p23-hero-revenue-card p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--p23-hero-text)" }}
            >
              Emails Sent
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "var(--p23-hero-badge-bg)",
                color: "var(--p23-hero-badge-text)",
              }}
            >
              {dynamicPerf.activeWorkflowsCount} Active Flows
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "var(--p23-hero-text)" }}
          >
            {dynamicPerf.totalSentFormatted}
          </div>

          <p
            className="text-[11.5px] font-medium"
            style={{ color: "var(--p23-hero-subtext)" }}
          >
            Synced with Smart Lead ({dynamicPerf.smartLeadSyncedFormatted}{" "}
            signals)
          </p>
        </div>

        {/* Card 2: Delivered (Electric Violet Gradient) */}
        <div
          data-testid="kpi-emails-delivered"
          className="p23-bento-card p23-kpi-card-leads p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#2e1065" }}
            >
              Delivered
            </span>
            <span
              data-testid="kpi-active-workflows"
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(109, 40, 217, 0.14)",
                color: "#4c1d95",
              }}
            >
              {dynamicPerf.deliverabilityRatePct}% rate ·{" "}
              {dynamicPerf.activeWorkflowsCount} active
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#1e1b4b" }}
          >
            {dynamicPerf.totalDeliveredFormatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#4c1d95" }}>
            DKIM &amp; SPF verified across 3 engines
          </p>
        </div>

        {/* Card 3: Opened (Mint / Aqua Emerald Gradient) */}
        <div
          data-testid="kpi-email-open-rate"
          className="p23-bento-card p23-kpi-card-conversion p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#042f2e" }}
            >
              Opened
            </span>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(13, 148, 136, 0.16)",
                color: "#115e59",
              }}
            >
              {dynamicPerf.openRatePct}% Open Rate
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#022228" }}
          >
            {dynamicPerf.totalOpenedFormatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#115e59" }}>
            AI subject &amp; WAT/EAT send-window calibrated
          </p>
        </div>

        {/* Card 4: Link Performance / Clicks (Warm Golden Amber Gradient) */}
        <div
          data-testid="kpi-email-link-clicks"
          className="p23-bento-card p23-kpi-card-opps p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#451a03" }}
            >
              Link Performance (Clicks)
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(217, 119, 6, 0.16)",
                color: "#92400e",
              }}
            >
              {dynamicPerf.clickRatePct}% CTR
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#451a03" }}
          >
            {dynamicPerf.totalClickedFormatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#78350f" }}>
            {dynamicPerf.allTrackedLinks.length} tracked playbooks &amp; booking links
          </p>
        </div>

        {/* Card 5: Attributed Revenue & Replies (Rose Orchid Gradient) */}
        <div
          data-testid="kpi-email-attributed-revenue"
          className="p23-bento-card p23-kpi-card-programmes p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#4a044e" }}
            >
              Attributed Revenue
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(192, 38, 211, 0.14)",
                color: "#701a75",
              }}
            >
              {dynamicPerf.replyRatePct}% Reply
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#3b0764" }}
          >
            {dynamicPerf.totalRevenueFormatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#701a75" }}>
            {dynamicPerf.totalConverted} converted deals across 3 engines
          </p>
        </div>
      </div>

      {/* =====================================================================
          WORKSPACE SUB-NAVIGATION TABS
          ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div
          className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs"
          role="tablist"
          aria-label="Email Automation Workspace Views"
        >
          {(
            [
              {
                id: "workflows",
                label: "Active Automation List",
                icon: <Zap className="w-3.5 h-3.5" />,
              },
              {
                id: "template-studio",
                label: "Email Template Editor",
                icon: <FileText className="w-3.5 h-3.5" />,
              },
              {
                id: "audience-triggers",
                label: "Audience Selector & Smart Lead",
                icon: <Target className="w-3.5 h-3.5" />,
              },
              {
                id: "performance-metrics",
                label: "Link & Delivery Performance",
                icon: <MousePointerClick className="w-3.5 h-3.5" />,
              },
              {
                id: "ai-specs",
                label: "AI Specs & Triggers",
                icon: <Bot className="w-3.5 h-3.5" />,
              },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`email-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0b0d14] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#070b16] hover:bg-slate-100/80"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Create Automation CTA when embedded or on any tab */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenCreateAutomationModal("ai")}
            data-testid="create-automation-toolbar-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#022228] text-[#2ae9c9] text-xs font-semibold shadow-sm hover:opacity-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: TICKET 4 — AUTOMATION LIST MODELED AFTER SOCIAL LISTENING UI PATTERN
          (Left rounded-[30px] se-table list + Right 406px dark-header detail inspector)
          ===================================================================== */}
      {activeTab === "workflows" && (
        <div
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_416px] gap-[22px] items-stretch"
          data-testid="social-listening-pattern-automation-list"
        >
          {/* LEFT COLUMN: SOCIAL LISTENING STYLE FILTER BAR + ROUNDED PILL ROW TABLE */}
          <div className="flex flex-col gap-3.5 min-w-0">
            {/* Filter Bar modeled on SocialListeningFilters */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 py-1">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-9 w-[210px] items-center gap-2 rounded-full bg-white px-3.5 shadow-[0_1px_3px_1px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.14)]">
                  <Search size={14} className="shrink-0 text-[#09232d]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="email-workflows-search"
                    className="min-w-0 flex-1 bg-transparent text-xs text-[#09232d] outline-none placeholder:text-[#616263]"
                    placeholder="Search automations or leads..."
                  />
                </label>

                {(["All", "Active", "Paused", "Draft"] as const).map((st) => {
                  const isActive = statusFilter === st;
                  const count =
                    st === "All"
                      ? workflows.length
                      : workflows.filter((w) => w.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      data-testid={`wf-status-filter-${st}`}
                      className={`inline-flex h-8 items-center gap-1.5 px-3 rounded-[10px] border text-[11px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#09232d] text-white border-[#09232d]"
                          : "bg-[#f8f8f8] text-[#34373c] border-[#d1d1d1] hover:bg-gray-100"
                      }`}
                    >
                      <span>{st}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-black/5 text-[#616263]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                <select
                  aria-label="Filter workflows by engine"
                  value={engineFilter}
                  onChange={(e) =>
                    setEngineFilter(
                      e.target.value as "All engines" | EmailBusinessEngine
                    )
                  }
                  className="h-8 rounded-[10px] border border-[#d1d1d1] bg-[#f8f8f8] px-2.5 text-[11px] font-semibold text-[#34373c]"
                >
                  <option value="All engines">All Engines</option>
                  <option value="B2B Market Entry">B2B Market Entry</option>
                  <option value="Membership">Membership</option>
                  <option value="Paid Programmes">Paid Programmes</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleOpenCreateAutomationModal("ai")}
                className="se-primary flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] border border-[#d1d1d1] bg-[#09232d] px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#0f3340] cursor-pointer"
              >
                <Sparkles size={13} className="text-[#2ae9c9]" />
                <span>Create Automation</span>
              </button>
            </div>

            {/* Social Listening Surface Table Container */}
            <section
              className="se-surface flex flex-1 min-h-0 flex-col rounded-[30px] bg-white p-3 shadow-[0_8px_12px_6px_rgba(0,0,0,0.12),0_4px_4px_rgba(0,0,0,0.22)] overflow-hidden"
              data-testid="email-workflows-table-card"
            >
              <div className="overflow-x-auto pr-1">
                <table className="se-table w-full min-w-[820px] border-separate border-spacing-y-2">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-[#333333]">
                      <th className="bg-white px-3.5 py-1.5 text-left">
                        Automation &amp; Trigger
                      </th>
                      <th className="whitespace-nowrap bg-white px-2.5 py-1.5 text-left">
                        Source
                      </th>
                      <th className="bg-white px-2.5 py-1.5 text-left">
                        Target Audience / Prospect
                      </th>
                      <th className="whitespace-nowrap bg-white px-2.5 py-1.5 text-left">
                        AI Type &amp; Vibe
                      </th>
                      <th className="whitespace-nowrap bg-white px-2.5 py-1.5 text-right">
                        Sent / Delivered
                      </th>
                      <th className="whitespace-nowrap bg-white px-2 py-1.5 text-center">
                        Open / Click
                      </th>
                      <th className="whitespace-nowrap bg-white px-3 py-1.5 text-center">
                        Row Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkflows.map((wf) => {
                      const isActive = selectedWorkflow?.id === wf.id;
                      const typeSpec = AUTOMATION_TYPE_SPECS[wf.automationType];
                      const toneSpec = AI_TONE_SPECS[wf.tone];
                      const trigSpec = TRIGGER_CONFIG_SPECS[wf.trigger];
                      const deliveredNum =
                        wf.deliveredCount ??
                        Math.round(wf.sentCount * (wf.deliveredRatePct / 100));

                      return (
                        <tr
                          key={wf.id}
                          onClick={() => handleSelectWorkflow(wf)}
                          data-testid={`workflow-row-${wf.id}`}
                          className={`se-table-row ${
                            isActive ? "se-table-row-active" : ""
                          } group cursor-pointer outline-none ${
                            isActive ? "text-white" : "text-[#616263]"
                          }`}
                        >
                          {/* 1. Automation Name, Status & Trigger */}
                          <td className="rounded-l-[23px] px-3.5 py-3">
                            <div className="flex min-w-0 items-start gap-2.5">
                              <span
                                className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold mt-0.5 ${
                                  isActive
                                    ? "bg-[#2ae9c9] text-[#022228]"
                                    : "bg-[#09232d] text-[#2ae9c9]"
                                }`}
                              >
                                <Mail className="w-4 h-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                  <StatusPill
                                    status={wf.status}
                                    activeRow={isActive}
                                  />
                                  <EngineBadge
                                    engine={wf.engine}
                                    activeRow={isActive}
                                  />
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      isActive
                                        ? "text-white/75"
                                        : "text-[#64748b]"
                                    }`}
                                  >
                                    {wf.steps.length} steps
                                  </span>
                                </div>
                                <p
                                  className={`text-xs font-bold truncate ${
                                    isActive ? "text-white" : "text-[#070b16]"
                                  }`}
                                >
                                  {wf.name}
                                </p>
                                <p
                                  className={`text-[10.5px] truncate mt-0.5 ${
                                    isActive
                                      ? "text-white/75"
                                      : "text-[#616263]"
                                  }`}
                                >
                                  Trigger: {trigSpec.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Source & Updated */}
                          <td className="whitespace-nowrap px-2.5 py-3 align-middle">
                            <p
                              className={`text-[11px] font-bold ${
                                isActive ? "text-white" : "text-[#09232d]"
                              }`}
                            >
                              {wf.sourceModule}
                            </p>
                            <p
                              className={`mt-0.5 text-[10px] ${
                                isActive
                                  ? "text-white/70"
                                  : "text-[#616263]/80"
                              }`}
                            >
                              {wf.lastUpdatedLabel}
                            </p>
                          </td>

                          {/* 3. Target Audience & Lead Prospect */}
                          <td className="px-2.5 py-3 align-middle max-w-[200px]">
                            <p
                              className={`text-[11px] font-bold truncate ${
                                isActive ? "text-white" : "text-[#070b16]"
                              }`}
                            >
                              {wf.prospectName
                                ? `${wf.prospectName} · ${wf.prospectCompany}`
                                : wf.audienceName}
                            </p>
                            <p
                              className={`text-[10px] truncate mt-0.5 ${
                                isActive ? "text-white/75" : "text-[#616263]"
                              }`}
                            >
                              {wf.enrolledCount.toLocaleString("en-US")}{" "}
                              enrolled · {wf.audienceName}
                            </p>
                          </td>

                          {/* 4. AI Type & Tone */}
                          <td className="whitespace-nowrap px-2.5 py-3 align-middle">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[9.5px] font-bold"
                                style={{
                                  backgroundColor: isActive
                                    ? "rgba(42, 233, 201, 0.22)"
                                    : typeSpec.badgeBg,
                                  color: isActive
                                    ? "#2ae9c9"
                                    : typeSpec.badgeColor,
                                }}
                              >
                                {typeSpec.shortLabel}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${
                                  isActive ? "text-white/80" : "text-[#475569]"
                                }`}
                              >
                                {toneSpec.name.split(" ")[0]} Vibe
                              </span>
                            </div>
                          </td>

                          {/* 5. Sent / Delivered (Ticket 7) */}
                          <td className="whitespace-nowrap px-2.5 py-3 align-middle text-right tabular-nums">
                            <p
                              className={`text-xs font-bold ${
                                isActive ? "text-white" : "text-[#070b16]"
                              }`}
                            >
                              {wf.sentCount.toLocaleString("en-US")} sent
                            </p>
                            <p
                              className={`text-[10px] font-semibold mt-0.5 ${
                                isActive
                                  ? "text-[#2ae9c9]"
                                  : "text-emerald-700"
                              }`}
                            >
                              {deliveredNum.toLocaleString("en-US")} deliv (
                              {wf.deliveredRatePct}%)
                            </p>
                          </td>

                          {/* 6. Open & Link Click Gauge */}
                          <td className="px-2 py-3 align-middle">
                            <div className="flex items-center justify-center gap-2">
                              <AutomationScoreGauge
                                score={wf.openRatePct}
                                dark={isActive}
                              />
                              <div className="text-left tabular-nums">
                                <span
                                  className={`block text-[10.5px] font-bold ${
                                    isActive
                                      ? "text-[#2ae9c9]"
                                      : "text-[#0d9488]"
                                  }`}
                                >
                                  {wf.clickRatePct}% CTR
                                </span>
                                <span
                                  className={`block text-[9.5px] ${
                                    isActive
                                      ? "text-white/75"
                                      : "text-[#64748b]"
                                  }`}
                                >
                                  {wf.revenueFormatted}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 7. Ticket 4 Row-Level Action Controls:
                              - Edit prospect/workflow settings
                              - Open Template Editor
                              - Add step to existing automation
                              - Pause / Resume
                              - Delete automation */}
                          <td
                            className="rounded-r-[23px] px-3 py-3 align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {/* Edit Template */}
                              <button
                                type="button"
                                data-testid={`edit-template-btn-${wf.id}`}
                                onClick={() => {
                                  handleSelectWorkflow(wf);
                                  setActiveTab("template-studio");
                                }}
                                title="Edit Email Templates"
                                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                                  isActive
                                    ? "bg-[#2ae9c9] text-[#022228]"
                                    : "bg-[#09232d] text-white hover:opacity-90"
                                }`}
                              >
                                Edit Copy
                              </button>

                              {/* Edit Prospect & Settings */}
                              <button
                                type="button"
                                data-testid={`edit-settings-btn-${wf.id}`}
                                onClick={() => handleOpenEditSettingsModal(wf)}
                                title="Edit prospect details & workflow settings"
                                className={`grid size-7 place-items-center rounded-full border transition cursor-pointer ${
                                  isActive
                                    ? "border-white/20 text-white hover:bg-white/15"
                                    : "border-slate-200 text-[#09232d] hover:bg-slate-100"
                                }`}
                              >
                                <Edit3 size={12} />
                              </button>

                              {/* Add Step to Existing Automation */}
                              <button
                                type="button"
                                data-testid={`add-step-row-btn-${wf.id}`}
                                onClick={() =>
                                  handleAddSequenceStepToWorkflow(wf)
                                }
                                title="Add step to automation"
                                className={`grid size-7 place-items-center rounded-full border transition cursor-pointer ${
                                  isActive
                                    ? "border-white/20 text-white hover:bg-white/15"
                                    : "border-slate-200 text-[#09232d] hover:bg-slate-100"
                                }`}
                              >
                                <Plus size={13} />
                              </button>

                              {/* Pause / Resume */}
                              <button
                                type="button"
                                data-testid={`pause-resume-btn-${wf.id}`}
                                onClick={() =>
                                  handleToggleWorkflowStatus(wf.id)
                                }
                                title={
                                  wf.status === "Active"
                                    ? "Pause automation"
                                    : "Resume automation"
                                }
                                className={`grid size-7 place-items-center rounded-full border transition cursor-pointer ${
                                  isActive
                                    ? "border-white/20 text-white hover:bg-white/15"
                                    : "border-slate-200 text-[#09232d] hover:bg-slate-100"
                                }`}
                              >
                                {wf.status === "Active" ? (
                                  <Pause size={12} />
                                ) : (
                                  <Play
                                    size={12}
                                    className="text-emerald-500"
                                  />
                                )}
                              </button>

                              {/* Delete Automation */}
                              <button
                                type="button"
                                data-testid={`delete-workflow-btn-${wf.id}`}
                                onClick={() => handleDeleteWorkflow(wf.id)}
                                title="Delete automation"
                                className={`grid size-7 place-items-center rounded-full border transition cursor-pointer ${
                                  isActive
                                    ? "border-rose-400/40 text-rose-300 hover:bg-rose-500/20"
                                    : "border-rose-200 text-rose-600 hover:bg-rose-50"
                                }`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SOCIAL LISTENING STYLE DETAIL ASIDE (Dark #0b242e Top Card + Sequence Steps & Link Performance) */}
          {selectedWorkflow && (
            <aside
              className="se-surface flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_8px_12px_6px_rgba(0,0,0,0.15),0_4px_4px_rgba(0,0,0,0.3)]"
              data-testid="workflow-sequence-inspector"
            >
              {/* Dark Header Banner Modeled After SocialOpportunityDetail */}
              <div className="relative shrink-0 bg-[#0b242e] px-6 pb-5 pt-6 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={selectedWorkflow.status} activeRow />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2ae9c9]">
                        {selectedWorkflow.engine}
                      </span>
                    </div>
                    <h2 className="mt-2 text-base font-bold leading-snug text-white">
                      {selectedWorkflow.name}
                    </h2>
                    <p className="mt-1 text-[11px] text-white/75">
                      Trigger:{" "}
                      <strong>
                        {TRIGGER_CONFIG_SPECS[selectedWorkflow.trigger].name}
                      </strong>
                    </p>
                  </div>

                  <AutomationScoreGauge
                    score={selectedWorkflow.openRatePct}
                    dark
                  />
                </div>

                {/* Sent / Delivered / Opened / Clicks Telemetry Strip */}
                <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-white/10 p-2.5 text-center">
                  <div>
                    <span className="block text-[9px] uppercase text-white/65">
                      Sent
                    </span>
                    <span className="text-xs font-extrabold text-white tabular-nums">
                      {selectedWorkflow.sentCount.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-white/65">
                      Delivered
                    </span>
                    <span className="text-xs font-extrabold text-[#2ae9c9] tabular-nums">
                      {selectedWorkflow.deliveredRatePct}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-white/65">
                      Opened
                    </span>
                    <span className="text-xs font-extrabold text-white tabular-nums">
                      {selectedWorkflow.openRatePct}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-white/65">
                      Link CTR
                    </span>
                    <span className="text-xs font-extrabold text-[#8dec66] tabular-nums">
                      {selectedWorkflow.clickRatePct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Prospect & Audience Row */}
              <div className="grid grid-cols-2 border-b border-[#e9e9e9] px-5 py-3 text-xs text-[#616263]">
                <div className="border-r border-[#e9e9e9] pr-3">
                  <span className="block text-[9.5px] font-bold uppercase text-slate-400">
                    Lead Prospect
                  </span>
                  <p className="font-bold text-[#09232d] truncate mt-0.5">
                    {selectedWorkflow.prospectName ?? "Chidi Nwosu"}
                  </p>
                  <p className="text-[10.5px] truncate">
                    {selectedWorkflow.prospectCompany ?? "TechGlobal Ltd"}
                  </p>
                </div>
                <div className="pl-3">
                  <span className="block text-[9.5px] font-bold uppercase text-slate-400">
                    Campaign &amp; Tone
                  </span>
                  <p className="font-bold text-[#09232d] truncate mt-0.5">
                    {AI_TONE_SPECS[selectedWorkflow.tone].name.split(" ")[0]}{" "}
                    Vibe
                  </p>
                  <p className="text-[10.5px] truncate">
                    {selectedWorkflow.linkedCampaignName ??
                      selectedWorkflow.sendWindow}
                  </p>
                </div>
              </div>

              {/* Scrollable Sequence Steps & Tracked Links */}
              <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#09232d]">
                    Sequence Steps ({selectedWorkflow.steps.length})
                  </span>
                  <button
                    type="button"
                    data-testid="inspector-add-step-btn"
                    onClick={() =>
                      handleAddSequenceStepToWorkflow(selectedWorkflow)
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                {selectedWorkflow.steps.map((step) => {
                  const isStepActive = selectedStep?.id === step.id;
                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isStepActive
                          ? "bg-[#f0fdf9] border-[#0d9488] shadow-xs"
                          : "bg-[#fafafa] border-[#e8e5e5] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#09232d]">
                          <Clock className="w-3 h-3 text-[#0d9488]" />
                          Step {step.stepNumber} · {step.delayLabel}
                        </span>
                        <span className="text-[10px] font-semibold text-[#0d9488] tabular-nums">
                          {step.openRatePct}% open · {step.clickRatePct}% click
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#070b16] truncate">
                        {step.subject}
                      </p>
                      <p className="text-[11px] text-[#616263] line-clamp-2 mt-0.5">
                        {step.body}
                      </p>
                    </div>
                  );
                })}

                {/* Tracked Link Performance inside Inspector (Ticket 7) */}
                {(selectedWorkflow.trackedLinks ?? []).length > 0 && (
                  <div className="pt-2 border-t border-[#e9e9e9] space-y-1.5">
                    <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#09232d]">
                      Link Performance (Clicks)
                    </span>
                    {(selectedWorkflow.trackedLinks ?? []).map((lnk) => (
                      <div
                        key={lnk.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-[#f7f6f6] px-3 py-2 text-[11px]"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-[#09232d] truncate">
                            {lnk.label}
                          </p>
                          <p className="text-[10px] text-[#616263] truncate">
                            {lnk.url}
                          </p>
                        </div>
                        <span className="shrink-0 font-extrabold text-[#0d9488] tabular-nums">
                          {lnk.clicks} clicks
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Bar Modeled After SocialOpportunityDetail */}
              <div className="mt-auto shrink-0 flex items-center justify-between gap-2 border-t border-[#e9e9e9] bg-[#f7f7f7] px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("template-studio")}
                  data-testid="open-template-studio-btn"
                  className="se-primary h-8 rounded-[10px] bg-[#09232d] px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#0f3340] cursor-pointer"
                >
                  Open Template Editor
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditSettingsModal(selectedWorkflow)}
                  className="se-control h-8 rounded-[10px] border border-[#d1d1d1] bg-white px-3 text-[11px] font-semibold text-[#34373c] transition hover:bg-gray-100 cursor-pointer"
                >
                  Edit Prospect
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateWorkflow(selectedWorkflow)}
                  title="Duplicate Workflow"
                  className="se-control h-8 rounded-[10px] border border-[#d1d1d1] bg-white px-2.5 text-[11px] text-[#34373c] transition hover:bg-gray-100 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: TICKET 6 — EMAIL TEMPLATE EDITOR & AI TONE DRAFTER
          ===================================================================== */}
      {activeTab === "template-studio" && selectedWorkflow && selectedStep && (
        <div
          className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start"
          data-testid="email-template-studio"
        >
          {/* Left 4 cols: Workflow, Audience/Contact Context & AI Tone Shifter */}
          <div className="p23-bento-card xl:col-span-4 p-5 space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Editing Automation Workflow
              </label>
              <select
                value={selectedWorkflow.id}
                onChange={(e) => {
                  const found = workflows.find((w) => w.id === e.target.value);
                  if (found) handleSelectWorkflow(found);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#070b16] bg-white"
              >
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.engine})
                  </option>
                ))}
              </select>
            </div>

            {/* Attached CRM Contact / Audience Segment Selector inside Editor (Ticket 6) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6d28d9]">
                TARGET AUDIENCE &amp; LEAD PERSONALIZATION
              </span>
              <select
                aria-label="Target CRM Contact for AI Draft"
                value={
                  CRM_CONTACT_TARGETS.find(
                    (c) => c.name === selectedWorkflow.prospectName
                  )?.id ?? CRM_CONTACT_TARGETS[0].id
                }
                onChange={(e) => {
                  const contact = CRM_CONTACT_TARGETS.find(
                    (c) => c.id === e.target.value
                  );
                  if (!contact) return;
                  updateWorkflows((prev) =>
                    prev.map((w) =>
                      w.id === selectedWorkflow.id
                        ? {
                            ...w,
                            prospectName: contact.name,
                            prospectCompany: contact.companyName,
                            prospectEmail: contact.email,
                            prospectRole: contact.roleTitle,
                          }
                        : w
                    )
                  );
                  showToast(
                    `Bound template preview & AI drafter to ${contact.name} (${contact.companyName})`
                  );
                }}
                className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#070b16] bg-white"
              >
                {CRM_CONTACT_TARGETS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.companyName} ({c.corridorMarket})
                  </option>
                ))}
              </select>
              <button
                type="button"
                data-testid="ai-draft-for-audience-btn"
                onClick={() =>
                  handleApplyAiToneToSelectedStep(selectedWorkflow.tone)
                }
                className="w-full py-1.5 px-3 rounded-xl bg-[#022228] text-[#2ae9c9] text-[11px] font-bold cursor-pointer hover:opacity-95"
              >
                ✨ Redraft Step for Selected Lead/Audience
              </button>
            </div>

            {/* Step Selector Pills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#070b16]">
                  Sequence Steps ({selectedWorkflow.steps.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSequenceStepToWorkflow(selectedWorkflow)
                  }
                  className="text-xs font-semibold text-[#7c3aed] hover:underline cursor-pointer"
                >
                  + Add Step
                </button>
              </div>
              <div className="space-y-1.5">
                {selectedWorkflow.steps.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStepId(st.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      st.id === selectedStep.id
                        ? "bg-[#022228] text-white border-[#022228]"
                        : "bg-slate-50 text-[#070b16] border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Step {st.stepNumber}</span>
                      <span
                        className={
                          st.id === selectedStep.id
                            ? "text-[#2ae9c9]"
                            : "text-slate-500"
                        }
                      >
                        {st.delayLabel}
                      </span>
                    </div>
                    <div className="truncate opacity-80 mt-0.5">
                      {st.subject}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Tone / Vibe Instant Rewriter */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Wand2 className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span className="text-xs font-bold text-[#070b16]">
                  AI Tone &amp; Vibe Calibration
                </span>
              </div>
              <div className="space-y-2">
                {(Object.keys(AI_TONE_SPECS) as AiToneId[]).map((tId) => {
                  const spec = AI_TONE_SPECS[tId];
                  const isCurrent = selectedWorkflow.tone === tId;
                  return (
                    <button
                      key={tId}
                      type="button"
                      data-testid={`apply-tone-${tId}`}
                      onClick={() => handleApplyAiToneToSelectedStep(tId)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#f5f3ff] border-[#8b5cf6]"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#070b16]">
                          {spec.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b5cf6] text-white">
                            Active Vibe
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        {spec.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 8 cols: Interactive Template Editor & Merge Tag Studio */}
          <div className="p23-bento-card xl:col-span-8 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488]">
                  STEP {selectedStep.stepNumber} TEMPLATE EDITOR ·{" "}
                  {selectedWorkflow.audienceName.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-[#070b16]">
                  {selectedWorkflow.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  aria-label="Test email recipient"
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-[#070b16] bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleSimulateEmailDispatch(selectedWorkflow);
                    showToast(
                      `Dispatched test preview of Step ${selectedStep.stepNumber} to ${testEmailAddress}`
                    );
                  }}
                  data-testid="send-test-email-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#022228] text-[#2ae9c9] text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Test</span>
                </button>
              </div>
            </div>

            {/* Interval & Subject Line */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Sending Interval / Waiting Period
                </label>
                <input
                  type="text"
                  value={selectedStep.delayLabel}
                  onChange={(e) =>
                    handleUpdateStepField("delayLabel", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-[#070b16]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  data-testid="template-subject-input"
                  value={selectedStep.subject}
                  onChange={(e) =>
                    handleUpdateStepField("subject", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#070b16]"
                />
              </div>
            </div>

            {/* Merge Tag Insertion Bar */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
                Dynamic Personalization Merge Tags (Click to insert)
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {MERGE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      handleUpdateStepField(
                        "body",
                        `${selectedStep.body} ${tag}`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#ede9fe] hover:text-[#6d28d9] text-[11px] font-mono font-semibold text-[#334155] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Body Textarea */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Email Body Copy
              </label>
              <textarea
                rows={8}
                data-testid="template-body-textarea"
                value={selectedStep.body}
                onChange={(e) => handleUpdateStepField("body", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-xs leading-relaxed text-[#070b16] font-medium focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>

            {/* Live Personalized Preview Card */}
            <div className="rounded-2xl bg-[#f8fafc] border border-slate-200/90 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#0d9488]">
                  LIVE PERSONALIZED PREVIEW (TARGET:{" "}
                  {(selectedWorkflow.prospectName ?? "Chidi Nwosu").toUpperCase()}{" "}
                  ·{" "}
                  {(
                    selectedWorkflow.prospectCompany ?? "TechGlobal Ltd"
                  ).toUpperCase()}
                  )
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  ✓ Deliverability Score: 99/100
                </span>
              </div>
              <div className="text-xs font-bold text-[#070b16] mb-1">
                Subject:{" "}
                {selectedStep.subject
                  .replace(
                    /\{\{first_name\}\}/g,
                    (selectedWorkflow.prospectName ?? "Chidi").split(" ")[0]
                  )
                  .replace(
                    /\{\{company_name\}\}/g,
                    selectedWorkflow.prospectCompany ?? "TechGlobal Ltd"
                  )
                  .replace(/\{\{corridor_market\}\}/g, "Nigeria & Kenya")
                  .replace(/\{\{primary_engine\}\}/g, selectedWorkflow.engine)}
              </div>
              <div className="text-xs text-[#334155] whitespace-pre-line leading-relaxed">
                {selectedStep.body
                  .replace(
                    /\{\{first_name\}\}/g,
                    (selectedWorkflow.prospectName ?? "Chidi").split(" ")[0]
                  )
                  .replace(
                    /\{\{company_name\}\}/g,
                    selectedWorkflow.prospectCompany ?? "TechGlobal Ltd"
                  )
                  .replace(/\{\{corridor_market\}\}/g, "Nigeria & Kenya")
                  .replace(/\{\{primary_engine\}\}/g, selectedWorkflow.engine)
                  .replace(
                    /\{\{intent_signal_summary\}\}/g,
                    "West Africa expansion hiring signal"
                  )
                  .replace(/\{\{owner_name\}\}/g, "Amara Okafor")
                  .replace(
                    /\{\{owner_calendar_link\}\}/g,
                    "https://cal.p23africa.com/amara"
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: TICKET 6 — AUDIENCE SELECTOR (CRM CONTACTS + SEGMENTS) & SMART LEAD SYNC
          ===================================================================== */}
      {activeTab === "audience-triggers" && (
        <div
          className="space-y-4"
          data-testid="email-audience-targeting-section"
        >
          {/* Smart Lead Data Transmission Alignment Banner */}
          <div className="p23-bento-card p-5 bg-gradient-to-r from-[#022228] via-[#09353f] to-[#134e4a] text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#2ae9c9]/20 text-[#2ae9c9] text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SMART LEAD ↔ EMAIL AUTOMATION DATA TRANSMISSION</span>
                </div>
                <h2 className="text-xl font-bold">
                  Unified Smart Lead &amp; CRM Audience Targeting
                </h2>
                <p className="text-xs text-white/80 max-w-3xl">
                  Attach specific CRM contacts, Smart Lead AI-discovered prospects, or multi-engine audience segments to any email sequence. The AI drafter automatically tailors copy to your chosen contacts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSmartLeadAutoSync((v) => !v);
                    showToast(
                      `Smart Lead real-time email transmission ${
                        !smartLeadAutoSync ? "enabled" : "paused"
                      }`
                    );
                  }}
                  data-testid="toggle-smart-lead-sync-btn"
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    smartLeadAutoSync
                      ? "bg-[#2ae9c9] text-[#022228]"
                      : "bg-white/15 text-white"
                  }`}
                >
                  {smartLeadAutoSync
                    ? `● Auto-Sync Active (${dynamicPerf.smartLeadSyncedFormatted} Sent)`
                    : "○ Auto-Sync Paused"}
                </button>
              </div>
            </div>
          </div>

          {/* Specific CRM Contacts & Smart Lead Prospects Selector (Ticket 6) */}
          <div
            className="p23-bento-card p-5 space-y-4"
            data-testid="crm-contacts-audience-selector"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488]">
                  TICKET 6 · DIRECT CRM CONTACT &amp; SMART LEAD SELECTOR
                </span>
                <h3 className="text-base font-bold text-[#070b16]">
                  Select Specific CRM Contacts or Smart Lead Prospects for AI Drafting
                </h3>
              </div>
              <button
                type="button"
                data-testid="draft-sequence-for-contacts-btn"
                onClick={() => {
                  setAudienceTargetMode("contacts");
                  syncBuilderWithAiBlueprint(
                    selectedAudienceId,
                    undefined,
                    selectedCrmContactIds,
                    "contacts"
                  );
                  setCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer hover:opacity-90"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#2ae9c9]" />
                <span>
                  Draft AI Sequence for {selectedCrmContactIds.length} Selected
                  Contact{selectedCrmContactIds.length === 1 ? "" : "s"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {CRM_CONTACT_TARGETS.map((contact) => {
                const isChecked = selectedCrmContactIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    data-testid={`crm-contact-card-${contact.id}`}
                    onClick={() => toggleCrmContactInBuilder(contact.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-[#f0fdf9] border-[#0d9488] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#070b16]">
                          {contact.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#475569]">
                          {contact.roleTitle} · {contact.companyName}
                        </p>
                        <p className="text-[10.5px] text-slate-400">
                          {contact.email} · {contact.corridorMarket}
                        </p>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isChecked
                            ? "bg-[#0d9488] text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isChecked ? <Check className="w-3 h-3" /> : "+"}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                      <span className="font-semibold text-[#6d28d9]">
                        {contact.sourceModule} · {contact.intentScore}% Fit
                      </span>
                      <EngineBadge engine={contact.engine} />
                    </div>
                    <p className="text-[10.5px] text-[#334155] mt-1 line-clamp-1">
                      Signal: {contact.intentSignalSummary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Audience Segments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TARGET_AUDIENCE_SEGMENTS.map((seg) => {
              const recType =
                AUTOMATION_TYPE_SPECS[seg.recommendedAutomationType];
              const recTone = AI_TONE_SPECS[seg.recommendedTone];
              const recTrig = TRIGGER_CONFIG_SPECS[seg.recommendedTrigger];

              return (
                <div
                  key={seg.id}
                  data-testid={`audience-card-${seg.id}`}
                  className="p23-bento-card p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <EngineBadge engine={seg.engine} />
                      <span className="text-xs font-bold text-[#070b16] tabular-nums">
                        {seg.recipientCount.toLocaleString("en-US")} contacts
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#070b16]">
                      {seg.name}
                    </h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      {seg.description}
                    </p>

                    <div className="mt-4 p-3.5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#6d28d9]">
                        <span className="inline-flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" />
                          AI Recommended Flow
                        </span>
                        <span>Avg Intent: {seg.avgIntentScore}%</span>
                      </div>
                      <div className="text-xs font-bold text-[#070b16]">
                        {recType.name}
                      </div>
                      <div className="text-[11px] text-[#475569]">
                        <strong>Tone:</strong> {recTone.name} ·{" "}
                        <strong>Trigger:</strong> {recTrig.name}
                      </div>
                      <p className="text-[11px] text-[#5b21b6] leading-relaxed">
                        {seg.aiRationale}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAudienceTargetMode("segment");
                      setSelectedAudienceId(seg.id);
                      syncBuilderWithAiBlueprint(
                        seg.id,
                        undefined,
                        selectedCrmContactIds,
                        "segment"
                      );
                      setCreateModalOpen(true);
                    }}
                    data-testid={`launch-ai-flow-${seg.id}`}
                    className="w-full py-2.5 px-4 rounded-full bg-[#0b0d14] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Configure AI Flow for Segment →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: TICKET 7 — CAMPAIGN & EMAIL PERFORMANCE METRICS VIEW
          (Sent, Delivered, Opened, Link Performance / Clicks & Live Event Stream)
          ===================================================================== */}
      {activeTab === "performance-metrics" && (
        <div
          className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start"
          data-testid="email-performance-metrics-view"
        >
          {/* Left 7 cols: Link Performance (Clicks) & Per-Workflow Delivery Breakdown */}
          <div className="p23-bento-card xl:col-span-7 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488]">
                  TICKET 7 · TRACKED LINK PERFORMANCE &amp; CLICK TELEMETRY
                </span>
                <h2 className="text-lg font-bold text-[#070b16]">
                  Link Performance (Clicks) &amp; Workflow Delivery Breakdown
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleSimulateEmailDispatch()}
                data-testid="performance-simulate-dispatch-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#022228] text-[#2ae9c9] text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Simulate Dispatch (+50 Sends)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {dynamicPerf.allTrackedLinks.map((lnk) => (
                <div
                  key={lnk.id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      <span className="text-xs font-bold text-[#070b16] truncate">
                        {lnk.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                      {lnk.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 tabular-nums">
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-[#070b16]">
                        {lnk.clicks.toLocaleString("en-US")} clicks
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {lnk.uniqueClicks.toLocaleString("en-US")} unique
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#ccfbf1] text-[#0f766e] text-xs font-bold">
                      {lnk.ctrPct}% CTR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 cols: Live Back-End Tracking Event Stream (Smart Lead + Email Automation Sync) */}
          <div className="p23-bento-card xl:col-span-5 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
                  REAL-TIME WEBHOOK &amp; SMART LEAD TRACKING STREAM
                </span>
                <h2 className="text-lg font-bold text-[#070b16]">
                  Live Dispatch &amp; Engagement Events
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5">
              {storeState.trackingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-2xl border border-slate-200/80 bg-white flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6d28d9] text-[10px] font-bold uppercase">
                        {evt.eventType}
                      </span>
                      <span className="text-xs font-bold text-[#070b16] truncate">
                        {evt.recipientName} · {evt.companyName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate mt-1">
                      {evt.workflowName}
                    </p>
                    {evt.linkUrl && (
                      <p className="text-[10px] text-[#0d9488] truncate mt-0.5">
                        Clicked: {evt.linkUrl}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] font-bold text-slate-700">
                      {evt.sourceModule}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {evt.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: AI SPECS & TRIGGER CONFIGURATIONS (TICKET 1 DELIVERABLE IN UI)
          ===================================================================== */}
      {activeTab === "ai-specs" && (
        <div
          className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start"
          data-testid="email-ai-specs-section"
        >
          <div className="p23-bento-card xl:col-span-7 p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488]">
                TICKET 1 SPECIFICATION · CORE AUTOMATION ARCHETYPES
              </span>
              <h2 className="text-lg font-bold text-[#070b16]">
                Supported AI Automation Types &amp; Sending Intervals
              </h2>
            </div>

            <div className="space-y-3">
              {(Object.keys(AUTOMATION_TYPE_SPECS) as AutomationTypeId[]).map(
                (typeKey) => {
                  const spec = AUTOMATION_TYPE_SPECS[typeKey];
                  return (
                    <div
                      key={spec.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: spec.badgeBg,
                            color: spec.badgeColor,
                          }}
                        >
                          {spec.name}
                        </span>
                        <span className="text-xs font-semibold text-[#64748b]">
                          {spec.defaultStepCount} default steps
                        </span>
                      </div>
                      <p className="text-xs text-[#334155]">
                        {spec.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-[#070b16]">
                          Intervals:
                        </span>
                        {spec.recommendedIntervals.map((intv) => (
                          <span
                            key={intv}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-[#475569]"
                          >
                            {intv}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="p23-bento-card xl:col-span-5 p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
                AUTO-CONFIGURED TRIGGERS &amp; GUARDRAILS
              </span>
              <h2 className="text-lg font-bold text-[#070b16]">
                Standard Trigger Setups
              </h2>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(TRIGGER_CONFIG_SPECS) as TriggerEventId[]).map(
                (trigKey) => {
                  const trig = TRIGGER_CONFIG_SPECS[trigKey];
                  return (
                    <div
                      key={trig.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#070b16]">
                          {trig.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-bold text-[#475569]">
                          {trig.sourceModule}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#64748b]">
                        {trig.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#0d9488]">
                        <span>Delay: {trig.defaultDelayLabel}</span>
                        <span>·</span>
                        <span>{trig.maxFrequencyCapLabel}</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TICKET 4 MODAL: EDIT PROSPECT DETAILS & WORKFLOW SETTINGS
          ===================================================================== */}
      {editSettingsWorkflowId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Prospect Details & Workflow Settings"
          data-testid="edit-workflow-settings-modal"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#070b16]">
                Edit Prospect Details &amp; Workflow Settings
              </h2>
              <button
                type="button"
                onClick={() => setEditSettingsWorkflowId(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkflowSettings} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Automation Workflow Name
                </label>
                <input
                  type="text"
                  required
                  data-testid="edit-workflow-name-input"
                  value={editWfName}
                  onChange={(e) => setEditWfName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Prospect Name
                  </label>
                  <input
                    type="text"
                    data-testid="edit-prospect-name-input"
                    value={editProspectName}
                    onChange={(e) => setEditProspectName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prospect Company
                  </label>
                  <input
                    type="text"
                    value={editProspectCompany}
                    onChange={(e) => setEditProspectCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prospect Email
                  </label>
                  <input
                    type="email"
                    value={editProspectEmail}
                    onChange={(e) => setEditProspectEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sending Interval Window
                  </label>
                  <input
                    type="text"
                    value={editSendWindow}
                    onChange={(e) => setEditSendWindow(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditSettingsWorkflowId(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="save-workflow-settings-btn"
                  className="px-5 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TICKET 5 & 6 MODAL: "CREATE AUTOMATION" FLOW, AI WORKFLOW SEQUENCE BUILDER,
          AUDIENCE SELECTOR (CRM CONTACTS / SEGMENTS) & EMBEDDED TEMPLATE EDITOR
          ===================================================================== */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create AI Email Automation"
          data-testid="ai-automation-create-modal"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#022228] text-[#2ae9c9] flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#070b16]">
                    Create Email Automation &amp; AI Sequence Builder
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    Configure audience, triggers, campaign activation, waiting intervals, and AI-drafted email templates.
                  </p>
                </div>
              </div>

              {/* Start From AI Template vs Start From Scratch Toggle (Ticket 5) */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    data-testid="mode-ai-suggested-btn"
                    onClick={() => handleOpenCreateAutomationModal("ai")}
                    className={`px-3 py-1 rounded-full cursor-pointer ${
                      creationMode === "ai"
                        ? "bg-[#022228] text-[#2ae9c9]"
                        : "text-slate-600"
                    }`}
                  >
                    ✨ AI-Suggested Flow
                  </button>
                  <button
                    type="button"
                    data-testid="mode-scratch-btn"
                    onClick={() => handleOpenCreateAutomationModal("scratch")}
                    className={`px-3 py-1 rounded-full cursor-pointer ${
                      creationMode === "scratch"
                        ? "bg-[#022228] text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Build From Scratch
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAiAutomation} className="space-y-4 mt-4">
              {/* Row 1: Automation Name & Campaign Activation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#070b16] mb-1">
                    Automation Name
                  </label>
                  <input
                    type="text"
                    data-testid="create-automation-name-input"
                    value={customWorkflowName}
                    onChange={(e) => setCustomWorkflowName(e.target.value)}
                    placeholder={`${aiRec.audience.engine}: ${AUTOMATION_TYPE_SPECS[effectiveType].shortLabel}`}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#070b16]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#070b16] mb-1">
                    Campaign Activation Link
                  </label>
                  <select
                    data-testid="create-campaign-activation-select"
                    value={selectedCampaignActivationId}
                    onChange={(e) =>
                      setSelectedCampaignActivationId(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-[#070b16] bg-white"
                  >
                    {CAMPAIGN_ACTIVATION_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.engine})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Ticket 6 Audience Selector (Target Segment vs Specific CRM Contacts) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#070b16]">
                    Audience Selector (Connects directly to AI Copy Drafter)
                  </span>
                  <div className="inline-flex rounded-full bg-white border border-slate-200 p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      data-testid="audience-mode-segment-btn"
                      onClick={() => {
                        setAudienceTargetMode("segment");
                        syncBuilderWithAiBlueprint(
                          selectedAudienceId,
                          effectiveTone,
                          selectedCrmContactIds,
                          "segment"
                        );
                      }}
                      className={`px-3 py-1 rounded-full cursor-pointer ${
                        audienceTargetMode === "segment"
                          ? "bg-[#0b0d14] text-white"
                          : "text-slate-600"
                      }`}
                    >
                      Target Audience Segment
                    </button>
                    <button
                      type="button"
                      data-testid="audience-mode-contacts-btn"
                      onClick={() => {
                        setAudienceTargetMode("contacts");
                        syncBuilderWithAiBlueprint(
                          selectedAudienceId,
                          effectiveTone,
                          selectedCrmContactIds,
                          "contacts"
                        );
                      }}
                      className={`px-3 py-1 rounded-full cursor-pointer ${
                        audienceTargetMode === "contacts"
                          ? "bg-[#0b0d14] text-white"
                          : "text-slate-600"
                      }`}
                    >
                      Specific CRM Contacts ({selectedCrmContactIds.length})
                    </button>
                  </div>
                </div>

                {audienceTargetMode === "segment" ? (
                  <select
                    data-testid="ai-modal-audience-select"
                    value={selectedAudienceId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setSelectedAudienceId(nextId);
                      setOverrideType(null);
                      setOverrideTone(null);
                      setOverrideTrigger(null);
                      syncBuilderWithAiBlueprint(
                        nextId,
                        undefined,
                        selectedCrmContactIds,
                        "segment"
                      );
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-[#070b16] bg-white"
                  >
                    {TARGET_AUDIENCE_SEGMENTS.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.name} ({seg.recipientCount.toLocaleString("en-US")}{" "}
                        contacts · {seg.engine})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    data-testid="modal-crm-contacts-list"
                  >
                    {CRM_CONTACT_TARGETS.map((c) => {
                      const checked = selectedCrmContactIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          data-testid={`modal-contact-option-${c.id}`}
                          onClick={() => toggleCrmContactInBuilder(c.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                            checked
                              ? "bg-[#f0fdf9] border-[#0d9488] font-bold"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate text-[#070b16]">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-[#0d9488]">
                              {checked ? "✓ Selected" : "+ Attach"}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-500 truncate">
                            {c.companyName} · {c.corridorMarket}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* AI Recommendation Callout */}
                <div
                  className="p-3 rounded-xl bg-[#f5f3ff] border border-[#c4b5fd] flex flex-wrap items-center justify-between gap-2"
                  data-testid="ai-recommendation-banner"
                >
                  <div className="text-xs text-[#3b0764]">
                    <strong className="text-[#6d28d9]">
                      AI Blueprint ({aiRec.audience.avgIntentScore}% Intent Fit):
                    </strong>{" "}
                    {aiRec.primaryContact
                      ? `Drafted personalized sequence for ${aiRec.primaryContact.name} (${aiRec.primaryContact.companyName})`
                      : aiRec.audience.aiRationale}
                  </div>
                </div>
              </div>

              {/* Row 3: Automation Type, Tone/Vibe, Trigger Setup, Sending Interval */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Automation Type
                  </label>
                  <select
                    value={effectiveType}
                    onChange={(e) =>
                      setOverrideType(e.target.value as AutomationTypeId)
                    }
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-[#070b16]"
                  >
                    {(
                      Object.keys(AUTOMATION_TYPE_SPECS) as AutomationTypeId[]
                    ).map((k) => (
                      <option key={k} value={k}>
                        {AUTOMATION_TYPE_SPECS[k].shortLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tone / Vibe
                  </label>
                  <select
                    data-testid="create-modal-tone-select"
                    value={effectiveTone}
                    onChange={(e) => {
                      const nextTone = e.target.value as AiToneId;
                      setOverrideTone(nextTone);
                      syncBuilderWithAiBlueprint(
                        selectedAudienceId,
                        nextTone,
                        selectedCrmContactIds,
                        audienceTargetMode
                      );
                    }}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-[#070b16]"
                  >
                    {(Object.keys(AI_TONE_SPECS) as AiToneId[]).map((k) => (
                      <option key={k} value={k}>
                        {AI_TONE_SPECS[k].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Entry Trigger
                  </label>
                  <select
                    value={effectiveTrigger}
                    onChange={(e) =>
                      setOverrideTrigger(e.target.value as TriggerEventId)
                    }
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-[#070b16]"
                  >
                    {(
                      Object.keys(TRIGGER_CONFIG_SPECS) as TriggerEventId[]
                    ).map((k) => (
                      <option key={k} value={k}>
                        {TRIGGER_CONFIG_SPECS[k].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sending Window
                  </label>
                  <input
                    type="text"
                    value={customSendInterval}
                    onChange={(e) => setCustomSendInterval(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-[#070b16]"
                  />
                </div>
              </div>

              {/* Row 4: Ticket 5 Workflow Sequence Builder + Ticket 6 Embedded Email Template Editor */}
              <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-2xl border border-slate-200 bg-[#f8fafc]"
                data-testid="modal-workflow-sequence-builder"
              >
                {/* Left 5 cols: Sequence Order, Waiting Periods & Step Controls */}
                <div className="lg:col-span-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#070b16]">
                      Sequence Builder ({builderSteps.length} Steps)
                    </span>
                    <button
                      type="button"
                      data-testid="builder-add-step-btn"
                      onClick={handleBuilderAddStep}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#022228] text-[#2ae9c9] text-[11px] font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Email Step</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {builderSteps.map((st, idx) => {
                      const active = idx === activeBuilderStepIdx;
                      return (
                        <div
                          key={st.id}
                          onClick={() => setActiveBuilderStepIdx(idx)}
                          className={`p-3 rounded-xl border text-xs transition cursor-pointer ${
                            active
                              ? "bg-white border-[#022228] shadow-sm"
                              : "bg-white/70 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#070b16]">
                              Step {idx + 1} · {st.delayLabel}
                            </span>
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleBuilderMoveStep(idx, "up")}
                                disabled={idx === 0}
                                title="Move step up"
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleBuilderMoveStep(idx, "down")
                                }
                                disabled={idx === builderSteps.length - 1}
                                title="Move step down"
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              {builderSteps.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleBuilderRemoveStep(idx)}
                                  title="Delete step"
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-1">
                            {st.subject}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 7 cols: Embedded Email Template Editor inside Creation Flow (Ticket 6) */}
                {activeBuilderStep && (
                  <div
                    className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 space-y-3"
                    data-testid="modal-embedded-template-editor"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#0d9488]">
                        EMBEDDED TEMPLATE EDITOR · STEP{" "}
                        {activeBuilderStep.stepNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          syncBuilderWithAiBlueprint(
                            selectedAudienceId,
                            effectiveTone,
                            selectedCrmContactIds,
                            audienceTargetMode
                          )
                        }
                        className="text-[11px] font-bold text-[#6d28d9] hover:underline cursor-pointer"
                      >
                        ✨ Regenerate AI Copy
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                          Waiting Period (Days)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          data-testid="builder-step-wait-days-input"
                          value={activeBuilderStep.waitDays ?? 0}
                          onChange={(e) =>
                            handleBuilderStepFieldChange(
                              activeBuilderStepIdx,
                              "waitDays",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#070b16]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                          Step Subject Line
                        </label>
                        <input
                          type="text"
                          data-testid="builder-step-subject-input"
                          value={activeBuilderStep.subject}
                          onChange={(e) =>
                            handleBuilderStepFieldChange(
                              activeBuilderStepIdx,
                              "subject",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-[#070b16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                        AI-Tailored Email Body Copy
                      </label>
                      <textarea
                        rows={5}
                        data-testid="builder-step-body-textarea"
                        value={activeBuilderStep.body}
                        onChange={(e) =>
                          handleBuilderStepFieldChange(
                            activeBuilderStepIdx,
                            "body",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#070b16] leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="launch-ai-automation-submit"
                  className="px-5 py-2.5 rounded-full bg-[#0b0d14] text-white text-xs font-semibold shadow-md hover:opacity-90 cursor-pointer"
                >
                  Save &amp; Launch Email Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
