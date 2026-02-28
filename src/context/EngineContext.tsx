import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import {
  AccessEngine,
  RoleHierarchy,
  createPolicyFactory,
  toAuditEntry,
  exportRulesToJson,
  importRulesFromJson,
  ConditionRegistry,
  type PolicyRule,
  type Subject,
  type AuditEntry,
  type Decision,
  type ExplainResult,
  type ConditionError,
  type ResourceContext,
} from "@siremzam/sentinel";
import {
  type AppSchema,
  ALL_ROLES,
  DEFAULT_SUBJECTS,
} from "../lib/schema";

const { allow, deny } = createPolicyFactory<AppSchema>();

export interface EngineConfig {
  strictTenancy: boolean;
  cacheSize: number;
  defaultEffect: "deny" | "allow";
}

export type HierarchyEntry = [AppSchema["roles"], AppSchema["roles"][]];

export interface EngineState {
  config: EngineConfig;
  hierarchy: HierarchyEntry[];
  subjects: Subject<AppSchema>[];
  auditLog: AuditEntry[];
  conditionErrors: ConditionError[];
  ruleVersion: number;
}

const CONDITIONS_REGISTRY = new ConditionRegistry<AppSchema>();
CONDITIONS_REGISTRY.register(
  "isOwner",
  (ctx) => ctx.subject.id === ctx.resourceContext.ownerId,
);
CONDITIONS_REGISTRY.register(
  "isActive",
  (ctx) => ctx.resourceContext.status === "active",
);
CONDITIONS_REGISTRY.register("throwingCondition", () => {
  throw new Error("Simulated condition failure");
});

function buildDefaultRules(): PolicyRule<AppSchema>[] {
  return [
    allow()
      .id("admin-full-access")
      .roles("admin", "owner")
      .anyAction()
      .anyResource()
      .describe("Admins and owners have full access")
      .build(),

    allow()
      .id("manager-invoices")
      .roles("manager")
      .actions("invoice:create", "invoice:read", "invoice:approve", "invoice:send")
      .on("invoice")
      .describe("Managers can do anything with invoices")
      .build(),

    allow()
      .id("member-own-invoices")
      .roles("member")
      .actions("invoice:read", "invoice:create")
      .on("invoice")
      .when((ctx) => ctx.subject.id === ctx.resourceContext.ownerId)
      .describe("Members can read/create their own invoices")
      .build(),

    allow()
      .id("viewer-read-all")
      .roles("viewer")
      .actions("invoice:read", "project:read", "user:read", "report:read")
      .anyResource()
      .describe("Viewers can read everything")
      .build(),

    deny()
      .id("no-impersonation")
      .anyRole()
      .actions("user:impersonate")
      .on("user")
      .describe("Nobody can impersonate by default")
      .build(),

    allow()
      .id("owner-impersonate")
      .roles("owner")
      .actions("user:impersonate")
      .on("user")
      .priority(10)
      .describe("Except owners, who can impersonate")
      .build(),

    allow()
      .id("member-projects")
      .roles("member")
      .actions("project:read")
      .on("project")
      .describe("Members can read projects")
      .build(),

    allow()
      .id("manager-reports")
      .roles("manager")
      .actions("report:read", "report:export")
      .on("report")
      .when((ctx) => ctx.resourceContext.status === "active")
      .describe("Managers can read/export active reports")
      .build(),
  ];
}

const DEFAULT_HIERARCHY: HierarchyEntry[] = [
  ["owner", ["admin"]],
  ["admin", ["manager"]],
  ["manager", ["member"]],
  ["member", ["viewer"]],
];

interface EngineContextValue {
  engine: AccessEngine<AppSchema>;
  state: EngineState;
  getRules: () => ReadonlyArray<PolicyRule<AppSchema>>;
  addRule: (rule: PolicyRule<AppSchema>) => void;
  removeRule: (id: string) => void;
  clearRules: () => void;
  loadDefaultRules: () => void;
  updateConfig: (config: Partial<EngineConfig>) => void;
  updateHierarchy: (hierarchy: HierarchyEntry[]) => void;
  addSubject: (subject: Subject<AppSchema>) => void;
  removeSubject: (id: string) => void;
  evaluate: (
    subject: Subject<AppSchema>,
    action: AppSchema["actions"],
    resource: AppSchema["resources"],
    resourceContext?: ResourceContext,
    tenantId?: string,
  ) => Decision<AppSchema>;
  explain: (
    subject: Subject<AppSchema>,
    action: AppSchema["actions"],
    resource: AppSchema["resources"],
    resourceContext?: ResourceContext,
    tenantId?: string,
  ) => ExplainResult<AppSchema>;
  permitted: (
    subject: Subject<AppSchema>,
    resource: AppSchema["resources"],
    actions: AppSchema["actions"][],
    resourceContext?: ResourceContext,
    tenantId?: string,
  ) => Set<AppSchema["actions"]>;
  exportRules: () => string;
  importRules: (json: string) => void;
  clearAuditLog: () => void;
  clearConditionErrors: () => void;
  cacheStats: { size: number; maxSize: number } | null;
  clearCache: () => void;
  conditionsRegistry: ConditionRegistry<AppSchema>;
  buildAllow: typeof allow;
  buildDeny: typeof deny;
}

const EngineContext = createContext<EngineContextValue | null>(null);

function buildHierarchy(entries: HierarchyEntry[]): RoleHierarchy<AppSchema> {
  const h = new RoleHierarchy<AppSchema>();
  for (const [role, parents] of entries) {
    h.define(role, parents);
  }
  return h;
}

function createEngine(
  config: EngineConfig,
  hierarchy: HierarchyEntry[],
  auditLogRef: React.MutableRefObject<AuditEntry[]>,
  conditionErrorsRef: React.MutableRefObject<ConditionError[]>,
  onUpdate: () => void,
): AccessEngine<AppSchema> {
  return new AccessEngine<AppSchema>({
    schema: {} as AppSchema,
    defaultEffect: config.defaultEffect,
    strictTenancy: config.strictTenancy,
    cacheSize: config.cacheSize,
    roleHierarchy: buildHierarchy(hierarchy),
    onDecision: (decision: Decision<AppSchema>) => {
      const entry = toAuditEntry(decision);
      auditLogRef.current = [entry, ...auditLogRef.current].slice(0, 200);
      onUpdate();
    },
    onConditionError: (err: ConditionError) => {
      conditionErrorsRef.current = [err, ...conditionErrorsRef.current].slice(0, 50);
      onUpdate();
    },
  });
}

export function EngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EngineState>({
    config: { strictTenancy: false, cacheSize: 100, defaultEffect: "deny" },
    hierarchy: DEFAULT_HIERARCHY,
    subjects: DEFAULT_SUBJECTS,
    auditLog: [],
    conditionErrors: [],
    ruleVersion: 0,
  });

  const auditLogRef = useRef<AuditEntry[]>([]);
  const conditionErrorsRef = useRef<ConditionError[]>([]);

  const triggerUpdate = useCallback(() => {
    setState((s) => ({
      ...s,
      auditLog: auditLogRef.current,
      conditionErrors: conditionErrorsRef.current,
    }));
  }, []);

  const engineRef = useRef<AccessEngine<AppSchema>>(
    createEngine(
      state.config,
      state.hierarchy,
      auditLogRef,
      conditionErrorsRef,
      triggerUpdate,
    ),
  );

  const rulesRef = useRef<PolicyRule<AppSchema>[]>(buildDefaultRules());

  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const rebuildEngine = useCallback(
    (config: EngineConfig, hierarchy: HierarchyEntry[]) => {
      const eng = createEngine(
        config,
        hierarchy,
        auditLogRef,
        conditionErrorsRef,
        triggerUpdate,
      );
      eng.addRules(...rulesRef.current);
      engineRef.current = eng;
      forceUpdate();
    },
    [triggerUpdate, forceUpdate],
  );

  // Initialize engine with default rules on first render
  const initialized = useRef(false);
  if (!initialized.current) {
    engineRef.current.addRules(...rulesRef.current);
    initialized.current = true;
  }

  const value = useMemo<EngineContextValue>(() => {
    const eng = engineRef.current;
    return {
      engine: eng,
      state,
      getRules: () => eng.getRules(),
      addRule: (rule) => {
        eng.addRule(rule);
        rulesRef.current = [...rulesRef.current, rule];
        setState((s) => ({ ...s, ruleVersion: s.ruleVersion + 1 }));
        forceUpdate();
      },
      removeRule: (id) => {
        eng.removeRule(id);
        rulesRef.current = rulesRef.current.filter((r) => r.id !== id);
        setState((s) => ({ ...s, ruleVersion: s.ruleVersion + 1 }));
        forceUpdate();
      },
      clearRules: () => {
        eng.clearRules();
        rulesRef.current = [];
        setState((s) => ({ ...s, ruleVersion: s.ruleVersion + 1 }));
        forceUpdate();
      },
      loadDefaultRules: () => {
        eng.clearRules();
        const rules = buildDefaultRules();
        eng.addRules(...rules);
        rulesRef.current = rules;
        setState((s) => ({ ...s, ruleVersion: s.ruleVersion + 1 }));
        forceUpdate();
      },
      updateConfig: (partial) => {
        setState((s) => {
          const newConfig = { ...s.config, ...partial };
          rebuildEngine(newConfig, s.hierarchy);
          return { ...s, config: newConfig, ruleVersion: s.ruleVersion + 1 };
        });
      },
      updateHierarchy: (hierarchy) => {
        setState((s) => {
          rebuildEngine(s.config, hierarchy);
          return { ...s, hierarchy, ruleVersion: s.ruleVersion + 1 };
        });
      },
      addSubject: (subject) => {
        setState((s) => ({
          ...s,
          subjects: [...s.subjects, subject],
        }));
      },
      removeSubject: (id) => {
        setState((s) => ({
          ...s,
          subjects: s.subjects.filter((sub) => sub.id !== id),
        }));
      },
      evaluate: (subject, action, resource, resourceContext = {}, tenantId?) => {
        return eng.evaluate(subject, action, resource, resourceContext, tenantId);
      },
      explain: (subject, action, resource, resourceContext = {}, tenantId?) => {
        return eng.explain(subject, action, resource, resourceContext, tenantId);
      },
      permitted: (subject, resource, actions, resourceContext = {}, tenantId?) => {
        return eng.permitted(subject, resource, actions, resourceContext, tenantId);
      },
      exportRules: () => {
        return exportRulesToJson(eng.getRules());
      },
      importRules: (json) => {
        const rules = importRulesFromJson<AppSchema>(json, CONDITIONS_REGISTRY);
        eng.clearRules();
        eng.addRules(...rules);
        rulesRef.current = [...rules];
        setState((s) => ({ ...s, ruleVersion: s.ruleVersion + 1 }));
        forceUpdate();
      },
      clearAuditLog: () => {
        auditLogRef.current = [];
        setState((s) => ({ ...s, auditLog: [] }));
      },
      clearConditionErrors: () => {
        conditionErrorsRef.current = [];
        setState((s) => ({ ...s, conditionErrors: [] }));
      },
      cacheStats: eng.cacheStats,
      clearCache: () => eng.clearCache(),
      conditionsRegistry: CONDITIONS_REGISTRY,
      buildAllow: allow,
      buildDeny: deny,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, forceUpdate, rebuildEngine]);

  return (
    <EngineContext.Provider value={value}>{children}</EngineContext.Provider>
  );
}

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used within EngineProvider");
  return ctx;
}

export { ALL_ROLES };
