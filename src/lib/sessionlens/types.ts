export type WorkflowOutcome = "shipped" | "progressed" | "research" | "blocked";

export type FrictionLevel = "smooth" | "minor" | "notable";

export interface SessionProject {
  id: string;
  name: string;
  area: string;
}

export interface CapabilityFlags {
  taskAgent: boolean;
  mcp: boolean;
  webSearch: boolean;
  webFetch: boolean;
}

export interface NormalizedSession {
  id: string;
  startedAt: string;
  durationMinutes: number;
  workflowKind: string;
  project: SessionProject;
  userTurns: number;
  assistantTurns: number;
  toolCounts: Record<string, number>;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  agentInvocations: number;
  capabilities: CapabilityFlags;
  gitCommits: number;
  gitPushes: number;
  linesAdded: number;
  linesRemoved: number;
  filesModified: number;
  outcome: WorkflowOutcome;
  friction: FrictionLevel;
}

export interface SessionSource {
  id: string;
  label: string;
  mode: "demo" | "filesystem";
  readSessions(): NormalizedSession[];
}

export interface IngestedSessionDataset {
  sourceId: string;
  sourceLabel: string;
  mode: "demo" | "filesystem";
  generatedAt: string;
  sessions: NormalizedSession[];
}

export interface SessionOverviewMetrics {
  totalSessions: number;
  totalTokens: number;
  estimatedSpendUsd: number;
  averageDurationMinutes: number;
  agentSessionRate: number;
  frictionSessionRate: number;
}

export interface DailyActivityPoint {
  date: string;
  sessions: number;
  tokens: number;
  agentSessions: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  area: string;
  sessions: number;
  totalTokens: number;
  averageDurationMinutes: number;
  linesChanged: number;
  agentSessionRate: number;
  dominantOutcome: WorkflowOutcome;
}

export interface ToolHighlight {
  name: string;
  invocations: number;
  sessionCoverage: number;
}

export interface CapabilityUsage {
  name: string;
  sessions: number;
  rate: number;
}

export interface SessionAnalytics {
  overview: SessionOverviewMetrics;
  dailyActivity: DailyActivityPoint[];
  projectSummaries: ProjectSummary[];
  toolHighlights: ToolHighlight[];
  capabilityUsage: CapabilityUsage[];
}
