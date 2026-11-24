import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  status?: 'loading' | 'ready';
  emptyText?: string;
  error?: string;
  children?: ReactNode;
};

export function CapabilityCard({ title, description, status = 'ready', emptyText, error, children }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {error && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
        {status === 'ready' && !error && emptyText && <p>{emptyText}</p>}
        {status === 'ready' && !error && !emptyText && children}
      </div>
    </section>
  );
}
