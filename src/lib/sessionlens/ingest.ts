import { demoSessions } from "@/lib/sessionlens/demo-fixtures";
import type { IngestedSessionDataset, SessionSource } from "@/lib/sessionlens/types";

export const demoSessionSource: SessionSource = {
  id: "synthetic-demo",
  label: "Synthetic sessionlens demo dataset",
  mode: "demo",
  readSessions() {
    return demoSessions;
  },
};

export function ingestSessions(source: SessionSource = demoSessionSource): IngestedSessionDataset {
  const sessions = [...source.readSessions()].sort((left, right) =>
    right.startedAt.localeCompare(left.startedAt)
  );

  return {
    sourceId: source.id,
    sourceLabel: source.label,
    mode: source.mode,
    generatedAt: new Date().toISOString(),
    sessions,
  };
}
