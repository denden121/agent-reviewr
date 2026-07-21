# Agent guide (opencode)

This file gives the opencode agent project context for reviews and edits.

## Project

Monorepo with npm workspaces:

- `backend/` — Express + TypeScript REST API for tasks. In-memory store, validated
  input, centralised error handling. Tests with vitest + supertest.
- `frontend/` — React + Vite + TypeScript UI that consumes the API. Tests with
  vitest + @testing-library/react.

## Commands

- `npm ci` — install
- `npm test` — run all workspace tests
- `npm run lint` — lint all workspaces
- `npm run build` — type-check + build both workspaces

## Conventions

- TypeScript strict mode is on; keep it that way.
- ESM everywhere (`"type": "module"`); use `.js` specifiers in relative imports.
- Keep the API contract in `backend/src/types.ts` and `frontend/src/api.ts` in sync.
- Prefer small, well-tested units. New endpoints need matching tests.

## Review guidance

When reviewing a pull request, prioritise correctness, security, and API-contract
consistency between backend and frontend. Reference concrete file paths and lines,
and don't invent issues when the diff is clean.
