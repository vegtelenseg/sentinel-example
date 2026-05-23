export const DOCS_BASE =
  import.meta.env.VITE_DOCS_URL ?? "https://vegtelenseg.github.io/sentinel";

export const DOC_PATHS = {
  quickstart: `${DOCS_BASE}/getting-started/quickstart`,
  policyRules: `${DOCS_BASE}/concepts/policy-rules`,
  subjects: `${DOCS_BASE}/concepts/subjects-and-roles`,
  evaluation: `${DOCS_BASE}/concepts/how-evaluation-works`,
  explain: `${DOCS_BASE}/guides/explain-and-debugging`,
  uiPermissions: `${DOCS_BASE}/guides/ui-permissions`,
  hierarchy: `${DOCS_BASE}/concepts/role-hierarchy`,
  audit: `${DOCS_BASE}/guides/audit-logging`,
  serialization: `${DOCS_BASE}/guides/json-serialization`,
  multitenancy: `${DOCS_BASE}/concepts/multitenancy`,
  security: `${DOCS_BASE}/introduction/security`,
} as const;
