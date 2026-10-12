"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers3,
  CheckCircle2,
  FileText,
  Network,
  CalendarRange,
  ChevronRight,
} from "lucide-react";
import { useBlueprint, useProject } from "@/hooks/use-genesis";
import { sections } from "@/lib/constants/navigation";
import { StatePanel, StatusBadge } from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import {
  ArtifactSection,
  RequirementsView,
  StructuredValue,
  TraceabilityView,
} from "./artifact-renderer";
import type { Blueprint } from "@/types/genesis";
import { dateLabel } from "@/lib/utils";
import { isDemo } from "@/lib/api";
export function BlueprintWorkspace({
  project_id,
  section,
}: {
  project_id: string;
  section: string;
}) {
  const blueprint = useBlueprint(project_id);
  const project = useProject(project_id);
  const selected = sections.find((item) => item[0] === section)!;
  if (blueprint.isPending || project.isPending)
    return <StatePanel loading title="Loading blueprint…" />;
  if (blueprint.isError || project.isError)
    return (
      <StatePanel
        error
        title="Blueprint unavailable"
        message={(blueprint.error || project.error)?.message}
        retry={() => {
          blueprint.refetch();
          project.refetch();
        }}
      />
    );
  if (!blueprint.data)
    return (
      <div className="page-container">
        <StatePanel
          title="No blueprint generated yet"
          message="Start analysis from the project workspace, then return here to review the plan."
        />
        <Button asChild>
          <Link href={`/projects/${project_id}/analysis`}>Go to analysis</Link>
        </Button>
      </div>
    );
  const data = blueprint.data;
  const base = `/projects/${project_id}/blueprint`;
  return (
    <div className="blueprint-page">
      <div className="blueprint-header">
        <div>
          <Link className="back-link" href={`/projects/${project_id}`}>
            <ArrowLeft size={14} />
            Project workspace
          </Link>
          <h1>{project.data.project_name}</h1>
          <p>
            <Layers3 size={14} />
            Project blueprint <span>·</span> Version {data.version}{" "}
            <span>·</span> Updated {dateLabel(data.updated_at)}
          </p>
        </div>
        <StatusBadge status={project.data.status} />
      </div>

      <div className="blueprint-layout">
        <aside className="blueprint-nav">
          <nav aria-label="Blueprint sections">
            {["Discover", "Design", "Plan"].map((group) => (
              <div key={group}>
                <p>{group}</p>
                {sections
                  .filter((item) => item[2] === group)
                  .map(([key, label]) => (
                    <Link
                      aria-current={section === key ? "page" : undefined}
                      className={section === key ? "active" : ""}
                      key={key}
                      href={`${base}/${key}`}
                    >
                      {label}
                      {section === key && <ChevronRight size={14} />}
                    </Link>
                  ))}
              </div>
            ))}
          </nav>
        </aside>
        <div className="blueprint-content">
          <div className="blueprint-section-heading">
            <p className="eyebrow">{selected[2]} / BLUEPRINT</p>
            <h2>{selected[1]}</h2>
          </div>
          {section === "overview" ? (
            <Overview blueprint={data} base={base} />
          ) : section === "requirements" ? (
            <RequirementsView requirements={data.requirements ?? []} />
          ) : section === "traceability" ? (
            <TraceabilityView rows={data.traceability ?? []} />
          ) : (
            <>
              {[
                "effort_estimation",
                "timeline",
                "cost_estimation",
                "quotation",
              ].includes(section) && (
                <p className="info-note">
                  AI-generated planning guidance based on the stated
                  assumptions. Estimates and quotation ranges are
                  recommendations, not guarantees.
                </p>
              )}
              <ArtifactSection
                key={section}
                title={selected[1]}
                value={data[section as Exclude<keyof Blueprint, "version">]}
              />
              {section === "quotation" && (
                <p className="field-hint">
                  PDF quotation export is deferred for this MVP.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function Overview({ blueprint, base }: { blueprint: Blueprint; base: string }) {
  return (
    <>
      <section className="overview-intro">
        <span className="overview-icon">
          <CheckCircle2 size={25} />
        </span>
        <div>
          <h3>A clearer picture of what comes next.</h3>
          <p>
            Explore the scope, understand the design, and plan the delivery.
            Review assumptions with your client before committing.
          </p>
        </div>
      </section>
      <div className="blueprint-stats">
        {[
          [blueprint.requirements?.length ?? 0, "Requirements"],
          [blueprint.features?.length ?? 0, "Features"],
          [blueprint.development_breakdown?.length ?? 0, "Development tasks"],
          [blueprint.user_roles?.length ?? 0, "User roles"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="overview-cards">
        {[
          {
            icon: FileText,
            title: "Understand the scope",
            description:
              "Requirements, roles and features that define your project.",
            href: "scope",
            label: "Explore requirements",
          },
          {
            icon: Network,
            title: "See how it fits together",
            description:
              "Architecture, data, APIs and the technology behind the plan.",
            href: "architecture",
            label: "Review the design",
          },
          {
            icon: CalendarRange,
            title: "Plan your delivery",
            description:
              "Effort, timelines and a recommendation for your client.",
            href: "quotation",
            label: "View quotation",
          },
        ].map((item) => (
          <Link
            className="panel overview-card"
            href={`${base}/${item.href}`}
            key={item.href}
          >
            <item.icon size={24} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>
              {item.label}
              <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>
      <div className="overview-estimates">
        <section className="panel">
          <h3>Estimated effort</h3>
          {blueprint.effort_estimation?.estimated_hours ? (
            <>
              <StructuredValue
                value={blueprint.effort_estimation.estimated_hours}
              />
              <span className="muted"> hours</span>
            </>
          ) : (
            <p className="muted">Not provided</p>
          )}
          <p>Subject to scope and delivery assumptions.</p>
          <Link href={`${base}/effort_estimation`}>
            Review assumptions <ArrowRight size={14} />
          </Link>
        </section>
        <section className="panel">
          <h3>Estimated timeline</h3>
          {blueprint.timeline?.estimated_weeks ? (
            <>
              <StructuredValue value={blueprint.timeline.estimated_weeks} />
              <span className="muted"> weeks</span>
            </>
          ) : (
            <p className="muted">Not provided</p>
          )}
          <p>A planning range, not a fixed delivery date.</p>
          <Link href={`${base}/timeline`}>
            Explore phases <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </>
  );
}
