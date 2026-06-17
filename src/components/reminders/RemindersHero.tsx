interface RemindersHeroProps {
  totalReminders: number;
  urgentCount: number;
}

export function RemindersHero({
  totalReminders,
  urgentCount,
}: RemindersHeroProps) {
  return (
    <section className="space-y-2">
      <span className="font-[family-name:var(--font-body)] text-secondary uppercase tracking-[0.2em] text-[0.6875rem] font-semibold">
        Resumen de pagos
      </span>
      <h1 className="font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-base-content">
        Recordatorios
      </h1>
      <p className="font-[family-name:var(--font-body)] text-base-content/60 mt-2 max-w-[80%]">
        Gestiona tus obligaciones financieras con precisión. {totalReminders}{" "}
        {totalReminders === 1 ? "recordatorio activo" : "recordatorios activos"}
        {urgentCount > 0 && (
          <>
            ,{" "}
            <span className="text-accent">
              {urgentCount} requieren atención
            </span>
          </>
        )}
        .
      </p>
    </section>
  );
}
