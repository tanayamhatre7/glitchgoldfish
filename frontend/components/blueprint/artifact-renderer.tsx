"use client";
import { useState } from "react";
import type { Artifact, JsonValue, Requirement } from "@/types/genesis";
import { humanize } from "@/lib/utils";
import { StatePanel, StatusBadge } from "@/components/ui/common";

function isObject(value: JsonValue): value is Artifact {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const isId = (key: string) => key.endsWith("_id");
function formatNumber(value: number, currency?: string) {
  if (!currency) return new Intl.NumberFormat("en-IN").format(value);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-IN")}`;
  }
}
export function StructuredValue({
  value,
  currency,
  depth = 0,
}: {
  value: JsonValue | undefined;
  currency?: string;
  depth?: number;
}) {
  if (value === undefined || value === null)
    return <span className="muted">Not provided</span>;
  if (Array.isArray(value)) {
    if (!value.length) return <span className="muted">None provided</span>;
    return value.every((item) => typeof item !== "object" || item === null) ? (
      <ul className="artifact-list">
        {value.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    ) : (
      <div className="nested-cards">
        {value.map((item, index) => (
          <div className="nested-card" key={index}>
            <StructuredValue
              value={item}
              currency={currency}
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }
  if (isObject(value)) {
    if (typeof value.min === "number" && typeof value.max === "number")
      return (
        <strong className="range-value">
          {formatNumber(value.min, currency)}
          <span> – </span>
          {formatNumber(value.max, currency)}
        </strong>
      );
    const localCurrency =
      typeof value.currency === "string" ? value.currency : currency;
    if (!Object.keys(value).length)
      return <span className="muted">Not provided yet</span>;
    return (
      <dl className={`artifact-fields depth-${depth}`}>
        {Object.entries(value).map(([key, child]) => (
          <div
            className={`artifact-field ${isId(key) ? "id-field" : ""}`}
            key={key}
          >
            <dt>{humanize(key)}</dt>
            <dd>
              {isId(key) && typeof child === "string" ? (
                <code>{child}</code>
              ) : (
                <StructuredValue
                  value={child}
                  currency={localCurrency}
                  depth={depth + 1}
                />
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  return <span className="preserve-lines">{String(value)}</span>;
}
export function ArtifactSection({
  value,
  title,
}: {
  value: JsonValue | undefined;
  title: string;
}) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [sort, setSort] = useState("DEFAULT");
  const [activePhase, setActivePhase] = useState<number | null>(null);

  if (
    value == null ||
    (Array.isArray(value) && !value.length) ||
    (isObject(value) && !Object.keys(value).length)
  )
    return (
      <StatePanel
        title={`No ${title.toLowerCase()} available`}
        message="This section has not been provided in the blueprint yet."
      />
    );
  if (Array.isArray(value)) {
    let items = value.filter(
      (item) =>
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase()) &&
        (priority === "ALL" || (isObject(item) && item.priority === priority)),
    );
    if (sort === "TITLE")
      items = [...items].sort((a, b) =>
        String(isObject(a) ? (a.title ?? a.name ?? "") : a).localeCompare(
          String(isObject(b) ? (b.title ?? b.name ?? "") : b),
        ),
      );
    return (
      <>
        {title === "Development tasks" && (
          <div className="filter-row">
            <input
              className="text-input"
              aria-label="Search tasks"
              placeholder="Search tasks or modules…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Task priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="ALL">All priorities</option>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              aria-label="Sort tasks"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="DEFAULT">Original order</option>
              <option value="TITLE">Title A–Z</option>
            </select>
          </div>
        )}
        <div className="artifact-card-grid">
          {items.map((item, index) => (
            <article className="panel artifact-card" key={index}>
              <StructuredValue value={item} />
            </article>
          ))}
        </div>
        {!items.length && (
          <StatePanel
            title="No matching tasks"
            message="Try clearing your filters."
          />
        )}
      </>
    );
  }
  if (title === "Architecture" && isObject(value)) {
    return (
      <div className="custom-architecture">
        <div className="arch-visual">
          <div className="arch-components">
            {(value.components as any[])?.map((c, i) => (
              <div className="arch-node" key={i}>
                <strong>{c.name}</strong>
                <p>{c.responsibility}</p>
              </div>
            ))}
          </div>
          <div className="arch-flow">
            <h4>Data Flow & Relationships</h4>
            <ul>
              {(value.relationships as string[])?.map((r, i) => (
                <li key={`r-${i}`}>{r}</li>
              ))}
              {(value.data_flow as string[])?.map((f, i) => (
                <li key={`f-${i}`}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
        <section className="panel artifact-card" style={{ marginTop: 24 }}>
          <StructuredValue value={value} />
        </section>
      </div>
    );
  }

  if (title === "Roadmap" && isObject(value)) {
    return (
      <div className="custom-roadmap">
        <div className="roadmap-timeline">
          {(value.phases as any[])?.map((p, i) => {
            const isActive = activePhase === i;
            return (
              <div
                className={`roadmap-phase ${isActive ? "active" : ""}`}
                key={i}
                onClick={() => setActivePhase(isActive ? null : i)}
              >
                <div
                  className={`phase-marker ${isActive ? "active-marker" : ""}`}
                >
                  {i + 1}
                </div>
                <div className="phase-content">
                  <h3
                    style={{
                      margin: 0,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{p.name}</span>
                    <span
                      className="phase-duration"
                      style={{ fontSize: "13px" }}
                    >
                      {isActive
                        ? "Click to close"
                        : p.duration || p.estimated_duration || "View details"}
                    </span>
                  </h3>

                  <div
                    className="phase-details"
                    style={{
                      maxHeight: isActive ? "800px" : "0",
                      opacity: isActive ? 1 : 0,
                      overflow: "hidden",
                      transition: "all 0.3s ease-in-out",
                      marginTop: isActive ? "16px" : "0",
                    }}
                  >
                    {p.description ? (
                      <p
                        className="phase-description"
                        style={{
                          fontSize: "15px",
                          color: "#5a6b61",
                          lineHeight: "1.6",
                          marginBottom: "12px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #e1e8e5",
                        }}
                      >
                        {p.description}
                      </p>
                    ) : null}

                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#5a6b61",
                      }}
                    >
                      {(p.milestones || p.tasks || []).map(
                        (m: string, j: number) => (
                          <li
                            key={j}
                            style={{ marginBottom: "8px", fontSize: "15px" }}
                          >
                            {m}
                          </li>
                        ),
                      )}
                    </ul>

                    {!p.description && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 13,
                          color: "#909993",
                          fontStyle: "italic",
                        }}
                      >
                        (Generate a new project to see detailed AI descriptions
                        here)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="panel artifact-card">
      <StructuredValue value={value} />
    </section>
  );
}
export function RequirementsView({
  requirements,
}: {
  requirements: Requirement[];
}) {
  const [type, setType] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const filtered = requirements.filter(
    (r) =>
      (type === "ALL" || r.type === type) &&
      (priority === "ALL" || r.priority === priority) &&
      (status === "ALL" || r.status === status),
  );
  return (
    <>
      <div className="filter-row">
        {[
          {
            label: "Requirement type",
            value: type,
            setter: setType,
            values: [...new Set(requirements.map((r) => r.type))],
            all: "All types",
          },
          {
            label: "Requirement priority",
            value: priority,
            setter: setPriority,
            values: [...new Set(requirements.map((r) => r.priority))],
            all: "All priorities",
          },
          {
            label: "Requirement status",
            value: status,
            setter: setStatus,
            values: [...new Set(requirements.map((r) => r.status))],
            all: "All statuses",
          },
        ].map((filter) => (
          <select
            key={filter.label}
            aria-label={filter.label}
            value={filter.value}
            onChange={(event) => filter.setter(event.target.value)}
          >
            <option value="ALL">{filter.all}</option>
            {filter.values.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </select>
        ))}
        <span className="muted">
          {filtered.length} of {requirements.length}
        </span>
      </div>
      {!filtered.length ? (
        <StatePanel
          title="No requirements found"
          message="There are no requirements matching this selection."
        />
      ) : (
        <div className="requirements-list">
          {filtered.map((requirement) => (
            <article
              className="panel requirement-card"
              id={requirement.requirement_id}
              key={requirement.requirement_id}
            >
              <div className="requirement-meta">
                <code>{requirement.requirement_id}</code>
                <span>{humanize(requirement.type)}</span>
                <StatusBadge status={requirement.priority} />
              </div>
              <h3>{requirement.description}</h3>
              <div className="requirement-source">
                <span>
                  Source:{" "}
                  {requirement.source_reference
                    ? [
                        requirement.source_reference.section,
                        requirement.source_reference.page
                          ? `Page ${requirement.source_reference.page}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Not specified"
                    : "Not specified"}
                  {requirement.document_id && ` · ${requirement.document_id}`}
                </span>
                <span>{humanize(requirement.status)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
export function TraceabilityView({ rows }: { rows: Artifact[] }) {
  const [search, setSearch] = useState("");
  const columns = [
    ["requirement_id", "Requirement"],
    ["feature_id", "Feature"],
    ["user_story_id", "User story"],
    ["architecture_component_id", "Component"],
    ["database_entity_id", "Entity"],
    ["api_design_id", "API"],
    ["task_id", "Task"],
  ];
  const filtered = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <p className="section-description">
        Follow the connection from a client requirement to the work needed to
        deliver it.
      </p>
      <input
        className="text-input trace-search"
        aria-label="Search traceability"
        placeholder="Find a requirement, feature, or task ID…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {filtered.length ? (
        <div className="table-scroll panel">
          <table>
            <caption className="sr-only">
              Requirement to delivery traceability
            </caption>
            <thead>
              <tr>
                {columns.map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={String(row.traceability_id ?? index)}>
                  {columns.map(([key]) => (
                    <td key={key}>
                      {row[key] == null ? (
                        <span className="muted">Not linked</span>
                      ) : (
                        <code>
                          {Array.isArray(row[key])
                            ? row[key].join(", ")
                            : String(row[key])}
                        </code>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <StatePanel
          title="No traceability links found"
          message="No relationships match this selection."
        />
      )}
    </>
  );
}
