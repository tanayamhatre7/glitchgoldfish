"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Search,
  FolderKanban,
  CircleCheck,
  Activity,
  FileText,
  Trash2,
} from "lucide-react";
import { useProjectActions, useProjects } from "@/hooks/use-genesis";
import { Button } from "@/components/ui/button";
import {
  ErrorMessage,
  PageHeading,
  StatePanel,
  StatusBadge,
} from "@/components/ui/common";
import { dateLabel } from "@/lib/utils";
import { isDemo } from "@/lib/api";
export function Dashboard() {
  const projects = useProjects();
  const { remove } = useProjectActions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);
  const data = projects.data ?? [];
  const filtered = data.filter(
    (p) =>
      p.project_name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "ALL" || p.status === filter),
  );
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="YOUR PROJECT WORKSPACE"
        title="Good ideas deserve a great plan."
        description="Turn your client’s requirements into a blueprint you can build on."
        action={
          <Button asChild>
            <Link href="/projects/new">
              <Plus size={17} />
              New project
            </Link>
          </Button>
        }
      />
      <section className="welcome-banner">
        <div>
          <span className="banner-kicker">
            THE PATH FROM WHAT IF TO WHAT’S NEXT
          </span>
          <h2>
            Less guesswork.
            <br />
            More groundwork.
          </h2>
          <p>
            Bring the problem. Genesis brings structure —
            <br className="desktop-break" /> from requirements to a client-ready
            project plan.
          </p>
          <Link href="/projects/new">
            Start a project <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="blueprint-illustration" aria-hidden="true">
          <div className="diagram-grid" />
          <div className="diagram-node node-input">
            <FileText size={17} />
            <span>Your requirements</span>
            <span className="tiny-dot" />
          </div>
          <div className="diagram-connector connector-one" />
          <div className="diagram-node node-genesis">
            <span className="diagram-logo">G</span>
            <div>
              GENESIS<small>Understand. Structure. Plan.</small>
            </div>
          </div>
          <div className="diagram-connector connector-two" />
          <div className="diagram-output">
            <span>Requirements</span>
            <span>Architecture</span>
            <span>Project plan</span>
          </div>
        </div>
      </section>
      <div className="stat-grid">
        {[
          {
            label: "Total projects",
            value: data.length,
            icon: FolderKanban,
            detail: "Your ideas, organized",
          },
          {
            label: "Blueprints ready",
            value: data.filter((p) => p.status === "COMPLETED").length,
            icon: CircleCheck,
            detail: "Ready for your next step",
          },
          {
            label: "In progress",
            value: data.filter((p) =>
              ["PROCESSING", "ANALYZING"].includes(p.status),
            ).length,
            icon: Activity,
            detail: "Taking shape with Genesis",
          },
        ].map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <stat.icon size={18} />
            </div>
            <strong>{projects.isPending ? "—" : stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        ))}
      </div>
      <section className="projects-section">
        <div className="section-top">
          <div>
            <h2>
              Your projects <span className="count-pill">{data.length}</span>
            </h2>
            <p>Every great build starts here.</p>
          </div>
          <label className="search-input">
            <Search size={17} />
            <input
              aria-label="Search projects"
              placeholder="Search projects…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className="project-filters" aria-label="Project status filter">
          {[
            ["ALL", "All projects"],
            ["COMPLETED", "Completed"],
            ["CREATED", "Drafts"],
            ["ANALYZING", "Analyzing"],
            ["PROCESSING", "Processing"],
            ["FAILED", "Failed"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <ErrorMessage error={remove.error} />
        {projects.isPending ? (
          <StatePanel loading title="Loading projects…" />
        ) : projects.isError ? (
          <StatePanel
            error
            title="Projects could not be loaded"
            message={projects.error.message}
            retry={() => projects.refetch()}
          />
        ) : filtered.length === 0 ? (
          <StatePanel
            title={
              data.length
                ? "No matching projects"
                : "Your first blueprint starts here"
            }
            message={
              data.length
                ? "Try another search or status filter."
                : "Create a project and tell us what your client wants to build."
            }
          />
        ) : (
          <div className="project-grid">
            {filtered.map((project, index) => (
              <article className="project-card" key={project.project_id}>
                <div className="project-card-top">
                  <span className={`project-icon project-icon-${index % 3}`}>
                    <FolderKanban size={21} />
                  </span>
                  <StatusBadge status={project.status} />
                </div>
                <h3>
                  <Link href={`/projects/${project.project_id}`}>
                    {project.project_name}
                  </Link>
                </h3>
                <p>{project.project_description}</p>
                <div className="project-date">
                  <span>Created {dateLabel(project.created_at)}</span>
                  <span>Updated {dateLabel(project.updated_at)}</span>
                </div>
                <div className="project-card-bottom">
                  <Link
                    className="card-action"
                    href={
                      project.status === "COMPLETED"
                        ? `/projects/${project.project_id}/blueprint/overview`
                        : ["PROCESSING", "ANALYZING", "FAILED"].includes(
                              project.status,
                            )
                          ? `/projects/${project.project_id}/analysis`
                          : `/projects/${project.project_id}`
                    }
                  >
                    {project.status === "COMPLETED"
                      ? "View blueprint"
                      : project.status === "CREATED"
                        ? "Continue project"
                        : "View analysis"}
                    <ArrowRight size={15} />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${project.project_name}`}
                    onClick={() => setDeleting(project.project_id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
                {deleting === project.project_id && (
                  <div className="delete-confirm" role="alert">
                    <p>Delete this project and its artifacts?</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={remove.isPending}
                      onClick={async () => {
                        try {
                          await remove.mutateAsync(project.project_id);
                          setDeleting(null);
                        } catch {}
                      }}
                    >
                      Delete project
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={remove.isPending}
                      onClick={() => setDeleting(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </article>
            ))}
            <Link href="/projects/new" className="new-project-card">
              <span>
                <Plus size={25} />
              </span>
              <h3>Your next big idea</h3>
              <p>Let’s make a plan for it.</p>
              <strong>
                Create a project <ArrowUpRight size={15} />
              </strong>
            </Link>
          </div>
        )}
      </section>
      <div className="dashboard-footnote">
        <span className="tiny-dot" />
        <p>
          {isDemo
            ? "Demo mode · Sample projects and simulated analysis. Your uploaded file contents stay on your device."
            : "Connected to your configured Genesis API. Project data is managed by your backend."}
        </p>
      </div>
    </div>
  );
}
