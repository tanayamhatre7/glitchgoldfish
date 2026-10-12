"use client";
import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { validateFile } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/common";
import type { ProjectDocument } from "@/types/genesis";
export function FilePicker({
  file,
  onChange,
  disabled,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const select = (candidate?: File) => {
    if (!candidate) return;
    try {
      validateFile(candidate);
      setError("");
      onChange(candidate);
    } catch (error) {
      setError((error as Error).message);
    }
  };
  return (
    <div>
      <div
        className={`upload-zone ${disabled ? "disabled" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) select(event.dataTransfer.files[0]);
        }}
      >
        <UploadCloud size={28} />
        <strong>{file ? file.name : "Bring your requirements along"}</strong>
        <p>
          {file
            ? `${(file.size / 1024).toFixed(1)} KB · Ready to upload`
            : "Drag a file here or choose one from your device."}
        </p>
        <input
          ref={input}
          type="file"
          className="sr-only"
          aria-label="Requirement document"
          accept=".pdf,.docx,.txt"
          disabled={disabled}
          onChange={(event) => {
            select(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <div className="button-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => input.current?.click()}
          >
            {file ? "Replace file" : "Choose file"}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <X size={14} />
              Remove
            </Button>
          )}
        </div>
        <small>PDF, DOCX or TXT · Optional</small>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function DocumentList({
  documents,
  lastKnown = false,
}: {
  documents: ProjectDocument[];
  lastKnown?: boolean;
}) {
  if (!documents.length)
    return (
      <p className="muted empty-inline">
        No documents uploaded. You can analyze the problem statement on its own.
      </p>
    );
  return (
    <div className="document-list">
      {documents.map((doc) => (
        <div className="document-row" key={doc.document_id}>
          <FileText size={21} />
          <div>
            <strong>{doc.filename}</strong>
            <small>
              {doc.document_id}
              {doc.file_size !== undefined
                ? ` · ${(doc.file_size / 1024).toFixed(1)} KB`
                : ""}
            </small>
            {doc.status === "FAILED" && (
              <p className="field-error">
                {doc.error_message ||
                  "Document processing failed. Review the document before retrying analysis."}
              </p>
            )}
          </div>
          <StatusBadge status={doc.status} />
        </div>
      ))}
      {lastKnown && (
        <p className="muted">
          Last reported upload status. Updated processing status is not
          currently available.
        </p>
      )}
    </div>
  );
}
