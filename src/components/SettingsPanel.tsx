import { useEngine } from "../context/EngineContext";

export default function SettingsPanel() {
  const { state, updateConfig, cacheStats, clearCache } = useEngine();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-mono text-lg font-bold text-steel-200 tracking-tight">Settings</h2>
        <p className="font-mono text-[11px] text-steel-500 mt-0.5">
          Engine configuration &middot; changes rebuild the engine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* General */}
        <div className="surface rounded p-5 space-y-5">
          <div className="label-micro">General</div>

          <div>
            <div className="label-micro mb-2">Default Effect</div>
            <div className="flex gap-2">
              <button onClick={() => updateConfig({ defaultEffect: "deny" })}
                className={`flex-1 py-2 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                  state.config.defaultEffect === "deny"
                    ? "border border-accent-rose/40 bg-accent-rose/10 text-accent-rose"
                    : "border border-steel-700 text-steel-500"
                }`}>Deny</button>
              <button onClick={() => updateConfig({ defaultEffect: "allow" })}
                className={`flex-1 py-2 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                  state.config.defaultEffect === "allow"
                    ? "border border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald"
                    : "border border-steel-700 text-steel-500"
                }`}>Allow</button>
            </div>
            <p className="font-mono text-[10px] text-steel-600 mt-1.5">
              When no rule matches. Deny-by-default recommended.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="label-micro">Strict Tenancy</div>
              <button onClick={() => updateConfig({ strictTenancy: !state.config.strictTenancy })}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  state.config.strictTenancy ? "bg-accent-cyan" : "bg-steel-700"
                }`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-navy-800 rounded-full transition-transform ${
                  state.config.strictTenancy ? "translate-x-5" : ""
                }`} />
              </button>
            </div>
            <p className="font-mono text-[10px] text-steel-600">
              Throws if tenantId omitted for subjects with tenant-scoped roles.
            </p>
          </div>
        </div>

        {/* Cache */}
        <div className="surface rounded p-5 space-y-5">
          <div className="label-micro">Evaluation Cache</div>
          <p className="font-mono text-[11px] text-steel-500">
            LRU cache for unconditional evaluations. Conditional results never cached.
          </p>

          <div>
            <div className="label-micro mb-2">Cache Size</div>
            <div className="flex gap-1.5">
              {[0, 50, 100, 500, 1000].map((size) => (
                <button key={size} onClick={() => updateConfig({ cacheSize: size })}
                  className={`chip transition-colors ${
                    state.config.cacheSize === size
                      ? "border-accent-cyan text-accent-cyan"
                      : "border-steel-700 text-steel-500 hover:border-steel-500"
                  }`}>{size === 0 ? "Off" : size}</button>
              ))}
            </div>
          </div>

          {cacheStats ? (
            <div className="surface-inset rounded p-4">
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <div className="label-micro mb-0.5">Current</div>
                  <span className="text-lg font-bold text-steel-200">{cacheStats.size}</span>
                </div>
                <div>
                  <div className="label-micro mb-0.5">Max</div>
                  <span className="text-lg font-bold text-steel-200">{cacheStats.maxSize}</span>
                </div>
              </div>
              <button onClick={clearCache} className="btn-outline w-full mt-3 text-[10px] py-1.5">Clear Cache</button>
            </div>
          ) : (
            <div className="surface-inset rounded p-4 text-center font-mono text-xs text-steel-600">
              Cache disabled.
            </div>
          )}
        </div>
      </div>

      {/* Security principles */}
      <div className="surface rounded p-5">
        <div className="label-micro mb-4">Security Principles</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "Deny by Default", desc: "If no rule matches, the answer is no.", on: state.config.defaultEffect === "deny" },
            { title: "Fail Closed", desc: "If a condition throws, it evaluates to false.", on: true },
            { title: "Frozen Rules", desc: "Rules are Object.freeze'd on add.", on: true },
            { title: "Cache Safety", desc: "Only unconditional evaluations cached.", on: state.config.cacheSize > 0 },
            { title: "Strict Tenancy", desc: "Throws if tenantId omitted for tenant-scoped subjects.", on: state.config.strictTenancy },
            { title: "Import Validation", desc: "importRulesFromJson() validates effect field.", on: true },
          ].map((p) => (
            <div key={p.title} className="surface-inset rounded p-3 flex gap-3">
              <div className={`w-0.5 shrink-0 rounded-full ${p.on ? "bg-accent-emerald" : "bg-steel-700"}`} />
              <div>
                <div className="font-mono text-xs font-semibold text-steel-200">{p.title}</div>
                <p className="font-mono text-[10px] text-steel-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
