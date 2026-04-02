import { describe, expect, it } from "vitest";
import { ingestSessions } from "@/lib/sessionlens/ingest";
import { buildSessionAnalytics } from "@/lib/sessionlens/metrics";
import type { IngestedSessionDataset, NormalizedSession } from "@/lib/sessionlens/types";

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

  it("computes analytics from inline session data without depending on the demo fixtures", () => {
    const dataset: IngestedSessionDataset = {
      sourceId: "inline-fixture",
      sourceLabel: "Inline fixture",
      mode: "filesystem",
      generatedAt: "2026-04-01T20:00:00Z",
      sessions: [
        {
          id: "inline-1",
          startedAt: "2026-03-29T09:00:00Z",
          durationMinutes: 30,
          workflowKind: "feature_delivery",
          project: { id: "project-a", name: "project-a", area: "Backend" },
          userTurns: 3,
          assistantTurns: 6,
          toolCounts: { read_file: 3, edit_file: 2 },
          inputTokens: 1000,
          outputTokens: 400,
          cacheReadTokens: 200,
          agentInvocations: 1,
          capabilities: { taskAgent: true, mcp: false, webSearch: false, webFetch: false },
          gitCommits: 1,
          gitPushes: 0,
          linesAdded: 15,
          linesRemoved: 5,
          filesModified: 2,
          outcome: "shipped",
          friction: "smooth",
        },
        {
          id: "inline-2",
          startedAt: "2026-03-29T12:00:00Z",
          durationMinutes: 60,
          workflowKind: "research",
          project: { id: "project-b", name: "project-b", area: "Docs" },
          userTurns: 4,
          assistantTurns: 7,
          toolCounts: { read_file: 1, web_fetch: 4 },
          inputTokens: 2000,
          outputTokens: 500,
          cacheReadTokens: 300,
          agentInvocations: 0,
          capabilities: { taskAgent: false, mcp: false, webSearch: true, webFetch: true },
          gitCommits: 0,
          gitPushes: 0,
          linesAdded: 4,
          linesRemoved: 1,
          filesModified: 1,
          outcome: "research",
          friction: "notable",
        },
      ] satisfies NormalizedSession[],
    };

    const inlineAnalytics = buildSessionAnalytics(dataset);

    expect(inlineAnalytics.overview).toEqual({
      totalSessions: 2,
      totalTokens: 4400,
      estimatedSpendUsd: 0.02,
      averageDurationMinutes: 45,
      agentSessionRate: 0.5,
      frictionSessionRate: 0.5,
    });
    expect(inlineAnalytics.dailyActivity).toEqual([
      {
        date: "2026-03-29",
        sessions: 2,
        tokens: 4400,
        agentSessions: 1,
      },
    ]);
    expect(inlineAnalytics.projectSummaries.map((project) => project.id)).toEqual(["project-b", "project-a"]);
    expect(inlineAnalytics.toolHighlights).toEqual([
      { name: "read_file", invocations: 4, sessionCoverage: 2 },
      { name: "web_fetch", invocations: 4, sessionCoverage: 1 },
      { name: "edit_file", invocations: 2, sessionCoverage: 1 },
    ]);
    expect(inlineAnalytics.capabilityUsage).toEqual([
      { name: "Task Agent", sessions: 1, rate: 0.5 },
      { name: "Web Search", sessions: 1, rate: 0.5 },
      { name: "Web Fetch", sessions: 1, rate: 0.5 },
      { name: "MCP", sessions: 0, rate: 0 },
    ]);
  });
});
