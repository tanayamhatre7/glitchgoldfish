"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, FileText } from "lucide-react";
import { useProjectActions } from "@/hooks/use-genesis";
import { projectInputSchema } from "@/types/genesis";
import { Button } from "@/components/ui/button";
import { ErrorMessage, PageHeading } from "@/components/ui/common";
import { FilePicker } from "./document-upload";
export function ProjectForm() {
  const router = useRouter();
  const { create, upload } = useProjectActions();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState(false);
  const [project_id, setProjectId] = useState<string>();
  const [validation, setValidation] = useState("");
  const busy = create.isPending || upload.isPending;
  const save = async () => {
    try {
      let id = project_id;
      if (!id) {
        const project = await create.mutateAsync({
          project_name: name.trim(),
          project_description: description.trim(),
        });
        id = project.project_id;
        setProjectId(id);
      }
      if (file) await upload.mutateAsync({ project_id: id, file });
      router.push(`/projects/${id}`);
    } catch {}
  };
  return (
    <div className="page-container narrow">
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={15} />
        All projects
      </Link>
      <PageHeading
        eyebrow="A CLEAR START"
        title="What are we building?"
        description="Start with your client’s problem. We’ll help you turn it into a plan."
      />
      <div className="flow-steps">
        <span className={!review ? "current" : "done"}>
          <b>{review ? <Check size={13} /> : "1"}</b>Project details
        </span>
        <i />
        <span className={review ? "current" : ""}>
          <b>2</b>Review input
        </span>
        <i />
        <span>
          <b>3</b>Generate blueprint
        </span>
      </div>
      <div className="panel form-panel">
        {!review ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const result = projectInputSchema.safeParse({
                project_name: name,
                project_description: description,
              });
              if (!result.success) {
                setValidation(result.error.issues[0].message);
                return;
              }
              setValidation("");
              setReview(true);
            }}
          >
            <h2>Tell us about the project</h2>
            <p className="muted">
              A little context now makes for a stronger blueprint later.
            </p>
            <label className="field-label" htmlFor="project-name">
              Project name <span>*</span>
            </label>
            <input
              className="text-input"
              id="project-name"
              placeholder="e.g. Food Delivery Platform"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <label className="field-label" htmlFor="project-description">
              Client problem statement <span>*</span>
            </label>
            <textarea
              className="text-input"
              id="project-description"
              rows={7}
              placeholder="Who is this for? What problem should it solve? Include key features, constraints, and anything your client has shared."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
            <p className="field-hint">
              Describe the outcome, the people using it, and what matters most.
            </p>
            <label className="field-label">
              Requirement document <span className="optional">Optional</span>
            </label>
            <FilePicker file={file} onChange={setFile} />
            {validation && (
              <p role="alert" className="field-error">
                {validation}
              </p>
            )}
            <div className="form-footer">
              <span>Your input stays editable before analysis.</span>
              <Button type="submit">
                Review input <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="section-top">
              <h2>Review your input</h2>
              <FileText size={24} />
            </div>
            <dl className="review-details">
              <dt>Project name</dt>
              <dd>{name}</dd>
              <dt>Client problem statement</dt>
              <dd className="preserve-lines">{description}</dd>
              <dt>Requirement document</dt>
              <dd>
                {file
                  ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB`
                  : "No document selected"}
              </dd>
            </dl>
            <p className="info-note">
              Creating the project saves your input. You’ll start analysis from
              the project workspace.
            </p>
            <ErrorMessage error={create.error || upload.error} />
            {project_id && upload.isError && (
              <p className="muted">
                Your project is already saved. Retry this upload or{" "}
                <Link className="text-link" href={`/projects/${project_id}`}>
                  continue without the file
                </Link>
                .
              </p>
            )}
            <div className="form-footer">
              <Button
                variant="ghost"
                disabled={busy || Boolean(project_id)}
                onClick={() => setReview(false)}
              >
                <ArrowLeft size={15} />
                Edit input
              </Button>
              <Button disabled={busy} onClick={save}>
                {upload.isPending
                  ? "Uploading document…"
                  : create.isPending
                    ? "Creating project…"
                    : project_id
                      ? "Retry upload"
                      : "Create project"}
                {!busy && <ArrowRight size={16} />}
              </Button>
            </div>
            <p role="status" className="sr-only">
              {busy ? "Saving your project input" : ""}
            </p>
          </div>
        )}
      </div>
      <p className="under-form">
        Good input, better outcomes. You can start with a problem statement and
        add a document for context.
      </p>
    </div>
  );
}
