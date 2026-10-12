import { AlertCircle, LoaderCircle, FolderOpen } from "lucide-react";
import { Button } from "./button";
import { statusLabels } from "@/lib/constants/navigation";
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {statusLabels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
export function StatePanel({
  title,
  message,
  loading,
  error,
  retry,
}: {
  title: string;
  message?: string;
  loading?: boolean;
  error?: boolean;
  retry?: () => void;
}) {
  const Icon = loading ? LoaderCircle : error ? AlertCircle : FolderOpen;
  return (
    <div className="state-panel" role={error ? "alert" : "status"}>
      <Icon className={loading ? "animate-spin" : ""} size={28} />
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function ErrorMessage({ error }: { error: Error | null }) {
  return error ? (
    <div className="inline-error" role="alert">
      <AlertCircle size={17} />
      <span>{error.message}</span>
    </div>
  ) : null;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="description">{description}</p>}
      </div>
      {action}
    </div>
  );
}
