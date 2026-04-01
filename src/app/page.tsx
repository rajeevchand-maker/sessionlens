import {
  capabilitySnapshots,
  dailyTrend,
  ingestSummary,
  insightCards,
  plannedViews,
  projectSnapshots,
  recentSessions,
  summaryMetrics,
  toolSnapshots,
} from "@/lib/demo-data";

export default function HomePage() {
  const maxDailySessions = Math.max(...dailyTrend.map((point) => point.sessions), 1);
  const maxToolInvocations = Math.max(...toolSnapshots.map((tool) => tool.invocations), 1);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Local-first observability</p>
        <h1>Session observability without a hosted black box.</h1>
        <p className="hero-copy">
          Sessionlens turns Claude Code sessions and agent workflows into a readable local analytics
          layer. This demo runs on a synthetic ingest and a real metrics engine, so the
          product explains both the workflow questions and the implementation honestly.
        </p>
        <div className="hero-banner">
          <span>{ingestSummary.sessionCountLabel}</span>
          <span>Zero real prompts, paths, or transcripts</span>
          <span>Built to be adapted with Claude or Codex</span>
        </div>
        <div className="hero-grid">
          <div>
            <span className="hero-label">Current focus</span>
            <strong>Synthetic ingest and metrics engine</strong>
          </div>
          <div>
            <span className="hero-label">Dataset source</span>
            <strong>{ingestSummary.sourceLabel}</strong>
          </div>
          <div>
            <span className="hero-label">Mode</span>
            <strong>{ingestSummary.modeLabel}</strong>
          </div>
        </div>
      </section>

      <section className="insight-grid" aria-label="Insight cards">
        {insightCards.map((card) => (
          <article className="insight-card" key={card.title}>
            <p className="panel-label">{card.title}</p>
            <h2>{card.value}</h2>
            <p>{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="metric-grid" aria-label="Demo metrics">
        {summaryMetrics.map((metric) => (
          <article className="panel-card" key={metric.label}>
            <p className="panel-label">{metric.label}</p>
            <h2>{metric.value}</h2>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <article className="panel-card">
          <div className="section-heading">
            <p className="panel-label">Daily activity</p>
            <h2>Trend slices from the synthetic dataset</h2>
          </div>
          <ul className="bar-list">
            {dailyTrend.map((point) => (
              <li key={point.date}>
                <div className="bar-header">
                  <strong>{point.date}</strong>
                  <span>{point.sessions} sessions</span>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div
                    className="bar-fill"
                    style={{ width: `${(point.sessions / maxDailySessions) * 100}%` }}
                  />
                </div>
                <p>{point.agentSessions} agent-assisted sessions and {point.tokens.toLocaleString()} tokens.</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <p className="panel-label">Demo projects</p>
            <h2>Computed project summaries</h2>
          </div>
          <ul className="list-grid">
            {projectSnapshots.map((project) => (
              <li key={project.name}>
                <strong>{project.name}</strong>
                <p>{project.focus}</p>
                <span>{project.sessions} demo sessions</span>
                <p>{project.detail}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <p className="panel-label">Recent workflows</p>
          <h2>A safe demo story from session to insight</h2>
        </div>
        <div className="session-story-grid">
          {recentSessions.map((session) => (
            <article className="story-card" key={session.id}>
              <div className="story-header">
                <div>
                  <p className="panel-label">{session.project}</p>
                  <strong>{session.workflowKind}</strong>
                </div>
                <span>{session.durationLabel}</span>
              </div>
              <div className="story-badges">
                <span>{session.outcome}</span>
                <span>{session.friction} friction</span>
              </div>
              <p>{session.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="two-column">
        <article className="panel-card">
          <div className="section-heading">
            <p className="panel-label">Tool usage</p>
            <h2>Top workflow primitives</h2>
          </div>
          <ul className="bar-list">
            {toolSnapshots.map((tool) => (
              <li key={tool.name}>
                <div className="bar-header">
                  <strong>{tool.name}</strong>
                  <span>{tool.invocations} calls</span>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div
                    className="bar-fill bar-fill-alt"
                    style={{ width: `${(tool.invocations / maxToolInvocations) * 100}%` }}
                  />
                </div>
                <p>{tool.detail}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <p className="panel-label">Capability adoption</p>
            <h2>Signals worth preserving in the public schema</h2>
          </div>
          <ul className="list-grid">
            {capabilitySnapshots.map((capability) => (
              <li key={capability.name}>
                <strong>{capability.name}</strong>
                <p>{capability.rateLabel}</p>
                <span>{capability.sessions} sessions</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <p className="panel-label">Planned views</p>
          <h2>What the first public release should still grow into</h2>
        </div>
        <ul className="list-grid">
          {plannedViews.map((view) => (
            <li key={view.title}>
              <strong>{view.title}</strong>
              <p>{view.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
