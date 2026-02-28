# Sentinel — Interactive Example

An interactive playground for [@siremzam/sentinel](https://github.com/siremzam/sentinel), a type-safe, in-process access-control engine for TypeScript.

**[Live demo →](https://vegtelenseg.github.io/sentinel-example/)**

## What this demonstrates

The app models a multi-tenant SaaS scenario with five roles (`owner`, `admin`, `manager`, `member`, `viewer`), four resource types, and a set of policy rules. Every feature of the Sentinel engine is exposed through a tabbed UI:

| Tab | What you can do |
|---|---|
| **Policy Rules** | Browse, add, and remove allow/deny rules built with the fluent `PolicyFactory` API |
| **Subjects** | Manage users with multi-tenant role assignments and arbitrary attributes |
| **Evaluate** | Run `evaluate`, `explain`, and `permitted` queries against the live engine and see the full decision object |
| **Hierarchy** | Edit the role hierarchy (`owner → admin → manager → member → viewer`) and watch inherited permissions update |
| **Audit Log** | Inspect the `onDecision` audit trail with timestamps, matched rules, and context |
| **Serialization** | Export rules to JSON and re-import them via `exportRulesToJson` / `importRulesFromJson` with a `ConditionRegistry` |
| **Settings** | Toggle `strictTenancy`, change the `defaultEffect`, and resize the decision cache |

## Running locally

```bash
git clone https://github.com/vegtelenseg/sentinel-example.git
cd sentinel-example
npm install
npm run dev
```

Open http://localhost:5173/sentinel-example/.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- Deployed to GitHub Pages via GitHub Actions
