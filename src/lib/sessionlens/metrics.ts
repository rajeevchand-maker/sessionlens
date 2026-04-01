import type {
  CapabilityUsage,
  DailyActivityPoint,
  IngestedSessionDataset,
  NormalizedSession,
  ProjectSummary,
  SessionAnalytics,
  ToolHighlight,
  WorkflowOutcome,
} from "@/lib/sessionlens/types";

const DEMO_PRICING = {
  inputPerTokenUsd: 3 / 1_000_000,
  outputPerTokenUsd: 15 / 1_000_000,
  cacheReadPerTokenUsd: 0.3 / 1_000_000,
};

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function estimateSessionSpendUsd(session: NormalizedSession): number {
  return (
    session.inputTokens * DEMO_PRICING.inputPerTokenUsd +
    session.outputTokens * DEMO_PRICING.outputPerTokenUsd +
    session.cacheReadTokens * DEMO_PRICING.cacheReadPerTokenUsd
  );
}

function dominantOutcome(outcomes: WorkflowOutcome[]): WorkflowOutcome {
  const counts = new Map<WorkflowOutcome, number>();

  for (const outcome of outcomes) {
    counts.set(outcome, (counts.get(outcome) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "research";
}

function buildDailyActivity(sessions: NormalizedSession[]): DailyActivityPoint[] {
  const activity = new Map<string, DailyActivityPoint>();

  for (const session of sessions) {
    const date = session.startedAt.slice(0, 10);
    const existing = activity.get(date) ?? {
      date,
      sessions: 0,
      tokens: 0,
      agentSessions: 0,
    };

    existing.sessions += 1;
    existing.tokens += session.inputTokens + session.outputTokens + session.cacheReadTokens;
    existing.agentSessions += session.agentInvocations > 0 ? 1 : 0;
    activity.set(date, existing);
  }

  return [...activity.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function buildProjectSummaries(sessions: NormalizedSession[]): ProjectSummary[] {
  const projects = new Map<string, NormalizedSession[]>();

  for (const session of sessions) {
    const bucket = projects.get(session.project.id) ?? [];
    bucket.push(session);
    projects.set(session.project.id, bucket);
  }

  return [...projects.entries()]
    .map(([projectId, projectSessions]) => {
      const sample = projectSessions[0];
      const totalTokens = projectSessions.reduce(
        (sum, session) => sum + session.inputTokens + session.outputTokens + session.cacheReadTokens,
        0
      );
      const totalDuration = projectSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
      const linesChanged = projectSessions.reduce(
        (sum, session) => sum + session.linesAdded + session.linesRemoved,
        0
      );
      const agentSessions = projectSessions.filter((session) => session.agentInvocations > 0).length;

      return {
        id: projectId,
        name: sample.project.name,
        area: sample.project.area,
        sessions: projectSessions.length,
        totalTokens,
        averageDurationMinutes: Math.round(totalDuration / projectSessions.length),
        linesChanged,
        agentSessionRate: roundTo(agentSessions / projectSessions.length, 2),
        dominantOutcome: dominantOutcome(projectSessions.map((session) => session.outcome)),
      };
    })
    .sort((left, right) => right.sessions - left.sessions || right.totalTokens - left.totalTokens);
}

function buildToolHighlights(sessions: NormalizedSession[]): ToolHighlight[] {
  const tools = new Map<string, { invocations: number; sessions: Set<string> }>();

  for (const session of sessions) {
    for (const [toolName, count] of Object.entries(session.toolCounts)) {
      const existing = tools.get(toolName) ?? { invocations: 0, sessions: new Set<string>() };
      existing.invocations += count;
      existing.sessions.add(session.id);
      tools.set(toolName, existing);
    }
  }

  return [...tools.entries()]
    .map(([name, stats]) => ({
      name,
      invocations: stats.invocations,
      sessionCoverage: stats.sessions.size,
    }))
    .sort((left, right) => right.invocations - left.invocations)
    .slice(0, 6);
}

function buildCapabilityUsage(sessions: NormalizedSession[]): CapabilityUsage[] {
  const totalSessions = sessions.length || 1;

  const capabilities = [
    {
      name: "Task Agent",
      sessions: sessions.filter((session) => session.capabilities.taskAgent).length,
    },
    {
      name: "MCP",
      sessions: sessions.filter((session) => session.capabilities.mcp).length,
    },
    {
      name: "Web Search",
      sessions: sessions.filter((session) => session.capabilities.webSearch).length,
    },
    {
      name: "Web Fetch",
      sessions: sessions.filter((session) => session.capabilities.webFetch).length,
    },
  ];

  return capabilities
    .map((capability) => ({
      ...capability,
      rate: roundTo(capability.sessions / totalSessions, 2),
    }))
    .sort((left, right) => right.sessions - left.sessions);
}

export function buildSessionAnalytics(dataset: IngestedSessionDataset): SessionAnalytics {
  const { sessions } = dataset;
  const totalSessions = sessions.length || 1;
  const totalTokens = sessions.reduce(
    (sum, session) => sum + session.inputTokens + session.outputTokens + session.cacheReadTokens,
    0
  );
  const totalDuration = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const agentSessions = sessions.filter((session) => session.agentInvocations > 0).length;
  const frictionSessions = sessions.filter((session) => session.friction !== "smooth").length;
  const estimatedSpendUsd = sessions.reduce((sum, session) => sum + estimateSessionSpendUsd(session), 0);

  return {
    overview: {
      totalSessions: sessions.length,
      totalTokens,
      estimatedSpendUsd: roundTo(estimatedSpendUsd, 2),
      averageDurationMinutes: Math.round(totalDuration / totalSessions),
      agentSessionRate: roundTo(agentSessions / totalSessions, 2),
      frictionSessionRate: roundTo(frictionSessions / totalSessions, 2),
    },
    dailyActivity: buildDailyActivity(sessions),
    projectSummaries: buildProjectSummaries(sessions),
    toolHighlights: buildToolHighlights(sessions),
    capabilityUsage: buildCapabilityUsage(sessions),
  };
}
