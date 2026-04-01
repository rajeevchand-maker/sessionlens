import { describe, expect, it } from "vitest";
import { demoSessionSource, ingestSessions } from "@/lib/sessionlens/ingest";
import type { NormalizedSession, SessionSource } from "@/lib/sessionlens/types";

function createSession(id: string, startedAt: string): NormalizedSession {
  return {
    id,
    startedAt,
    durationMinutes: 30,
    workflowKind: "test",
    project: { id: "demo", name: "demo", area: "Test" },
    userTurns: 1,
    assistantTurns: 1,
    toolCounts: {},
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 25,
    agentInvocations: 0,
    capabilities: { taskAgent: false, mcp: false, webSearch: false, webFetch: false },
    gitCommits: 0,
    gitPushes: 0,
    linesAdded: 0,
    linesRemoved: 0,
    filesModified: 0,
    outcome: "research",
    friction: "smooth",
  };
}

describe("ingestSessions", () => {
  it("sorts custom source sessions in descending startedAt order and preserves source metadata", () => {
    const source: SessionSource = {
      id: "filesystem-fixture",
      label: "Filesystem fixture",
      mode: "filesystem",
      readSessions() {
        return [
          createSession("older", "2026-03-20T10:00:00Z"),
          createSession("newer", "2026-03-22T10:00:00Z"),
          createSession("middle", "2026-03-21T10:00:00Z"),
        ];
      },
    };

    const dataset = ingestSessions(source);

    expect(dataset.sourceId).toBe("filesystem-fixture");
    expect(dataset.sourceLabel).toBe("Filesystem fixture");
    expect(dataset.mode).toBe("filesystem");
    expect(dataset.sessions.map((session) => session.id)).toEqual(["newer", "middle", "older"]);
    expect(Number.isNaN(Date.parse(dataset.generatedAt))).toBe(false);
  });

  it("uses the committed demo session source by default", () => {
    const dataset = ingestSessions();

    expect(dataset.sourceId).toBe(demoSessionSource.id);
    expect(dataset.sourceLabel).toBe(demoSessionSource.label);
    expect(dataset.mode).toBe("demo");
    expect(dataset.sessions).toHaveLength(12);
    expect(dataset.sessions[0]?.id).toBe("ses_012");
    expect(dataset.sessions[dataset.sessions.length - 1]?.id).toBe("ses_001");
  });
});
