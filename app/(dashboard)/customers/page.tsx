import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/customers-view";

export const metadata: Metadata = {
  title: "Customers | P23 Marketing Engine",
  description: "Every converted lead, by engine, health and owner.",
};

export default function CustomersPage() {
  return <CustomersView />;
}

