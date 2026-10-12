# Project Genesis

Professional project-planning workspace built with Next.js App Router, React, TypeScript, Tailwind CSS, shadcn-style local UI primitives and TanStack Query. Includes dashboard, reviewed project creation, PDF/DOCX/TXT upload, project input editing, analysis polling and all 18 blueprint sections.

## Current progress
- **Frontend MVP:** dashboard, project creation and editing, document upload, analysis-status screens, and all 18 blueprint sections are implemented. The browser demo uses clearly labeled sample data.
- **Backend integration:** a centralized FastAPI client and shared contracts are ready. No FastAPI service or LangGraph implementation is present here, so real-backend integration remains pending.
- **Gemini experiment:** `frontend/app/api/ollama/route.ts` is a separate experimental server route that calls Google Gemini, despite the `ollama` directory name. It is not connected to the Genesis API client or the UI's mock analysis flow. `frontend/ollama-output.json` and `frontend/test-validation.ts` are local generation/schema-validation artifacts.

See [the verification report](docs/VERIFICATION.md) and [the integration handoff](docs/BACKEND_CONTRACT.md) for details.

## Run locally
Requires Node.js 20.9+ and npm.
```
cd frontend
npm install
npm run dev
```
Open http://127.0.0.1:3000/dashboard. The supplied git-ignored `.env.local` enables the labeled demo. On a fresh checkout, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_MODE=mock` to use demo mode. The default is HTTP mode.

Demo data persists in this browser under `genesis-demo-v1`. New projects receive an explicitly labeled illustrative food-delivery blueprint. Files are not extracted and no AI inference occurs. Clear that storage entry to reset demo data. Real API mode uses the configured FastAPI base URL and never substitutes fixtures.

## Check
```
npm run typecheck
npm run lint
npm test
npm run build
```

## Architecture and integration
- [Frontend architecture and 15-part implementation plan](docs/FRONTEND_ARCHITECTURE.md)
- [Backend contract, proposed fields and team handoff](docs/BACKEND_CONTRACT.md)
- `frontend/types/genesis.ts`: shared schemas / wire types / GenesisApi interface
- `frontend/lib/api`: validated HTTP transport and separate mock implementation
- `frontend/hooks/use-genesis.ts`: server-state queries and mutation invalidation

The backend is not present, so actual FastAPI integration remains unverified. Nested artifact shapes, document status updates, auth/CORS, pagination and mutation idempotency need team agreement. There is no document-delete endpoint in the supplied contract. The frontend supports removing/replacing a selected local file before upload, and clearly distinguishes upload receipt from successful processing.

## Credentials and deployment
Copy `frontend/.env.example` to `frontend/.env.local` and provide credentials locally. `.env.local` and all other environment files are ignored by Git. Never commit an API key. A Gemini key is required only for the experimental Gemini route; rotate any key that has been shared or exposed. The experimental route has no authentication or rate limiting, so do not expose it on a public deployment until those protections are added.
