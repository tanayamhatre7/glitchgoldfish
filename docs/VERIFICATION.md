# Frontend verification — 6 October 2026

## Automated
- Strict TypeScript check.
- ESLint.
- Production build with Next.js 16.3.8.
- Seven Node tests: blueprint references; optional progress/status validation; mock project→upload→analysis→blueprint→delete persistence; file validation; malformed/server error responses; timeout/cancellation; exact HTTP upload path and multipart handling.

The test runner needs normal OS user access on this Windows host. Its first sandboxed launch failed before executing tests; rerunning outside the sandbox passed all seven.

## Browser walkthrough
- Dashboard and project cards render with clearly labeled demo mode.
- Created `Booking Portal — QA` through details → review → create.
- Selected `tests/requirements-sample.txt`; filename and size displayed correctly.
- Verified project ID returned by the mock adapter is retained and upload status is UPLOADED.
- Analysis required an explicit start action; completion and document PROCESSED state displayed independently.
- Opened the completed blueprint and successfully navigated all 18 sections.
- Requirements preserve IDs and document source references; combining NON_FUNCTIONAL with HIGH produces the expected empty state.
- Quotation displays INR from fixture data, the recommended range and assumptions.
- Tested 390×844 mobile viewport: quotation and dashboard fit without page overflow; navigation opens and closes after selecting a destination.
- Verified dashboard search empty state, missing-blueprint recovery link, and unavailable-project error with retry.
- No browser console errors were captured in the walkthrough.
- Fixed keyboard activation of the analysis link while a file is selected/pending.
- Fixed mobile blueprint navigation intrinsic grid width that caused horizontal page overflow.

Preview capture: [desktop blueprint](screenshots/blueprint-desktop.jpg).

## Limits
No FastAPI instance, real document processor, or AI orchestrator was provided. Mock results are representative fixture data, not analysis of the uploaded file. Contract tests validate the proposed HTTP interface, not the team’s eventual live implementation. See BACKEND_CONTRACT.md for decisions required before live integration. PDF export and removal of already uploaded documents are deferred.
