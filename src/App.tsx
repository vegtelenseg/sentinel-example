import { useState } from "react";
import { EngineProvider, useEngine } from "./context/EngineContext";
import RulesPanel from "./components/RulesPanel";
import SubjectsPanel from "./components/SubjectsPanel";
import EvaluatePanel from "./components/EvaluatePanel";
import HierarchyPanel from "./components/HierarchyPanel";
import AuditLogPanel from "./components/AuditLogPanel";
import SerializationPanel from "./components/SerializationPanel";
import SettingsPanel from "./components/SettingsPanel";
import SentinelLogo from "./components/SentinelLogo";
import { toggleTheme, isDarkMode } from "./lib/theme";

const DOCS_BASE =
  import.meta.env.VITE_DOCS_URL ?? "https://vegtelenseg.github.io/sentinel";

type Tab =
  | "rules"
  | "subjects"
  | "evaluate"
  | "hierarchy"
  | "audit"
  | "serialization"
  | "settings";

const NAV_ITEMS: { key: Tab; label: string }[] = [
  { key: "rules", label: "Policy Rules" },
  { key: "subjects", label: "Subjects" },
  { key: "evaluate", label: "Evaluate" },
  { key: "hierarchy", label: "Hierarchy" },
  { key: "audit", label: "Audit Log" },
  { key: "serialization", label: "Serialization" },
  { key: "settings", label: "Settings" },
];

const DOC_LINKS = [
  { label: "Docs", href: `${DOCS_BASE}/introduction/what-is-sentinel` },
  { label: "Guide", href: `${DOCS_BASE}/getting-started/quickstart` },
  { label: "Reference", href: `${DOCS_BASE}/reference/access-engine` },
  { label: "Playground", href: "#", active: true },
  { label: "npm", href: "https://www.npmjs.com/package/@siremzam/sentinel" },
];

function ThemeToggle() {
  const [dark, setDark] = useState(isDarkMode);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle color scheme"
      onClick={() => {
        toggleTheme();
        setDark(isDarkMode());
      }}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

function DocNav() {
  return (
    <header className="doc-nav">
      <a href={DOCS_BASE} className="doc-nav-brand">
        <SentinelLogo className="doc-nav-logo" />
        Sentinel
      </a>
      <div className="flex items-center gap-3">
        <nav className="doc-nav-links">
          {DOC_LINKS.map((link) =>
            link.active ? (
              <span key={link.label} className="doc-nav-link active">
                {link.label}
              </span>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="doc-nav-link"
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

function StatusBar() {
  const { getRules, state, cacheStats } = useEngine();
  const rules = getRules();

  return (
    <div className="status-bar">
      <div className="status-bar-item">
        <span className="text-accent-cyan font-semibold text-lg leading-none">{rules.length}</span>
        <span className="label-micro">Rules</span>
      </div>
      <div className="status-bar-item">
        <span className="text-accent-cyan font-semibold text-lg leading-none">{state.subjects.length}</span>
        <span className="label-micro">Subjects</span>
      </div>
      <div className="status-bar-item">
        <span className="text-ink font-semibold text-lg leading-none">{state.auditLog.length}</span>
        <span className="label-micro">Audit</span>
      </div>
      <div className="status-bar-item">
        <span className="text-ink font-semibold text-lg leading-none">{cacheStats?.size ?? "\u2014"}</span>
        <span className="label-micro">Cache</span>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("rules");

  return (
    <div className="flex flex-col min-h-screen">
      <DocNav />

      <div className="flex flex-1 min-h-0">
        <aside className="playground-sidebar hidden md:flex">
          <div className="playground-sidebar-heading">Playground</div>
          <nav className="flex-1 py-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`playground-nav-link ${activeTab === item.key ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-divider">
            <a
              href="https://github.com/vegtelenseg/sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-muted hover:text-accent-cyan transition-colors"
            >
              GitHub
            </a>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <div className="md:hidden flex gap-1 flex-wrap pb-2 border-b border-divider">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`text-sm px-3 py-1.5 rounded-sentinel-sm transition-colors ${
                    activeTab === item.key
                      ? "bg-accent-soft text-accent font-medium"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

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
