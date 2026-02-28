import type { SchemaDefinition, Subject } from "@siremzam/sentinel";

export interface AppSchema extends SchemaDefinition {
  roles: "owner" | "admin" | "manager" | "member" | "viewer";
  resources: "invoice" | "project" | "user" | "report";
  actions:
    | "invoice:create"
    | "invoice:read"
    | "invoice:approve"
    | "invoice:send"
    | "project:read"
    | "project:archive"
    | "user:read"
    | "user:impersonate"
    | "report:read"
    | "report:export";
}

export const ALL_ROLES: AppSchema["roles"][] = [
  "owner",
  "admin",
  "manager",
  "member",
  "viewer",
];

export const ALL_RESOURCES: AppSchema["resources"][] = [
  "invoice",
  "project",
  "user",
  "report",
];

export const ALL_ACTIONS: AppSchema["actions"][] = [
  "invoice:create",
  "invoice:read",
  "invoice:approve",
  "invoice:send",
  "project:read",
  "project:archive",
  "user:read",
  "user:impersonate",
  "report:read",
  "report:export",
];

export const TENANTS = ["acme-corp", "globex-inc", "initech"];

export const DEFAULT_SUBJECTS: Subject<AppSchema>[] = [
  {
    id: "alice",
    roles: [
      { role: "owner", tenantId: "acme-corp" },
      { role: "viewer", tenantId: "globex-inc" },
    ],
    attributes: { department: "executive" },
  },
  {
    id: "bob",
    roles: [
      { role: "admin", tenantId: "acme-corp" },
      { role: "member", tenantId: "globex-inc" },
    ],
    attributes: { department: "engineering" },
  },
  {
    id: "carol",
    roles: [
      { role: "manager", tenantId: "acme-corp" },
      { role: "member", tenantId: "globex-inc" },
    ],
    attributes: { department: "finance" },
  },
  {
    id: "dave",
    roles: [{ role: "member", tenantId: "acme-corp" }],
    attributes: { department: "engineering" },
  },
  {
    id: "eve",
    roles: [{ role: "viewer", tenantId: "acme-corp" }],
    attributes: { department: "support" },
  },
];
