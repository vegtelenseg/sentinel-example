import { useState } from "react";

const STORAGE_KEY = "sentinel-playground-intro-dismissed";

type Props = {
  onGoToEvaluate: () => void;
};

function isDismissed() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export default function PlaygroundIntro({ onGoToEvaluate }: Props) {
  const [visible, setVisible] = useState(() => !isDismissed());

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <section className="playground-intro">
      <button
        type="button"
        className="playground-intro-dismiss"
        onClick={dismiss}
        aria-label="Dismiss introduction"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <p className="playground-intro-lead">
        Explore Sentinel in the browser — no install required. This playground models a
        multi-tenant SaaS app with sample users, policy rules, and a role hierarchy already
        loaded.
      </p>
      <p className="playground-intro-hint">
        <strong>New here?</strong> Head to{" "}
        <button type="button" onClick={onGoToEvaluate} className="playground-intro-link">
          Evaluate
        </button>{" "}
        and run a check as <code>alice</code> approving an invoice. Then try{" "}
        <code>explain()</code> to see which rules fired.
      </p>
    </section>
  );
}
