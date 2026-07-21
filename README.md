# agent-reviewr

A small full-stack **Tasks** app used to demonstrate an **AI code reviewer running
automatically on every pull request** via [opencode](https://opencode.ai) in GitHub
Actions.

## Stack

| Layer     | Tech                                             |
| --------- | ------------------------------------------------ |
| Backend   | Express + TypeScript, in-memory store, vitest    |
| Frontend  | React + Vite + TypeScript, @testing-library      |
| CI        | GitHub Actions — lint, test, build               |
| PR review | opencode agent (`anomalyco/opencode/github`)     |

## Project layout

```
backend/    Express REST API (Tasks CRUD)
frontend/   React UI
.github/workflows/
  ci.yml              lint + test + build on push & PR
  opencode-review.yml AI review on every PR
opencode.json         opencode agent config
AGENTS.md             project context for the agent
```

## Local development

```bash
npm install          # install all workspaces
npm run dev          # backend on :3001, frontend on :5173 (proxied /api)
```

Or per workspace:

```bash
npm run dev   --workspace backend
npm run dev   --workspace frontend
npm test             # all tests
npm run build        # type-check + build both
```

## API

| Method | Path              | Description        |
| ------ | ----------------- | ------------------ |
| GET    | `/api/health`     | health check       |
| GET    | `/api/tasks`      | list tasks         |
| POST   | `/api/tasks`      | create `{ title }` |
| PATCH  | `/api/tasks/:id`  | update title/done  |
| DELETE | `/api/tasks/:id`  | delete a task      |

## AI PR review

`.github/workflows/opencode-review.yml` runs the opencode agent on every pull
request (`opened`, `synchronize`, `reopened`, `ready_for_review`) and posts a
review comment. It authenticates to GitHub with the built-in `GITHUB_TOKEN`.

### Required secret

The agent uses **opencode Zen** with a free coding model (`opencode/grok-code`).
Sign in at <https://opencode.ai/auth>, create a Zen API key, and add it once as a
repo secret:

```bash
gh secret set OPENCODE_API_KEY --repo <owner>/agent-reviewr
```

Without this secret the review job cannot call the model. To use a different
model/provider, change `model:` and the `env:` key in
`.github/workflows/opencode-review.yml` (see <https://opencode.ai/docs/zen/>).
