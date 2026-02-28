import { useState } from "react";
import { useEngine } from "../context/EngineContext";

export default function SerializationPanel() {
  const { exportRules, importRules, getRules } = useEngine();
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleExport = () => {
    try {
      setJsonText(exportRules());
      setMessage({ type: "ok", text: `Exported ${getRules().length} rules` });
    } catch (err) { setMessage({ type: "err", text: err instanceof Error ? err.message : String(err) }); }
  };

  const handleImport = () => {
    if (!jsonText.trim()) { setMessage({ type: "err", text: "Paste JSON first" }); return; }
    try {
      importRules(jsonText);
      setMessage({ type: "ok", text: "Rules imported" });
    } catch (err) { setMessage({ type: "err", text: err instanceof Error ? err.message : String(err) }); }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(jsonText); setMessage({ type: "ok", text: "Copied" }); }
    catch { setMessage({ type: "err", text: "Copy failed" }); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-mono text-lg font-bold text-steel-200 tracking-tight">Serialization</h2>
        <p className="font-mono text-[11px] text-steel-500 mt-0.5">
          exportRulesToJson() &middot; importRulesFromJson() &middot; ConditionRegistry
        </p>
      </div>

      {message && (
        <div className={`font-mono text-xs px-3 py-2 rounded border ${
          message.type === "ok"
            ? "border-accent-emerald/30 text-accent-emerald bg-accent-emerald/5"
            : "border-accent-rose/30 text-accent-rose bg-accent-rose/5"
        }`}>{message.text}</div>
      )}

      <div className="flex gap-2">
        <button onClick={handleExport} className="btn-primary">Export</button>
        <button onClick={handleImport} className="btn-outline">Import</button>
        {jsonText && <button onClick={handleCopy} className="btn-outline">Copy</button>}
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="Click Export to serialize current rules, or paste JSON and click Import"
        rows={18}
        spellCheck={false}
        className="input-dark w-full resize-y text-[11px] leading-relaxed"
      />

      <div className="surface rounded p-5 space-y-3">
        <div className="label-micro">Condition Registry</div>
        <p className="font-mono text-[11px] text-steel-500">
          Functions can&apos;t be serialized. Conditions are stored by name and resolved at import via a registry.
        </p>
        <div className="space-y-1.5">
          {[
            { name: "isOwner", desc: "ctx.subject.id === ctx.resourceContext.ownerId" },
            { name: "isActive", desc: "ctx.resourceContext.status === \"active\"" },
            { name: "throwingCondition", desc: "Always throws (fail-closed demo)" },
          ].map((c) => (
            <div key={c.name} className="flex items-baseline gap-3 font-mono text-xs">
              <code className="text-accent-cyan font-semibold">{c.name}</code>
              <span className="text-steel-600">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
