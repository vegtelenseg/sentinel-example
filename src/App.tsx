import { useState } from "react";
import { EngineProvider, useEngine } from "./context/EngineContext";
import RulesPanel from "./components/RulesPanel";
import SubjectsPanel from "./components/SubjectsPanel";
import EvaluatePanel from "./components/EvaluatePanel";
import HierarchyPanel from "./components/HierarchyPanel";
import AuditLogPanel from "./components/AuditLogPanel";
import SerializationPanel from "./components/SerializationPanel";
import SettingsPanel from "./components/SettingsPanel";

type Tab =
  | "rules"
  | "subjects"
  | "evaluate"
  | "hierarchy"
  | "audit"
  | "serialization"
  | "settings";

const NAV_ITEMS: { key: Tab; label: string; tag: string }[] = [
  { key: "rules", label: "Policy Rules", tag: "01" },
  { key: "subjects", label: "Subjects", tag: "02" },
  { key: "evaluate", label: "Evaluate", tag: "03" },
  { key: "hierarchy", label: "Hierarchy", tag: "04" },
  { key: "audit", label: "Audit Log", tag: "05" },
  { key: "serialization", label: "Serialization", tag: "06" },
  { key: "settings", label: "Settings", tag: "07" },
];

function StatusBar() {
  const { getRules, state, cacheStats } = useEngine();
  const rules = getRules();

  return (
    <div className="surface flex items-center divide-x divide-steel-700 font-mono text-xs rounded">
      <div className="flex items-center gap-2 px-5 py-3">
        <span className="text-accent-cyan font-bold text-base leading-none">
          {rules.length}
        </span>
        <span className="label-micro">Rules</span>
      </div>
      <div className="flex items-center gap-2 px-5 py-3">
        <span className="text-accent-amber font-bold text-base leading-none">
          {state.subjects.length}
        </span>
        <span className="label-micro">Subjects</span>
      </div>
      <div className="flex items-center gap-2 px-5 py-3">
        <span className="text-steel-300 font-bold text-base leading-none">
          {state.auditLog.length}
        </span>
        <span className="label-micro">Audit</span>
      </div>
      <div className="flex items-center gap-2 px-5 py-3">
        <span className="text-steel-300 font-bold text-base leading-none">
          {cacheStats?.size ?? "\u2014"}
        </span>
        <span className="label-micro">Cache</span>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("rules");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-navy-800 border-r border-steel-700 flex flex-col shrink-0">
        <div className="px-5 pt-6 pb-4">
          <div className="font-mono text-sm font-bold tracking-tight">
            <span className="text-accent-cyan">sentinel</span>
          </div>
          <div className="font-mono text-[10px] text-steel-500 mt-0.5 tracking-wider uppercase">
            @siremzam / v0.3.0
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors relative ${
                  active
                    ? "text-accent-cyan-bright"
                    : "text-steel-400 hover:text-steel-200"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-cyan rounded-r" />
                )}
                <span className="font-mono text-[10px] text-steel-600 w-4">
                  {item.tag}
                </span>
                <span className="font-mono text-xs font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-steel-700">
          <a
            href="https://github.com/siremzam/sentinel"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-steel-600 hover:text-accent-cyan transition-colors tracking-wide"
          >
            github/siremzam/sentinel
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
          <StatusBar />
          {activeTab === "rules" && <RulesPanel />}
          {activeTab === "subjects" && <SubjectsPanel />}
          {activeTab === "evaluate" && <EvaluatePanel />}
          {activeTab === "hierarchy" && <HierarchyPanel />}
          {activeTab === "audit" && <AuditLogPanel />}
          {activeTab === "serialization" && <SerializationPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <EngineProvider>
      <AppContent />
    </EngineProvider>
  );
}
