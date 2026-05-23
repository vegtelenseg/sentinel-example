# Sentinel Playground

Browser companion to the [Sentinel documentation](https://vegtelenseg.github.io/sentinel/) — try [@siremzam/sentinel](https://github.com/siremzam/sentinel) policies without installing anything.

**[Open the playground →](https://vegtelenseg.github.io/sentinel-example/)**

The playground models a multi-tenant SaaS app: five roles, four resource types, sample users, a role hierarchy, and a starter policy set are **preloaded** so you can evaluate permissions immediately.

## Try it in two minutes

1. Open the playground and go to **Evaluate**.
2. Select **alice** (owner at `acme-corp`), action **invoice:approve**, resource **invoice**, tenant **acme-corp** — then run **Evaluate**. You should see **ALLOWED**.
3. Switch to **explain()** and run again to see which rules matched and which did not.
4. Try **dave** with **project:read** on **invoice** — this should **DENY** (actions must match their resource type).
5. Check **Audit Log** for the decision trail, or edit rules on **Policy Rules** and re-run.

For concepts and API details, see the [quickstart](https://vegtelenseg.github.io/sentinel/getting-started/quickstart) and [how evaluation works](https://vegtelenseg.github.io/sentinel/concepts/how-evaluation-works).

## Sample data

| | |
|---|---|
| **Tenants** | `acme-corp`, `globex-inc`, `initech` |
| **Subjects** | `alice` (owner @ acme), `bob` (admin @ acme), `carol` (manager @ acme), `dave` (member @ acme), `eve` (viewer @ acme) — several have cross-tenant roles |
| **Hierarchy** | `owner → admin → manager → member → viewer` (inherited permissions apply) |
| **Resources** | `invoice`, `project`, `user`, `report` |

Hit **Reset** on Policy Rules anytime to restore the default rule set.

## Tabs

| Tab | What you can do |
|---|---|
| **Policy Rules** | Browse, add, and remove allow/deny rules built with the fluent `PolicyFactory` API |
| **Subjects** | Manage users with multi-tenant role assignments and arbitrary attributes |
| **Evaluate** | Run `evaluate`, `explain`, and `permitted` against the live engine |
| **Hierarchy** | Edit role inheritance and apply changes to the engine |
| **Audit Log** | Inspect the decision trail with timestamps, matched rules, and timing |
| **Serialization** | Export rules to JSON and re-import via `ConditionRegistry` |
| **Settings** | Toggle `strictTenancy`, change `defaultEffect`, and resize the evaluation cache |

## Running locally

```bash
git clone https://github.com/vegtelenseg/sentinel-example.git
cd sentinel-example
npm install
npm run dev
```

Open http://localhost:5173/sentinel-example/.

Optional: point doc links at a local VitePress instance with `VITE_DOCS_URL=http://localhost:5173/sentinel`.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- Deployed to GitHub Pages via GitHub Actions
