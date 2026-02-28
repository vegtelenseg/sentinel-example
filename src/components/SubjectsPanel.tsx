import { useState } from "react";
import { useEngine } from "../context/EngineContext";
import { ALL_ROLES, TENANTS } from "../lib/schema";
import type { AppSchema } from "../lib/schema";
import type { RoleAssignment } from "@siremzam/sentinel";

export default function SubjectsPanel() {
  const { state, addSubject, removeSubject } = useEngine();
  const [showForm, setShowForm] = useState(false);
  const [formId, setFormId] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formRoles, setFormRoles] = useState<RoleAssignment<AppSchema>[]>([]);
  const [tempRole, setTempRole] = useState<AppSchema["roles"]>("viewer");
  const [tempTenant, setTempTenant] = useState<string>("");
  const [formError, setFormError] = useState("");

  const handleAddRole = () => {
    setFormRoles([...formRoles, { role: tempRole, ...(tempTenant ? { tenantId: tempTenant } : {}) }]);
    setTempRole("viewer");
    setTempTenant("");
  };

  const handleSubmit = () => {
    if (!formId.trim()) { setFormError("Subject ID is required"); return; }
    if (state.subjects.some((s) => s.id === formId.trim())) { setFormError("Subject ID already exists"); return; }
    if (formRoles.length === 0) { setFormError("At least one role is required"); return; }
    addSubject({
      id: formId.trim(),
      roles: formRoles,
      attributes: formDepartment ? { department: formDepartment } : {},
    });
    setFormId(""); setFormDepartment(""); setFormRoles([]); setFormError(""); setShowForm(false);
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "owner": return "border-accent-amber/50 text-accent-amber";
      case "admin": return "border-accent-rose/50 text-accent-rose";
      case "manager": return "border-accent-cyan/50 text-accent-cyan";
      case "member": return "border-steel-400/50 text-steel-300";
      default: return "border-steel-600 text-steel-500";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-mono text-lg font-bold text-steel-200 tracking-tight">Subjects</h2>
          <p className="font-mono text-[11px] text-steel-500 mt-0.5">
            Tenant-scoped role assignments &middot; multi-tenancy model
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormError(""); }} className="btn-primary">
          {showForm ? "Cancel" : "+ Subject"}
        </button>
      </div>

      {showForm && (
        <div className="surface-inset rounded p-5 space-y-4">
          <div className="label-micro mb-3">New Subject</div>
          {formError && (
            <div className="font-mono text-xs text-accent-rose border border-accent-rose/30 bg-accent-rose/5 px-3 py-2 rounded">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label-micro mb-1.5">Subject ID</div>
              <input type="text" value={formId} onChange={(e) => setFormId(e.target.value)} placeholder="e.g. frank" className="input-dark" />
            </div>
            <div>
              <div className="label-micro mb-1.5">Department</div>
              <input type="text" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} placeholder="e.g. engineering" className="input-dark" />
            </div>
          </div>
          <div>
            <div className="label-micro mb-2">Role Assignments</div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <div className="text-[10px] text-steel-600 font-mono mb-1">Role</div>
                <select value={tempRole} onChange={(e) => setTempRole(e.target.value as AppSchema["roles"])} className="input-dark">
                  {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-steel-600 font-mono mb-1">Tenant</div>
                <select value={tempTenant} onChange={(e) => setTempTenant(e.target.value)} className="input-dark">
                  <option value="">Global</option>
                  {TENANTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={handleAddRole} className="btn-outline">Add</button>
            </div>
            {formRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {formRoles.map((r, i) => (
                  <span key={i} className="chip border-accent-cyan/40 text-accent-cyan inline-flex items-center gap-1">
                    {r.role}{r.tenantId && <span className="text-steel-500">@{r.tenantId}</span>}
                    <button onClick={() => setFormRoles(formRoles.filter((_, j) => j !== i))} className="hover:text-accent-rose ml-0.5">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSubmit} className="btn-primary w-full">Add Subject</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {state.subjects.map((subject) => (
          <div key={subject.id} className="surface rounded p-4 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-accent-cyan/30 flex items-center justify-center font-mono text-sm font-bold text-accent-cyan">
                  {subject.id[0]?.toUpperCase()}
                </div>
                <div>
                  <code className="font-mono text-sm font-semibold text-steel-200">{subject.id}</code>
                  {subject.attributes?.department ? (
                    <p className="font-mono text-[10px] text-steel-600">{subject.attributes.department as string}</p>
                  ) : null}
                </div>
              </div>
              <button onClick={() => removeSubject(subject.id)}
                className="p-1 text-steel-700 hover:text-accent-rose transition-colors opacity-0 group-hover:opacity-100">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {subject.roles.map((r, i) => (
                <div key={i} className="flex items-center gap-2 font-mono text-xs">
                  <span className={`chip ${roleColor(r.role)}`}>{r.role}</span>
                  {r.tenantId ? (
                    <span className="text-steel-500">in <span className="text-steel-300">{r.tenantId}</span></span>
                  ) : (
                    <span className="text-steel-600 italic">global</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
