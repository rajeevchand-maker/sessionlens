import { ingestSessions } from "@/lib/sessionlens/ingest";
import { buildSessionAnalytics } from "@/lib/sessionlens/metrics";
import type { NormalizedSession } from "@/lib/sessionlens/types";

export type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProjectSnapshot = {
  name: string;
  sessions: number;
  focus: string;
  detail: string;
};

export type PlannedView = {
  title: string;
  description: string;
};

export type InsightCard = {
  title: string;
  value: string;
  detail: string;
};

export type ToolSnapshot = {
  name: string;
  invocations: number;
  detail: string;
};

export type DailyTrendPoint = {
  date: string;
  sessions: number;
  tokens: number;
  agentSessions: number;
};

export type CapabilitySnapshot = {
  name: string;
  sessions: number;
  rateLabel: string;
};

export type SessionSnapshot = {
  id: string;
  project: string;
  workflowKind: string;
  durationLabel: string;
  outcome: string;
  friction: string;
  detail: string;
};

const dataset = ingestSessions();
const analytics = buildSessionAnalytics(dataset);
const sessions = dataset.sessions;

function titleCase(value: string): string {
  return value
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRecentSessions(items: NormalizedSession[]): SessionSnapshot[] {
  return items.slice(0, 4).map((session) => ({
    id: session.id,
    project: session.project.name,
    workflowKind: titleCase(session.workflowKind),
    durationLabel: `${session.durationMinutes} min`,
    outcome: titleCase(session.outcome),
    friction: titleCase(session.friction),
    detail: `${session.agentInvocations} agents, ${session.filesModified} files, ${(session.inputTokens + session.outputTokens + session.cacheReadTokens).toLocaleString()} tokens`,
  }));
}

function buildInsightCards(items: NormalizedSession[]): InsightCard[] {
  const agentSessions = items.filter((session) => session.agentInvocations > 0);
  const shippedAgentSessions = agentSessions.filter((session) => session.outcome === "shipped").length;
  const shippedSoloSessions = items.filter(
    (session) => session.agentInvocations === 0 && session.outcome === "shipped"
  ).length;
  const soloSessions = items.filter((session) => session.agentInvocations === 0).length;
  const searchHeavySessions = items.filter(
    (session) => session.capabilities.webSearch || session.capabilities.webFetch
  );
  const highestTokenDay = [...analytics.dailyActivity].sort((left, right) => right.tokens - left.tokens)[0];
  const topProject = analytics.projectSummaries[0];
  const frictionProject = analytics.projectSummaries
    .map((project) => {
      const matchingSessions = items.filter((session) => session.project.id === project.id);
      const frictionCount = matchingSessions.filter((session) => session.friction !== "smooth").length;
      return {
        name: project.name,
        rate: frictionCount / matchingSessions.length,
      };
    })
    .sort((left, right) => right.rate - left.rate)[0];

  return [
    {
      title: "Agent sessions convert well",
      value: `${Math.round((shippedAgentSessions / Math.max(agentSessions.length, 1)) * 100)}%`,
      detail: "Synthetic agent-assisted sessions land in a shipped state more often than the solo baseline.",
    },
    {
      title: "Busiest synthetic day",
      value: highestTokenDay.date,
      detail: `${highestTokenDay.tokens.toLocaleString()} tokens across ${highestTokenDay.sessions} sessions in demo mode.`,
    },
    {
      title: "Primary workload",
      value: topProject.name,
      detail: `${topProject.sessions} sessions and ${topProject.linesChanged} changed lines make it the clearest product story in the dataset.`,
    },
    {
      title: "Friction hotspot",
      value: frictionProject.name,
      detail: `${Math.round(frictionProject.rate * 100)}% of its sessions hit minor or notable friction.`,
    },
    {
      title: "Search-heavy work",
      value: `${searchHeavySessions.length} sessions`,
      detail: "The demo keeps web-assisted workflows visible without exposing real research prompts or fetch content.",
    },
    {
      title: "Solo shipping baseline",
      value: `${Math.round((shippedSoloSessions / Math.max(soloSessions, 1)) * 100)}%`,
      detail: "A useful comparison point for teams deciding when extra agents are actually worth the overhead.",
    },
  ];
}

export const ingestSummary = {
  sourceLabel: dataset.sourceLabel,
  modeLabel: dataset.mode === "demo" ? "Demo mode" : "User data",
  generatedAt: dataset.generatedAt,
  sessionCountLabel: `${dataset.sessions.length} safe synthetic sessions`,
};

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "Demo Sessions",
    value: String(analytics.overview.totalSessions),
    detail: `Synthetic spread across ${analytics.projectSummaries.length} fictional projects.`,
  },
  {
    label: "Agent Involvement",
    value: `${Math.round(analytics.overview.agentSessionRate * 100)}%`,
    detail: "Share of sessions that spawn one or more supporting agents.",
  },
  {
    label: "Workflow Friction",
    value: `${Math.round(analytics.overview.frictionSessionRate * 100)}%`,
    detail: "Sessions marked with minor or notable friction in the synthetic dataset.",
  },
  {
    label: "Estimated Spend",
    value: `$${analytics.overview.estimatedSpendUsd.toFixed(2)}`,
    detail: "Derived from configurable demo pricing, not hardcoded placeholder copy.",
  },
];

export const projectSnapshots: ProjectSnapshot[] = analytics.projectSummaries.map((project) => ({
  name: project.name,
  sessions: project.sessions,
  focus: `${project.area} workflows`,
  detail: `${project.linesChanged} lines changed, ${Math.round(project.agentSessionRate * 100)}% agent-assisted, ${project.dominantOutcome} dominant outcome.`,
}));

export const toolSnapshots: ToolSnapshot[] = analytics.toolHighlights.map((tool) => ({
  name: tool.name,
  invocations: tool.invocations,
  detail: `Used in ${tool.sessionCoverage} sessions.`,
}));

export const dailyTrend: DailyTrendPoint[] = analytics.dailyActivity;

export const capabilitySnapshots: CapabilitySnapshot[] = analytics.capabilityUsage.map(
  (capability) => ({
    name: capability.name,
    sessions: capability.sessions,
    rateLabel: `${Math.round(capability.rate * 100)}% of sessions`,
  })
);

export const insightCards: InsightCard[] = buildInsightCards(sessions);

export const recentSessions: SessionSnapshot[] = getRecentSessions(sessions);

export const plannedViews: PlannedView[] = [
  {
    title: "Session Trend Dashboard",
    description: "Track throughput, cost, friction, and outcome patterns over time.",
  },
  {
    title: "Agent Orchestration View",
    description: "Understand when spawning extra agents helps and when it adds drag.",
  },
  {
    title: "Project Comparison",
    description: "Compare fictional repos by duration, tool usage, and completion signals.",
  },
  {
    title: "Local Ingest Pipeline",
    description: "Swap demo mode for user-provided local session data without changing the public-safe UI story.",
  },
  {
    title: "Exportable Demo Assets",
    description: "Use the committed poster assets to make the repo immediately legible on GitHub and social previews.",
  },
];
