import { useState } from "react";
import { useEngine } from "../context/EngineContext";
import { ALL_ROLES, ALL_ACTIONS, ALL_RESOURCES } from "../lib/schema";
import type { AppSchema } from "../lib/schema";
import type { PolicyEffect } from "@siremzam/sentinel";

export default function RulesPanel() {
  const { getRules, addRule, removeRule, clearRules, loadDefaultRules, buildAllow, buildDeny } =
    useEngine();
  const rules = getRules();

  const [showForm, setShowForm] = useState(false);
  const [formId, setFormId] = useState("");
  const [formEffect, setFormEffect] = useState<PolicyEffect>("allow");
  const [formRoles, setFormRoles] = useState<AppSchema["roles"][]>([]);
  const [formAnyRole, setFormAnyRole] = useState(false);
  const [formActions, setFormActions] = useState<AppSchema["actions"][]>([]);
  const [formAnyAction, setFormAnyAction] = useState(false);
  const [formResources, setFormResources] = useState<AppSchema["resources"][]>([]);
  const [formAnyResource, setFormAnyResource] = useState(false);
  const [formPriority, setFormPriority] = useState(0);
  const [formDescription, setFormDescription] = useState("");
  const [formCondition, setFormCondition] = useState<string>("none");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setFormId("");
    setFormEffect("allow");
    setFormRoles([]);
    setFormAnyRole(false);
    setFormActions([]);
    setFormAnyAction(false);
    setFormResources([]);
    setFormAnyResource(false);
    setFormPriority(0);
    setFormDescription("");
    setFormCondition("none");
    setFormError("");
  };

  const handleAdd = () => {
    if (!formId.trim()) { setFormError("Rule ID is required"); return; }
    if (rules.some((r) => r.id === formId.trim())) { setFormError("Rule ID already exists"); return; }
    if (!formAnyRole && formRoles.length === 0) { setFormError("Select at least one role or 'Any Role'"); return; }
    if (!formAnyAction && formActions.length === 0) { setFormError("Select at least one action or 'Any Action'"); return; }
    if (!formAnyResource && formResources.length === 0) { setFormError("Select at least one resource or 'Any Resource'"); return; }

    try {
      const builder = formEffect === "allow" ? buildAllow() : buildDeny();
      let b = builder.id(formId.trim());
      if (formAnyRole) b = b.anyRole(); else b = b.roles(...formRoles);
      if (formAnyAction) b = b.anyAction(); else b = b.actions(...formActions);
      if (formAnyResource) b = b.anyResource(); else b = b.on(...formResources);
      if (formPriority !== 0) b = b.priority(formPriority);
      if (formDescription) b = b.describe(formDescription);
      if (formCondition === "isOwner") b = b.when((ctx) => ctx.subject.id === ctx.resourceContext.ownerId);
      else if (formCondition === "isActive") b = b.when((ctx) => ctx.resourceContext.status === "active");
      else if (formCondition === "throwingCondition") b = b.when(() => { throw new Error("Simulated condition failure"); });
      addRule(b.build());
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-mono text-lg font-bold text-steel-200 tracking-tight">
            Policy Rules
          </h2>
          <p className="font-mono text-[11px] text-steel-500 mt-0.5">
            Fluent builder API &middot; allow() / deny() &middot; conditions &middot; priority
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadDefaultRules} className="btn-outline">Reset</button>
          <button onClick={clearRules} className="btn-danger">Clear</button>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
            {showForm ? "Cancel" : "+ Rule"}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="surface-inset rounded p-5 space-y-4">
          <div className="label-micro mb-3">New Rule</div>

          {formError && (
            <div className="font-mono text-xs text-accent-rose border border-accent-rose/30 bg-accent-rose/5 px-3 py-2 rounded">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label-micro mb-1.5">Rule ID</div>
              <input type="text" value={formId} onChange={(e) => setFormId(e.target.value)}
                placeholder="e.g. custom-rule-1" className="input-dark" />
            </div>
            <div>
              <div className="label-micro mb-1.5">Effect</div>
              <div className="flex gap-2">
                <button onClick={() => setFormEffect("allow")}
                  className={`flex-1 py-2 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                    formEffect === "allow"
                      ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/40"
                      : "border border-steel-700 text-steel-400"
                  }`}>Allow</button>
                <button onClick={() => setFormEffect("deny")}
                  className={`flex-1 py-2 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                    formEffect === "deny"
                      ? "bg-accent-rose/15 text-accent-rose border border-accent-rose/40"
                      : "border border-steel-700 text-steel-400"
                  }`}>Deny</button>
              </div>
            </div>
          </div>

          {/* Roles */}
          <div>
            <div className="label-micro mb-1.5">
              Roles
              <label className="ml-3 inline-flex items-center gap-1 normal-case text-steel-500 tracking-normal font-normal text-[11px]">
                <input type="checkbox" checked={formAnyRole} onChange={() => setFormAnyRole(!formAnyRole)} className="rounded border-steel-700" /> Any
              </label>
            </div>
            {!formAnyRole && (
              <div className="flex flex-wrap gap-1.5">
                {ALL_ROLES.map((r) => (
                  <button key={r} onClick={() => setFormRoles(toggle(formRoles, r))}
                    className={`chip transition-colors ${
                      formRoles.includes(r)
                        ? "border-accent-cyan text-accent-cyan"
                        : "border-steel-700 text-steel-500 hover:border-steel-500"
                    }`}>{r}</button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <div className="label-micro mb-1.5">
              Actions
              <label className="ml-3 inline-flex items-center gap-1 normal-case text-steel-500 tracking-normal font-normal text-[11px]">
                <input type="checkbox" checked={formAnyAction} onChange={() => setFormAnyAction(!formAnyAction)} className="rounded border-steel-700" /> Any
              </label>
            </div>
            {!formAnyAction && (
              <div className="flex flex-wrap gap-1.5">
                {ALL_ACTIONS.map((a) => (
                  <button key={a} onClick={() => setFormActions(toggle(formActions, a))}
                    className={`chip transition-colors ${
                      formActions.includes(a)
                        ? "border-accent-amber text-accent-amber"
                        : "border-steel-700 text-steel-500 hover:border-steel-500"
                    }`}>{a}</button>
                ))}
              </div>
            )}
          </div>

          {/* Resources */}
          <div>
            <div className="label-micro mb-1.5">
              Resources
              <label className="ml-3 inline-flex items-center gap-1 normal-case text-steel-500 tracking-normal font-normal text-[11px]">
                <input type="checkbox" checked={formAnyResource} onChange={() => setFormAnyResource(!formAnyResource)} className="rounded border-steel-700" /> Any
              </label>
            </div>
            {!formAnyResource && (
              <div className="flex flex-wrap gap-1.5">
                {ALL_RESOURCES.map((r) => (
                  <button key={r} onClick={() => setFormResources(toggle(formResources, r))}
                    className={`chip transition-colors ${
                      formResources.includes(r)
                        ? "border-steel-300 text-steel-200"
                        : "border-steel-700 text-steel-500 hover:border-steel-500"
                    }`}>{r}</button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label-micro mb-1.5">Priority</div>
              <input type="number" value={formPriority} onChange={(e) => setFormPriority(Number(e.target.value))} className="input-dark" />
            </div>
            <div>
              <div className="label-micro mb-1.5">Condition (ABAC)</div>
              <select value={formCondition} onChange={(e) => setFormCondition(e.target.value)} className="input-dark">
                <option value="none">None</option>
                <option value="isOwner">isOwner</option>
                <option value="isActive">isActive</option>
                <option value="throwingCondition">throwingCondition (throws)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="label-micro mb-1.5">Description</div>
            <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Human-readable description" className="input-dark" />
          </div>

          <button onClick={handleAdd} className="btn-primary w-full">Add Rule</button>
        </div>
      )}

      {/* Rule list */}
      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="text-center py-12 font-mono text-sm text-steel-600">
            No rules defined.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="surface rounded p-4 group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`chip ${
                      rule.effect === "allow"
                        ? "border-accent-emerald/50 text-accent-emerald"
                        : "border-accent-rose/50 text-accent-rose"
                    }`}>
                      {rule.effect}
                    </span>
                    <code className="font-mono text-sm font-semibold text-steel-200">
                      {rule.id}
                    </code>
                    {(rule.priority ?? 0) !== 0 && (
                      <span className="chip border-accent-amber/50 text-accent-amber">
                        p:{rule.priority}
                      </span>
                    )}
                    {rule.conditions && rule.conditions.length > 0 && (
                      <span className="chip border-steel-600 text-steel-400">
                        {rule.conditions.length} cond
                      </span>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-xs text-steel-500 mb-2 font-sans">{rule.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 text-[11px] font-mono">
                    <span className="text-steel-600 mr-1">roles:</span>
                    {rule.roles === "*" ? (
                      <span className="text-accent-cyan">*</span>
                    ) : (rule.roles as string[]).map((r) => (
                      <span key={r} className="text-accent-cyan">{r}</span>
                    ))}
                    <span className="text-steel-700 mx-1">|</span>
                    <span className="text-steel-600 mr-1">actions:</span>
                    {rule.actions === "*" ? (
                      <span className="text-accent-amber">*</span>
                    ) : (rule.actions as string[]).map((a) => (
                      <span key={a} className="text-accent-amber">{a}</span>
                    ))}
                    <span className="text-steel-700 mx-1">|</span>
                    <span className="text-steel-600 mr-1">on:</span>
                    {rule.resources === "*" ? (
                      <span className="text-steel-300">*</span>
                    ) : (rule.resources as string[]).map((r) => (
                      <span key={r} className="text-steel-300">{r}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="ml-3 p-1.5 text-steel-700 hover:text-accent-rose transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove rule"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
