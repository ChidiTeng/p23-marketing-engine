import { Metadata } from "next";
import { UserManagementView } from "@/components/user-management/user-management-view";

export const metadata: Metadata = {
  title: "User Management | P23 Marketing Engine",
  description: "Manage team members, roles, lead distribution availability, and pending invitations.",
};

export default function UsersPage() {
  return <UserManagementView />;
}

