import { Metadata } from "next";
import { DuplicateReviewView } from "@/components/duplicates/duplicate-review-view";

export const metadata: Metadata = {
  title: "Duplicate Review Queue | P23 Marketing Engine",
  description: "Triage and resolve ambiguous lead and contact collisions.",
};

export default function DuplicatesPage() {
  return <DuplicateReviewView />;
}

