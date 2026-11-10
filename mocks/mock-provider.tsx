"use client";

import { useEffect, useState, type ReactNode } from "react";

const MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

export function MockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!MOCKING);

  useEffect(() => {
    if (!MOCKING) return;
    import("./browser").then(async ({ worker }) => {
      await worker.start({
        onUnhandledRequest: "warn",
        quiet: true,
      });
      setReady(true);
    });
  }, []);

  return ready ? <>{children}</> : null;
}
