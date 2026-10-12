import Link from "next/link";
export default function NotFound() {
  return (
    <div className="state-panel">
      <h1>Page not found</h1>
      <p>This workspace section does not exist.</p>
      <Link className="text-link" href="/dashboard">
        Back to projects
      </Link>
    </div>
  );
}
