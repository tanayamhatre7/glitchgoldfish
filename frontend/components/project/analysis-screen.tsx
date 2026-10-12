"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import {
  useAnalysis,
  useProject,
  useProjectActions,
} from "@/hooks/use-genesis";
import { Button } from "@/components/ui/button";
import {
  ErrorMessage,
  PageHeading,
  StatePanel,
  StatusBadge,
} from "@/components/ui/common";
import { isDemo } from "@/lib/api";
import { DocumentList } from "./document-upload";
export function AnalysisScreen({ project_id }: { project_id: string }) {
  const project = useProject(project_id);
  const analysis = useAnalysis(project_id);
  const { start } = useProjectActions(project_id);
  if (analysis.isPending || project.isPending)
    return <StatePanel loading title="Loading analysis status…" />;
  if (analysis.isError || project.isError)
    return (
      <StatePanel
        error
        title="Unable to check analysis"
        message={(analysis.error || project.error)?.message}
        retry={() => {
          analysis.refetch();
          project.refetch();
        }}
      />
    );
  const data = analysis.data;
  const running = data.status === "ANALYZING" || data.status === "PROCESSING";
  const completed = data.status === "COMPLETED";
  const failed = data.status === "FAILED";
  return (
    <div className="page-container narrow">
      <Link className="back-link" href={`/projects/${project_id}`}>
        <ArrowLeft size={15} />
        Project input
      </Link>
      <PageHeading
        eyebrow="GENESIS ANALYSIS"
        title={project.data.project_name}
        description="From your client’s requirements to a structured engineering plan."
      />
      <section className="panel analysis-panel">
        <div className={`analysis-symbol ${completed ? "complete" : ""}`}>
          {completed ? (
            <Check size={30} />
          ) : running ? (
            <LoaderCircle className="animate-spin" size={30} />
          ) : (
            <Sparkles size={30} />
          )}
        </div>
        <StatusBadge status={data.status} />
        <h2>
          {completed
            ? "Your blueprint is ready to explore."
            : failed
              ? "Analysis needs your attention."
              : running
                ? "Your project is taking shape."
                : "Let’s give your project a clear direction."}
        </h2>
        <p>
          {completed
            ? "Review the generated plan, assumptions and estimates before sharing with your client."
            : failed
              ? data.error_message ||
                "Genesis could not complete this analysis. You can retry below."
              : running
                ? "Genesis is working on your project. You can leave this page and return to check its status."
                : "Your saved problem statement and uploaded documents will be used to generate a project blueprint."}
        </p>
        {data.progress !== undefined && (
          <div className="analysis-progress">
            <progress
              max={100}
              value={data.progress}
              aria-label="Analysis progress"
            />
            <span>{data.progress}%</span>
          </div>
        )}
        <div className="analysis-stages">
          <div className="stage done">
            <FileText size={18} />
            <strong>Project input</strong>
            <small>Saved</small>
          </div>
          <span>→</span>
          <div
            className={`stage ${running ? "current" : completed ? "done" : ""}`}
          >
            <Sparkles size={18} />
            <strong>Genesis analysis</strong>
            <small>
              {running
                ? "In progress"
                : completed
                  ? "Complete"
                  : "Awaiting start"}
            </small>
          </div>
          <span>→</span>
          <div className={`stage ${completed ? "done" : ""}`}>
            <Check size={18} />
            <strong>Project blueprint</strong>
            <small>{completed ? "Ready to review" : "Not yet available"}</small>
          </div>
        </div>
        {running && (
          <p className="field-hint" role="status">
            Checking status automatically. Detailed stage progress is not
            available.
          </p>
        )}
        <ErrorMessage error={start.error} />
        {completed ? (
          <Button asChild>
            <Link href={`/projects/${project_id}/blueprint/overview`}>
              Explore blueprint <ArrowRight size={16} />
            </Link>
          </Button>
        ) : (
          !running && (
            <Button disabled={start.isPending} onClick={() => start.mutate()}>
              {start.isPending
                ? "Starting analysis…"
                : failed
                  ? "Retry analysis"
                  : "Start Genesis analysis"}
              <ArrowRight size={16} />
            </Button>
          )
        )}
      </section>
      {(data.documents || project.data.documents)?.length ? (
        <section className="panel form-panel">
          <h2>Document processing</h2>
          <DocumentList
            documents={data.documents ?? project.data.documents ?? []}
            lastKnown={!data.documents}
          />
        </section>
      ) : null}

    </div>
  );
}
