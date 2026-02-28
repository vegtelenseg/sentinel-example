import { useState } from "react";
import { useEngine } from "../context/EngineContext";
import { ALL_ACTIONS, ALL_RESOURCES, TENANTS } from "../lib/schema";
import type { AppSchema } from "../lib/schema";
import type { Decision, ExplainResult } from "@siremzam/sentinel";

type Tab = "evaluate" | "explain" | "permitted";

export default function EvaluatePanel() {
  const { state, evaluate, explain, permitted } = useEngine();
  const [tab, setTab] = useState<Tab>("evaluate");
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? "");
  const [action, setAction] = useState<AppSchema["actions"]>(ALL_ACTIONS[0]);
  const [resource, setResource] = useState<AppSchema["resources"]>(ALL_RESOURCES[0]);
  const [tenantId, setTenantId] = useState<string>("");
  const [ownerId, setOwnerId] = useState("");
  const [resStatus, setResStatus] = useState("");
  const [decision, setDecision] = useState<Decision<AppSchema> | null>(null);
  const [explainResult, setExplainResult] = useState<ExplainResult<AppSchema> | null>(null);
  const [permittedResult, setPermittedResult] = useState<Set<AppSchema["actions"]> | null>(null);
  const [permittedActions, setPermittedActions] = useState<AppSchema["actions"][]>(ALL_ACTIONS);
  const [error, setError] = useState("");

  const subject = state.subjects.find((s) => s.id === subjectId);
  const buildCtx = () => {
    const ctx: Record<string, unknown> = {};
    if (ownerId) ctx.ownerId = ownerId;
    if (resStatus) ctx.status = resStatus;
    return ctx;
  };

  const run = () => {
    if (!subject) { setError("Select a subject"); return; }
    setError("");
    try {
      if (tab === "evaluate") {
        setDecision(evaluate(subject, action, resource, buildCtx(), tenantId || undefined));
      } else if (tab === "explain") {
        setExplainResult(explain(subject, action, resource, buildCtx(), tenantId || undefined));
      } else {
        setPermittedResult(permitted(subject, resource, permittedActions, buildCtx(), tenantId || undefined));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setDecision(null); setExplainResult(null); setPermittedResult(null);
    }
  };

  const toggleAction = (a: AppSchema["actions"]) =>
    setPermittedActions((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-mono text-lg font-bold text-steel-200 tracking-tight">Evaluate</h2>
        <p className="font-mono text-[11px] text-steel-500 mt-0.5">
          evaluate() &middot; explain() &middot; permitted()
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-0 border border-steel-700 rounded w-fit overflow-hidden">
        {([ ["evaluate", "evaluate()"], ["explain", "explain()"], ["permitted", "permitted()"] ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 font-mono text-xs font-medium transition-colors ${
              tab === key ? "bg-accent-cyan/10 text-accent-cyan" : "text-steel-500 hover:text-steel-300"
            }`}>{label}</button>
        ))}
      </div>

      {/* Form */}
      <div className="surface rounded p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="label-micro mb-1.5">Subject</div>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-dark">
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.roles.map((r) => `${r.role}${r.tenantId ? `@${r.tenantId}` : ""}`).join(", ")})
                </option>
              ))}
            </select>
          </div>
          {tab !== "permitted" && (
            <div>
              <div className="label-micro mb-1.5">Action</div>
              <select value={action} onChange={(e) => setAction(e.target.value as AppSchema["actions"])} className="input-dark">
                {ALL_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
          <div>
            <div className="label-micro mb-1.5">Resource</div>
            <select value={resource} onChange={(e) => setResource(e.target.value as AppSchema["resources"])} className="input-dark">
              {ALL_RESOURCES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <div className="label-micro mb-1.5">Tenant</div>
            <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="input-dark">
              <option value="">No tenant</option>
              {TENANTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="label-micro mb-1.5">resourceContext.ownerId</div>
            <input type="text" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="e.g. alice" className="input-dark" />
          </div>
          <div>
            <div className="label-micro mb-1.5">resourceContext.status</div>
            <input type="text" value={resStatus} onChange={(e) => setResStatus(e.target.value)} placeholder="e.g. active" className="input-dark" />
          </div>
        </div>

        {tab === "permitted" && (
          <div>
            <div className="label-micro mb-1.5">Actions to check</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ACTIONS.map((a) => (
                <button key={a} onClick={() => toggleAction(a)}
                  className={`chip transition-colors ${
                    permittedActions.includes(a) ? "border-accent-amber text-accent-amber" : "border-steel-700 text-steel-600"
                  }`}>{a}</button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="font-mono text-xs text-accent-rose border border-accent-rose/30 bg-accent-rose/5 px-3 py-2 rounded">{error}</div>
        )}

        <button onClick={run} className="btn-primary w-full">
          {tab === "evaluate" ? "Evaluate" : tab === "explain" ? "Explain" : "Get Permitted"}
        </button>
      </div>

      {/* Results */}
      {tab === "evaluate" && decision && (
        <div className={`surface rounded overflow-hidden flex`}>
          <div className={`w-1 shrink-0 ${decision.allowed ? "bg-accent-emerald" : "bg-accent-rose"}`} />
          <div className="p-5 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`font-mono text-xl font-bold ${decision.allowed ? "text-accent-emerald" : "text-accent-rose"}`}>
                {decision.allowed ? "ALLOWED" : "DENIED"}
              </span>
            </div>
            <p className="font-mono text-xs text-steel-400 mb-3">{decision.reason}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div><span className="label-micro block mb-0.5">Effect</span><span className="text-steel-200">{decision.effect}</span></div>
              <div><span className="label-micro block mb-0.5">Matched Rule</span><span className="text-steel-200">{decision.matchedRule?.id ?? "none"}</span></div>
              <div><span className="label-micro block mb-0.5">Duration</span><span className="text-steel-200">{decision.durationMs.toFixed(3)}ms</span></div>
              <div><span className="label-micro block mb-0.5">Timestamp</span><span className="text-steel-200">{new Date(decision.timestamp).toLocaleTimeString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === "explain" && explainResult && (
        <div className="space-y-3">
          <div className={`surface rounded overflow-hidden flex`}>
            <div className={`w-1 shrink-0 ${explainResult.allowed ? "bg-accent-emerald" : "bg-accent-rose"}`} />
            <div className="p-4 flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm font-bold ${explainResult.allowed ? "text-accent-emerald" : "text-accent-rose"}`}>
                  {explainResult.allowed ? "ALLOWED" : "DENIED"}
                </span>
                <span className="font-mono text-xs text-steel-400">{explainResult.reason}</span>
              </div>
              <span className="font-mono text-[10px] text-steel-600">{explainResult.durationMs.toFixed(3)}ms</span>
            </div>
          </div>

          <div className="label-micro">Rule Trace ({explainResult.evaluatedRules.length} rules)</div>
          <div className="space-y-1">
            {explainResult.evaluatedRules.map((er, i) => (
              <div key={i} className={`surface rounded p-3 font-mono text-xs ${
                er.matched ? (er.rule.effect === "allow" ? "border-accent-emerald/30" : "border-accent-rose/30") : ""
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`chip ${er.rule.effect === "allow" ? "border-accent-emerald/50 text-accent-emerald" : "border-accent-rose/50 text-accent-rose"}`}>
                    {er.rule.effect}
                  </span>
                  <code className="text-steel-200 font-semibold">{er.rule.id}</code>
                  {er.matched && (
                    <span className="ml-auto chip border-accent-cyan/50 text-accent-cyan font-bold">MATCHED</span>
                  )}
                </div>
                <div className="flex gap-4 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${er.roleMatched ? "bg-accent-emerald" : "bg-steel-700"}`} />
                    <span className="text-steel-500">role</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${er.actionMatched ? "bg-accent-emerald" : "bg-steel-700"}`} />
                    <span className="text-steel-500">action</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${er.resourceMatched ? "bg-accent-emerald" : "bg-steel-700"}`} />
                    <span className="text-steel-500">resource</span>
                  </span>
                </div>
                {er.conditionResults.length > 0 && (
                  <div className="flex gap-2 mt-1.5 pt-1.5 border-t border-steel-700/50">
                    {er.conditionResults.map((cr) => (
                      <span key={cr.index} className={`text-[10px] ${cr.passed ? "text-accent-emerald" : "text-accent-rose"}`}>
                        cond#{cr.index} {cr.passed ? "pass" : cr.error ? `err: ${cr.error}` : "fail"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "permitted" && permittedResult && (
        <div className="surface rounded p-5">
          <div className="label-micro mb-1">
            Permitted for <span className="text-accent-cyan">{subjectId}</span> on <span className="text-steel-200">{resource}</span>
          </div>
          <p className="font-mono text-[11px] text-steel-600 mb-4">Drive UI rendering: button visibility, menu items</p>
          <div className="flex flex-wrap gap-2">
            {permittedActions.map((a) => {
              const yes = permittedResult.has(a);
              return (
                <div key={a} className={`chip font-mono ${
                  yes ? "border-accent-emerald/50 text-accent-emerald" : "border-steel-700 text-steel-700 line-through"
                }`}>{a}</div>
              );
            })}
          </div>
          <p className="font-mono text-[10px] text-steel-600 mt-3">
            Set&lt;{permittedResult.size}&gt;: {JSON.stringify([...permittedResult])}
          </p>
        </div>
      )}
    </div>
  );
}
