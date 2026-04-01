import { describe, expect, it } from "vitest";
import { ingestSessions } from "@/lib/sessionlens/ingest";
import { buildSessionAnalytics } from "@/lib/sessionlens/metrics";

describe("buildSessionAnalytics", () => {
  const analytics = buildSessionAnalytics(ingestSessions());

  it("computes stable overview metrics for the demo dataset", () => {
    expect(analytics.overview).toEqual({
      totalSessions: 12,
      totalTokens: 321800,
      estimatedSpendUsd: 1.51,
      averageDurationMinutes: 65,
      agentSessionRate: 0.75,
      frictionSessionRate: 0.58,
    });
  });

  it("builds sorted daily activity rollups by calendar day", () => {
    expect(analytics.dailyActivity).toEqual([
      { date: "2026-03-20", sessions: 2, tokens: 51100, agentSessions: 1 },
      { date: "2026-03-21", sessions: 2, tokens: 64500, agentSessions: 2 },
      { date: "2026-03-22", sessions: 2, tokens: 49900, agentSessions: 1 },
      { date: "2026-03-23", sessions: 2, tokens: 51300, agentSessions: 2 },
      { date: "2026-03-24", sessions: 1, tokens: 18500, agentSessions: 0 },
      { date: "2026-03-25", sessions: 2, tokens: 61300, agentSessions: 2 },
      { date: "2026-03-26", sessions: 1, tokens: 25200, agentSessions: 1 },
    ]);
  });

  it("ranks project summaries by session count and total token volume", () => {
    expect(analytics.projectSummaries).toEqual([
      {
        id: "northstar-api",
        name: "northstar-api",
        area: "Backend",
        sessions: 3,
        totalTokens: 111000,
        averageDurationMinutes: 80,
        linesChanged: 973,
        agentSessionRate: 1,
        dominantOutcome: "shipped",
      },
      {
        id: "trailhead-web",
        name: "trailhead-web",
        area: "Frontend",
        sessions: 3,
        totalTokens: 89400,
        averageDurationMinutes: 72,
        linesChanged: 750,
        agentSessionRate: 1,
        dominantOutcome: "progressed",
      },
      {
        id: "vector-runner",
        name: "vector-runner",
        area: "Automation",
        sessions: 3,
        totalTokens: 72700,
        averageDurationMinutes: 64,
        linesChanged: 586,
        agentSessionRate: 1,
        dominantOutcome: "shipped",
      },
      {
        id: "atlas-docs",
        name: "atlas-docs",
        area: "Docs",
        sessions: 3,
        totalTokens: 48700,
        averageDurationMinutes: 43,
        linesChanged: 323,
        agentSessionRate: 0,
        dominantOutcome: "shipped",
      },
    ]);
  });

  it("aggregates top tools and capability usage across the full session set", () => {
    expect(analytics.toolHighlights).toEqual([
      { name: "read_file", invocations: 185, sessionCoverage: 12 },
      { name: "edit_file", invocations: 107, sessionCoverage: 12 },
      { name: "search_code", invocations: 52, sessionCoverage: 10 },
      { name: "run_tests", invocations: 24, sessionCoverage: 6 },
      { name: "browser_preview", invocations: 21, sessionCoverage: 6 },
      { name: "web_fetch", invocations: 7, sessionCoverage: 2 },
    ]);

    expect(analytics.capabilityUsage).toEqual([
      { name: "Task Agent", sessions: 9, rate: 0.75 },
      { name: "MCP", sessions: 6, rate: 0.5 },
      { name: "Web Search", sessions: 4, rate: 0.33 },
      { name: "Web Fetch", sessions: 3, rate: 0.25 },
    ]);
  });
});
