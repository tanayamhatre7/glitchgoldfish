# Genesis frontend implementation plan

## 1. Architecture
Next.js App Router + React + strict TypeScript, Tailwind CSS and local shadcn/ui primitives. Screens call TanStack Query hooks; hooks call a typed GenesisApi interface; interchangeable mock and HTTP adapters implement that interface. No HTTP or fixture imports in UI. No backend, AI, document extraction, pricing engine, authentication, or future lifecycle tools are implemented here.

## 2. Folder structure
```
frontend/
  app/                         route entry points, global styles, providers
  components/{ui,layout,project,blueprint}/
  hooks/                       server queries and mutation orchestration
  lib/api/{client,http,mocks}/  transport, validation, isolated demo data
  lib/constants/               status labels and section navigation
  types/                       shared wire schemas and inferred types
  tests/                       contract and workflow checks
docs/                          architecture and integration handoff
```

## 3. Routes
`/` redirects to `/dashboard`; `/dashboard` lists projects; `/projects/new` collects and reviews input; `/projects/[project_id]` resumes input and shows document records; `/projects/[project_id]/analysis` starts/retries and observes analysis; `/projects/[project_id]/blueprint/[section]` deep-links to each generated section. Unknown sections show a not-found page.

## 4. Component hierarchy
RootLayout → Providers → AppShell → Dashboard / ProjectForm / ProjectWorkspace / AnalysisScreen / BlueprintWorkspace. BlueprintWorkspace → grouped section navigation → section renderer → requirements filters, structured artifact cards, estimates and traceability table. Shared Button, Badge, StatePanel and heading components handle consistent interaction and feedback.

## 5. Shared TypeScript types
Central Zod schemas infer Project, ProjectInput, Document, Analysis, Requirement and Blueprint. Keep all snake_case application IDs and exact enums. Known fields are validated at the API boundary. The supplied nested objects are not finalized: render additional structured artifact data without renaming fields, and document proposed fixture fields separately. Optional progress remains optional. Missing blueprint sections render empty states, never invented values.

## 6. API client
GenesisApi exposes project CRUD, uploadDocument, submitRequirements, startAnalysis, getAnalysisStatus, getBlueprint, getEstimation, getQuotation and getTraceability. HTTP requests use the specified endpoint paths, URL-encoded project IDs, a configured base URL, cancellation and timeout, safe errors and runtime response validation. Multipart uploads leave Content-Type to the browser. No automatic retries of writes.

## 7. Mock API
Separate, explicitly labeled demo adapter; same method signatures and response validation as HTTP. Browser-local persistence stores project metadata, document metadata and simulated analysis state, not uploaded bytes. One coherent example blueprint demonstrates every section. Newly created projects receive a clearly identified sample blueprint, not claimed analysis of their input. Simulation occurs only inside the mock adapter. HTTP mode is the default; demo is explicitly enabled in local configuration.

## 8. Creation flow
Name + problem statement + optional PDF/DOCX/TXT → client validation → review → createProject → returned project_id → upload selected file → project workspace. If upload fails, retain the returned ID and retry upload without creating a duplicate project. Local file removal/replacement is supported before upload. Post-upload removal is deferred because no document DELETE endpoint is agreed.

## 9. Upload flow
Validate extension and nonempty size; display selected filename and bytes; show indeterminate upload state → display returned UPLOADED/VALIDATING/PROCESSING/PROCESSED/FAILED status. Successful upload never implies extraction success. No invented size cap or document-list endpoint. Proposed optional `documents` on project/analysis responses supplies status updates when supported; otherwise the last known upload state is explicitly identified.

## 10. Analysis flow
Start action → observe backend status → poll while PROCESSING/ANALYZING → stop on COMPLETED/FAILED and unmount; cancel stale reads. Show numeric progress only if returned. No invented agent stage. Retry failures manually; do not automatically start analysis on mount. COMPLETED links to blueprint. Long-running analysis remains viewable without a fabricated completion timer in HTTP mode.

## 11. Blueprint information architecture
Discover: Overview, Scope, Requirements, Roles, Features, User Stories.
Design: Architecture, Technology Stack, Database, APIs, Security.
Plan: Development Tasks, Effort, Timeline, Cost, Quotation, Roadmap, Traceability.
Each section has its own URL. Requirements filter by type, priority and status. Task lists support filtering. Estimates display backend ranges, confidence, assumptions and currency; no frontend recomputation. API designs are read-only artifacts. Traceability references retain shared IDs.

## 12. State management
TanStack Query owns server data and invalidation; local React state owns forms, selected files, review state and filters. Routes own current project and section. No Zustand until cross-route UI state warrants it. Query cache is not duplicated into a global blueprint store.

## 13. Integration contract
See BACKEND_CONTRACT.md. Given contract fields/endpoints are stable. Response envelopes, error format, auth/CORS, document status updates, nested blueprint fields, analysis restart semantics and upload limits require Member 1/3/4 agreement. Proposed fields are clearly separated from agreed fields. Switching adapters is configuration, not a component rewrite.

## 14. Loading, error and empty states
Every query displays loading, safe error + retry, and absent/empty result states. HTTP 404 for an unavailable blueprint becomes a missing-blueprint state. Schema violations produce a readable integration error rather than a crash. Upload and analysis failures preserve the project. Accessible status announcements, keyboard focus, labeled inputs and responsive scroll containers support laptop, tablet and mobile use.

## 15. Development sequence
1. Record architecture and unresolved contract decisions (this document).
2. Scaffold frontend, theme and navigation.
3. Add runtime schemas, API interface, HTTP adapter and fixtures.
4. Add query hooks, dashboard, project review/create and upload.
5. Add analysis polling, recovery and blueprint navigation.
6. Add all artifact sections and filters.
7. Check types, lint, contract/error behavior, production build and browser workflow.
8. Handoff for backend contract review; configure HTTP base URL and validate against FastAPI when available.

Setup references: https://nextjs.org/docs/app/getting-started/installation and https://ui.shadcn.com/docs/installation/manual.
