import { ReactNode } from 'react';

interface RemindersSectionProps {
  title: string;
  count: number;
  children: ReactNode;
}

export function RemindersSection({ title, count, children }: RemindersSectionProps) {
  return (
    <section>
      <h3 className="font-[family-name:var(--font-headline)] text-sm font-bold uppercase tracking-widest text-base-content/60 px-1 mb-4">
        {title} <span className="text-base-content/40">· {count}</span>
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
