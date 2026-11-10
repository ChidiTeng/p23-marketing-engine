let currentLatencyMode: "off" | "normal" | "slow" = "normal";

export function setLatencyMode(mode: "off" | "normal" | "slow") {
  currentLatencyMode = mode;
}

export function getLatencyMode() {
  return currentLatencyMode;
}

export async function withLatency(overrideMs?: number): Promise<void> {
  if (currentLatencyMode === "off") return;
  const ms =
    overrideMs ??
    (currentLatencyMode === "slow"
      ? 1000
      : Math.floor(Math.random() * 200) + 200);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
