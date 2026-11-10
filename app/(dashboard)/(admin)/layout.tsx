"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { role, isLoading, isMember } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && isMember) {
      toast.error("Access restricted: Administrator privileges required.");
      router.replace("/crm");
    }
  }, [isLoading, isMember, router]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <Loader2 className="h-8 w-8 animate-spin text-[#2ae9c9]" />
          <span className="text-sm font-medium">Verifying admin permissions...</span>
        </div>
      </div>
    );
  }

  if (isMember) {
    return null;
  }

  return <>{children}</>;
}

