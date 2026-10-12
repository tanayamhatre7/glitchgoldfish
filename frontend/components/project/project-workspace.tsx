"use client";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Pencil, Check } from "lucide-react";
import { useProject, useProjectActions } from "@/hooks/use-genesis";
import type { ProjectDocument } from "@/types/genesis";
import { Button } from "@/components/ui/button";
import {
  ErrorMessage,
  PageHeading,
  StatePanel,
  StatusBadge,
} from "@/components/ui/common";
import { FilePicker, DocumentList } from "./document-upload";
export function ProjectWorkspace({ project_id }: { project_id: string }) {
  const project = useProject(project_id);
  const { upload, update } = useProjectActions(project_id);
  const cache = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  if (project.isPending) return <StatePanel loading title="Loading project…" />;
  if (project.isError)
    return (
      <StatePanel
        error
        title="Project unavailable"
        message={project.error.message}
        retry={() => project.refetch()}
      />
    );
  const data = project.data;
  const lastUpload = cache.getQueryData<ProjectDocument>([
    "last-upload",
    project_id,
  ]);
  const documents = data.documents ?? (lastUpload ? [lastUpload] : []);
  const editable = data.status === "CREATED";
  return (
    <div className="page-container narrow">
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={15} />
        All projects
      </Link>
      <PageHeading
        eyebrow="PROJECT INPUT"
        title={data.project_name}
        action={<StatusBadge status={data.status} />}
      />
      <div className="panel form-panel">
        <div className="section-top">
          <h2>Client problem statement</h2>
          {editable && !editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setName(data.project_name);
                setDescription(data.project_description);
                setEditing(true);
              }}
            >
              <Pencil size={14} />
              Edit input
            </Button>
          )}
        </div>
        {editing ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!name.trim() || !description.trim()) return;
              try {
                await update.mutateAsync({
                  project_name: name.trim(),
                  project_description: description.trim(),
                });
                setEditing(false);
              } catch {}
            }}
          >
            <label className="field-label" htmlFor="edit-name">
              Project name
            </label>
            <input
              id="edit-name"
              className="text-input"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <label className="field-label" htmlFor="edit-description">
              Problem statement
            </label>
            <textarea
              id="edit-description"
              className="text-input"
              rows={5}
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <ErrorMessage error={update.error} />
            <div className="button-row">
              <Button
                disabled={
                  update.isPending || !name.trim() || !description.trim()
                }
                type="submit"
              >
                {update.isPending ? "Saving…" : "Save input"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="preserve-lines project-description">
            {data.project_description}
          </p>
        )}
        <hr />
        <h2>Requirement documents</h2>
        <DocumentList
          documents={documents}
          lastKnown={data.documents === undefined && Boolean(lastUpload)}
        />
        {data.documents === undefined && !lastUpload && (
          <p className="info-note">
            Your document list is currently unavailable. Previously uploaded
            documents may still be saved.
          </p>
        )}
        {editable && (
          <>
            <FilePicker
              file={file}
              onChange={setFile}
              disabled={upload.isPending}
            />
            {file && (
              <div className="button-row">
                <Button
                  disabled={upload.isPending}
                  onClick={async () => {
                    try {
                      await upload.mutateAsync({ project_id, file });
                      setFile(null);
                    } catch {}
                  }}
                >
                  {upload.isPending ? "Uploading…" : "Upload document"}
                </Button>
              </div>
            )}
            <ErrorMessage error={upload.error} />
            {upload.isSuccess && (
              <p className="success-message" role="status">
                <Check size={15} />
                Upload received. Processing status is shown above.
              </p>
            )}
            <p className="field-hint">
              Remove or replace a selected file before uploading. Uploaded
              documents cannot be removed in this MVP.
            </p>
          </>
        )}
      </div>
      <div className="panel next-step">
        <div>
          <h2>
            {data.status === "COMPLETED"
              ? "Your blueprint is ready"
              : editable
                ? "Ready to put the pieces together?"
                : "Follow your analysis"}
          </h2>
          <p>
            {editable
              ? "Review your input, then start Genesis analysis."
              : "Open the workspace to see the latest project state."}
          </p>
        </div>
        <Button asChild>
          <Link
            aria-disabled={upload.isPending || editing || Boolean(file)}
            tabIndex={upload.isPending || editing || file ? -1 : undefined}
            onClick={(event) => {
              if (upload.isPending || editing || file) event.preventDefault();
            }}
            className={
              upload.isPending || editing || file
                ? "pointer-events-none opacity-50"
                : ""
            }
            href={
              data.status === "COMPLETED"
                ? `/projects/${project_id}/blueprint/overview`
                : `/projects/${project_id}/analysis`
            }
          >
            {data.status === "COMPLETED"
              ? "View blueprint"
              : "Continue to analysis"}
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      {file && (
        <p className="field-hint">
          Upload or remove the selected file before continuing.
        </p>
      )}
    </div>
  );
}
