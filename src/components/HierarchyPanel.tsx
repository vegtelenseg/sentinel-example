import { useState } from "react";
import { useEngine, type HierarchyEntry } from "../context/EngineContext";
import { ALL_ROLES } from "../lib/schema";
import type { AppSchema } from "../lib/schema";
import PanelHeader from "./PanelHeader";
import { DOC_PATHS } from "../lib/docs";

export default function HierarchyPanel() {
  const { state, updateHierarchy } = useEngine();
  const [editEntries, setEditEntries] = useState<HierarchyEntry[]>(state.hierarchy);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState("");

  const addEntry = () => {
    const used = editEntries.map((e) => e[0]);
    const avail = ALL_ROLES.filter((r) => !used.includes(r));
    if (avail.length === 0) return;
    setEditEntries([...editEntries, [avail[0], []]]);
    setHasChanges(true);
  };

  const removeEntry = (idx: number) => {
    setEditEntries(editEntries.filter((_, i) => i !== idx));
    setHasChanges(true);
  };

  const updateRole = (idx: number, role: AppSchema["roles"]) => {
    const u = [...editEntries];
    u[idx] = [role, u[idx][1]];
    setEditEntries(u);
    setHasChanges(true);
  };

  const toggleInherits = (idx: number, role: AppSchema["roles"]) => {
    const u = [...editEntries];
    const c = u[idx][1];
    u[idx] = [u[idx][0], c.includes(role) ? c.filter((r) => r !== role) : [...c, role]];
    setEditEntries(u);
    setHasChanges(true);
  };

  const handleApply = () => {
    try {
      updateHierarchy(editEntries);
      setHasChanges(false);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleReset = () => {
    setEditEntries(state.hierarchy);
    setHasChanges(false);
    setError("");
  };

  return (
    <div className="space-y-8">
      <PanelHeader
        title="Role Hierarchy"
        description="Define which roles inherit permissions from others — owner inherits from admin, and so on. Changes apply when you click Apply changes."
        docHref={DOC_PATHS.hierarchy}
        actions={
          <button type="button" onClick={addEntry} className="btn-primary shrink-0">
            + Entry
          </button>
        }
      />

      {error && (
        <div className="font-mono text-sm text-accent-rose border border-accent-rose/30 bg-accent-rose/5 px-4 py-3 rounded-sentinel-sm">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <div className="label-micro">Hierarchy entries</div>
        <div className="surface">
          {editEntries.length === 0 ? (
            <div className="hierarchy-empty">No hierarchy defined. All roles are independent.</div>
          ) : (
            <div className="hierarchy-editor">
              {editEntries.map((entry, idx) => (
                <div key={idx} className="hierarchy-entry">
                  <div className="hierarchy-entry-role">
                    <div className="label-micro mb-2 sm:sr-only">Role</div>
                    <select
                      value={entry[0]}
                      onChange={(e) => updateRole(idx, e.target.value as AppSchema["roles"])}
                      className="input-dark hierarchy-role-select"
                      aria-label={`Role for entry ${idx + 1}`}
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hierarchy-entry-inherits">
                    <div className="label-micro hierarchy-entry-inherits-label">Inherits from</div>
                    {ALL_ROLES.filter((r) => r !== entry[0]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleInherits(idx, r)}
                        className={`chip transition-colors ${
                          entry[1].includes(r)
                            ? "border-accent-cyan text-accent-cyan bg-accent-soft"
                            : "border-divider text-ink-secondary hover:border-accent-light hover:text-accent-cyan"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="hierarchy-entry-actions">
                    <button
                      type="button"
                      onClick={() => removeEntry(idx)}
                      className="p-2 rounded-sentinel-sm text-ink-muted hover:text-accent-rose hover:bg-accent-rose/5 transition-colors"
                      aria-label={`Remove ${entry[0]} entry`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasChanges && (
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={handleReset} className="btn-outline">
              Reset
            </button>
            <button type="button" onClick={handleApply} className="btn-primary">
              Apply changes
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="label-micro">Inheritance chain</div>
        <div className="surface p-5">
          {state.hierarchy.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">
              Apply hierarchy entries above to see the chain.
            </p>
          ) : (
            <div className="hierarchy-chain">
              {state.hierarchy.map((entry, idx) => (
                <div key={idx} className="hierarchy-chain-row">
                  <span className="hierarchy-chain-role">{entry[0]}</span>
                  <span className="hierarchy-chain-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                  {entry[1].length > 0 ? (
                    entry[1].map((r) => (
                      <span key={r} className="hierarchy-chain-parent">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="hierarchy-chain-none">no parents</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="hierarchy-chain-hint">
            owner &rarr; admin &rarr; manager &rarr; member &rarr; viewer
          </p>
        </div>
      </section>
    </div>
  );
}
