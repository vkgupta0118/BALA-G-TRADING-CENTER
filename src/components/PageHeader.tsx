import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-header on-dark">
      <div className="container">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
