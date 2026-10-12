# Frontend / FastAPI integration handoff

The pasted Genesis brief is the source of the initial contract. There is no backend or shared OpenAPI schema in this repository yet. All nested fixture fields are proposals, not assertions about an implemented backend.

## Stable fields from the brief
- Project: `project_id`, `project_name`, `project_description`, `status`, `created_at`, `updated_at`.
- Project statuses: CREATED, PROCESSING, ANALYZING, COMPLETED, FAILED.
- Document: `document_id`, `project_id`, `filename`, `file_type`, `status`; statuses UPLOADED, VALIDATING, PROCESSING, PROCESSED, FAILED.
- Analysis: `project_id`, `status`, optional numeric `progress` from 0 to 100. No inferred progress or granular AI stages.
- Requirement: `requirement_id`, `project_id`, optional `document_id`, `type`, `description`, `priority`, optional `source_reference.page/section`, `status`.
- Blueprint: exact top-level keys from the supplied brief, including `development_breakdown`, `effort_estimation`, `cost_estimation`, all artifact arrays, timestamps and version.

## Implemented HTTP mappings
| Method | Path | Request | Current expected response |
| --- | --- | --- | --- |
| POST | /projects | project_name, project_description | Project |
| GET | /projects | — | Project[] (envelope/pagination pending) |
| GET | /projects/{project_id} | — | Project |
| PUT | /projects/{project_id} | project_name, project_description | Project |
| DELETE | /projects/{project_id} | — | 204 or JSON acknowledgement |
| POST | /projects/{project_id}/documents | multipart file field | Document |
| POST | /projects/{project_id}/requirements | proposed { requirements: Requirement[] } | proposed Requirement[] |
| POST | /projects/{project_id}/analyze | no body | Analysis |
| GET | /projects/{project_id}/analysis | — | Analysis |
| GET | /projects/{project_id}/blueprint | — | Blueprint |
| GET | /projects/{project_id}/estimation | — | proposed effort-estimation object |
| GET | /projects/{project_id}/quotation | — | proposed quotation object |
| GET | /projects/{project_id}/traceability | — | proposed traceability array |

The UI currently reads all blueprint sections from the blueprint endpoint. Dedicated estimation, quotation and traceability methods are available for later per-section fetches. Manual requirement submission is exposed only in the API interface, not as an MVP editor, because the request body is unconfirmed.

## Open questions for Member 1 (backend / AI)
1. Confirm list envelopes, pagination, authentication, CORS and date serialization (current validator expects UTC ISO timestamps).
2. Confirm document multipart field `file`, response `file_type` lowercase extension, file limits and malware/type validation at the server.
3. Confirm analysis restart semantics, cancellation, accepted project states and idempotency support. The frontend retries no write automatically. On timeout, refresh before retrying; a request may have succeeded on the server.
4. Agree optional `documents: Document[]` on GET project / analysis so the frontend can observe processing states. The frontend does not invent a document-list or document-delete endpoint. When absent, it shows the last upload response available in its session and labels it last-known. No promise of live processing status can be made without a backend source.
5. Agree safe `error_message` on failed analysis/documents. HTTP errors are summarized by status; raw server error bodies are not displayed.
6. Confirm missing blueprint semantics (currently HTTP 404), polling interval (2 seconds while active), status freshness and blueprint readiness at COMPLETED.
7. Confirm manual requirements body and dedicated estimation/quotation/traceability response shapes.

## Open questions for Member 3 (database)
Confirm nested artifact fields in `frontend/lib/api/mocks/fixtures.ts`, generated identifiers and linking cardinality. Schemas currently preserve nested JSON object keys because final shared shapes do not exist. This is deliberate flexibility, not a finalized nested contract. Replace permissive artifact schemas with agreed explicit schemas when OpenAPI becomes available.

Proposed fixture conventions: ranges `{min,max}`; effort `estimated_hours`; timeline `estimated_weeks` and `phases`; cost `currency`, `development_cost`, `third_party_costs`, `infrastructure_costs`, `total_estimated_cost`; quotation `recommended_range`, `pricing_basis`, `assumptions`, `validity`; traceability uses scalar references to each relationship stage. UI does not calculate prices or fabricate links. A custom renderer should be added if the agreed data is materially different.

## Open questions for Member 4 (documents)
Agree when validation and processing start, how statuses and failures are exposed, source page/section references, supported MIME types and maximum upload size. Client extension and empty-file checks are only convenience checks; backend validation remains authoritative. File bytes are sent only in HTTP mode. Demo mode stores metadata only.

## Switching to FastAPI
Set `NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `frontend/.env.local`, then restart/rebuild Next.js (public variables are bundled at build time). Configure backend CORS for the frontend origin. No credentials or API secrets belong in NEXT_PUBLIC variables. HTTP mode never falls back to mock data on error. Unknown modes use HTTP rather than silently selecting demo.

## Deferred deliberately
Auth UI, client collaboration, GitHub, code generation, payments, document deletion and PDF quotation export. No FastAPI backend or LangGraph AI orchestration has been implemented in this repository. A separate experimental Gemini route exists at `frontend/app/api/ollama/route.ts`; it is outside the GenesisApi adapter and analysis screens. That route currently lacks authentication and rate limiting; see the root README before deploying it.
