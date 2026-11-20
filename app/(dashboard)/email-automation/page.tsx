import type { Metadata } from "next";
import { Suspense } from "react";
import { EmailAutomationView } from "@/components/email-automation/email-automation-view";

export const metadata: Metadata = {
  title: "Email Automation & AI Flows | P23 Marketing Engine",
  description:
    "AI-recommended email automation workflows, template editor, audience targeting, and trigger configurations across CRM, Customers, Campaigns, and Smart Lead.",
};

export default function EmailAutomationPage() {
  return (
    <Suspense>
      <EmailAutomationView />
    </Suspense>
  );
}
