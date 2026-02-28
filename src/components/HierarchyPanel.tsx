import { useState } from "react";
import { useEngine, type HierarchyEntry } from "../context/EngineContext";
import { ALL_ROLES } from "../lib/schema";
import type { AppSchema } from "../lib/schema";

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

  const removeEntry = (idx: number) => { setEditEntries(editEntries.filter((_, i) => i !== idx)); setHasChanges(true); };
  const updateRole = (idx: number, role: AppSchema["roles"]) => {
    const u = [...editEntries]; u[idx] = [role, u[idx][1]]; setEditEntries(u); setHasChanges(true);
  };
  const toggleInherits = (idx: number, role: AppSchema["roles"]) => {
    const u = [...editEntries]; const c = u[idx][1];
    u[idx] = [u[idx][0], c.includes(role) ? c.filter((r) => r !== role) : [...c, role]];
    setEditEntries(u); setHasChanges(true);
  };

  const handleApply = () => { try { updateHierarchy(editEntries); setHasChanges(false); setError(""); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } };
  const handleReset = () => { setEditEntries(state.hierarchy); setHasChanges(false); setError(""); };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-mono text-lg font-bold text-steel-200 tracking-tight">Role Hierarchy</h2>
          <p className="font-mono text-[11px] text-steel-500 mt-0.5">
            Inheritance rules &middot; cycle detection &middot; RoleHierarchy.define()
          </p>
        </div>
        <button onClick={addEntry} className="btn-primary">+ Entry</button>
      </div>

      {error && (
        <div className="font-mono text-xs text-accent-rose border border-accent-rose/30 bg-accent-rose/5 px-3 py-2 rounded">{error}</div>
      )}

      {/* Table */}
      <div className="surface rounded overflow-hidden">
        <div className="border-b border-steel-700 px-5 py-2.5 grid grid-cols-12 label-micro">
          <div className="col-span-3">Role</div>
          <div className="col-span-8">Inherits From</div>
          <div className="col-span-1" />
        </div>
        {editEntries.length === 0 ? (
          <div className="px-5 py-8 text-center font-mono text-sm text-steel-600">No hierarchy. All roles independent.</div>
        ) : (
          editEntries.map((entry, idx) => (
            <div key={idx} className="px-5 py-3 grid grid-cols-12 items-center border-b border-steel-700/50 last:border-0">
              <div className="col-span-3">
                <select value={entry[0]} onChange={(e) => updateRole(idx, e.target.value as AppSchema["roles"])} className="input-dark">
                  {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-8 flex flex-wrap gap-1.5">
                {ALL_ROLES.filter((r) => r !== entry[0]).map((r) => (
                  <button key={r} onClick={() => toggleInherits(idx, r)}
                    className={`chip transition-colors ${
                      entry[1].includes(r) ? "border-accent-cyan text-accent-cyan" : "border-steel-700 text-steel-600 hover:border-steel-500"
                    }`}>{r}</button>
                ))}
              </div>
              <div className="col-span-1 text-right">
                <button onClick={() => removeEntry(idx)} className="text-steel-700 hover:text-accent-rose transition-colors p-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {hasChanges && (
        <div className="flex gap-2 justify-end">
          <button onClick={handleReset} className="btn-outline">Reset</button>
          <button onClick={handleApply} className="btn-primary">Apply</button>
        </div>
      )}

      {/* Schematic visualization */}
      <div className="surface rounded p-5">
        <div className="label-micro mb-4">Inheritance Chain</div>
        <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs">
          {state.hierarchy.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="px-3 py-1.5 border border-accent-cyan/40 text-accent-cyan rounded">
                {entry[0]}
              </div>
              <span className="text-steel-600">&rarr;</span>
              {entry[1].map((r) => (
                <div key={r} className="px-3 py-1.5 border border-steel-700 text-steel-400 rounded">
                  {r}
                </div>
              ))}
              {idx < state.hierarchy.length - 1 && <span className="text-steel-700 mx-1">|</span>}
            </div>
          ))}
        </div>
        <p className="font-mono text-[10px] text-steel-600 text-center mt-3">
          owner &rarr; admin &rarr; manager &rarr; member &rarr; viewer
        </p>
      </div>
    </div>
  );
}
