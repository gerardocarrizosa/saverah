export default function RemindersLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header: Title + Add Button */}
      <div className="flex items-start justify-between gap-4">
        <section className="space-y-2">
          <div className="h-3 w-36 bg-base-200 rounded" />
          <div className="h-10 w-48 bg-base-200 rounded" />
          <div className="h-4 w-80 bg-base-200 rounded mt-2" />
        </section>
        <div className="shrink-0 w-10 h-10 rounded-full bg-base-200" />
      </div>

      {/* Critical Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-300 rounded-xl p-4 space-y-6 min-h-[140px] flex flex-col">
          <div className="h-3 w-28 bg-base-200 rounded" />
          <div className="h-7 w-16 bg-base-200 rounded" />
          <div className="mt-auto h-3 w-48 bg-base-200 rounded" />
        </div>
        <div className="bg-base-200 rounded-xl p-4 space-y-6 min-h-[140px] flex flex-col">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-base-300" />
            <div className="h-5 w-20 bg-base-300 rounded-full" />
          </div>
          <div className="h-6 w-40 bg-base-200 rounded" />
          <div className="mt-auto h-2 w-24 bg-base-200 rounded" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-12 bg-base-200 rounded-xl" />
        <div className="w-12 h-12 rounded-xl bg-base-200" />
      </div>

      {/* Reminder Sections */}
      <div className="space-y-8">
        {[1, 2].map((section) => (
          <section key={section}>
            <div className="h-4 w-32 bg-base-200 rounded px-1 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-base-200 rounded-xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-base-300 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-base-300 rounded" />
                      <div className="h-3 w-48 bg-base-300 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-20 bg-base-300 rounded shrink-0" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
