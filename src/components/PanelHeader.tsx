import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  docHref: string;
  docLabel?: string;
  actions?: ReactNode;
};

export default function PanelHeader({
  title,
  description,
  docHref,
  docLabel = "Learn more in the docs",
  actions,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="panel-title">{title}</h2>
        <p className="panel-desc">{description}</p>
        <a href={docHref} className="panel-doc-link">
          {docLabel} &rarr;
        </a>
      </div>
      {actions ? <div className="flex gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
