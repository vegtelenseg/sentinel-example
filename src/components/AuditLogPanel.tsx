import { useEngine } from "../context/EngineContext";
import PanelHeader from "./PanelHeader";
import { DOC_PATHS } from "../lib/docs";

export default function AuditLogPanel() {
  const { state, clearAuditLog, clearConditionErrors } = useEngine();

  return (
    <div className="space-y-5">
      <PanelHeader
        title="Audit Log"
        description="Every evaluation is recorded here with the matched rule, effect, and timing. Run checks on Evaluate to populate this log."
        docHref={DOC_PATHS.audit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Decision log */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="label-micro">Decisions ({state.auditLog.length})</div>
            <button onClick={clearAuditLog} className="btn-outline text-sm py-1 px-2">Clear</button>
          </div>

          {state.auditLog.length === 0 ? (
            <div className="surface rounded p-8 text-center font-mono text-sm text-steel-600">
              No decisions yet. Run evaluations to see entries.
            </div>
          ) : (
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {state.auditLog.map((entry, i) => (
                <div key={i} className="surface rounded overflow-hidden flex">
                  <div className={`w-0.5 shrink-0 ${entry.allowed ? "bg-accent-emerald" : "bg-accent-rose"}`} />
                  <div className="p-3 flex-1 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${entry.allowed ? "text-accent-emerald" : "text-accent-rose"}`}>
                        {entry.allowed ? "ALLOW" : "DENY"}
                      </span>
                      <span className="text-steel-200">{entry.subjectId}</span>
                      <span className="text-steel-700">&rarr;</span>
                      <span className="text-accent-amber">{entry.action}</span>
                      <span className="text-steel-700">on</span>
                      <span className="text-steel-300">{entry.resource}</span>
                      {entry.tenantId && (
                        <><span className="text-steel-700">in</span><span className="text-accent-cyan">{entry.tenantId}</span></>
                      )}
                      <span className="ml-auto text-steel-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm text-steel-600">
                      effect: {entry.effect} | rule: {entry.matchedRuleId ?? "none"} | {entry.durationMs.toFixed(3)}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Condition errors + format */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="label-micro">Condition Errors ({state.conditionErrors.length})</div>
            <button onClick={clearConditionErrors} className="btn-outline text-sm py-1 px-2">Clear</button>
          </div>

          <div className="surface rounded p-4">
            <p className="font-mono text-sm text-steel-500 mb-3">
              Conditions that throw evaluate to <code className="text-accent-rose">false</code> (fail-closed).
            </p>
            {state.conditionErrors.length === 0 ? (
              <p className="font-mono text-sm text-steel-600 text-center py-4">
                No errors. Add a rule with throwingCondition to test.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {state.conditionErrors.map((err, i) => (
                  <div key={i} className="border border-accent-amber/30 bg-accent-amber/5 rounded p-2.5 font-mono text-sm">
                    <div className="text-accent-amber font-semibold">rule: {err.ruleId}</div>
                    <div className="text-steel-500 text-sm">
                      cond#{err.conditionIndex}: {err.error instanceof Error ? err.error.message : String(err.error)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface rounded p-4">
            <div className="label-micro mb-2">AuditEntry Schema</div>
            <pre className="font-mono text-sm text-ink-secondary bg-bg-alt rounded p-3 overflow-x-auto leading-relaxed border border-divider">
{JSON.stringify(
  state.auditLog[0] ?? {
    allowed: true, effect: "allow", matchedRuleId: "rule-id",
    matchedRuleDescription: "...", subjectId: "user-1",
    action: "invoice:read", resource: "invoice",
    tenantId: "tenant-a", timestamp: Date.now(), durationMs: 0.042,
    reason: "Matched rule ...",
  }, null, 2
)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
