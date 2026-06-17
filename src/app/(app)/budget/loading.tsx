export default function BudgetLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Hero: Asymmetric Wealth Summary */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        {/* Left: Main Balance */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-3 w-32 bg-base-200 rounded" />
            <div className="w-5 h-5 rounded-full bg-base-200" />
          </div>
          <div className="h-16 md:h-20 w-56 bg-base-200 rounded" />
          <div className="flex gap-4 items-center">
            <div className="h-6 w-28 bg-base-200 rounded-full" />
            <div className="h-3 w-24 bg-base-200 rounded" />
          </div>
        </div>

        {/* Right: Income & Spent Cards */}
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-base-300 rounded" />
              <div className="h-2 w-10 bg-base-300 rounded" />
            </div>
            <div className="h-8 w-24 bg-base-300 rounded" />
          </div>
          <div className="bg-base-200 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-base-300 rounded" />
              <div className="h-2 w-10 bg-base-300 rounded" />
            </div>
            <div className="h-8 w-24 bg-base-300 rounded" />
          </div>
        </div>
      </section>

      {/* Bento Grid: Categories & Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Log Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="h-7 w-40 bg-base-200 rounded px-2" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base-200 p-6 rounded-xl space-y-4 min-h-35 flex flex-col">
              <div className="space-y-2">
                <div className="h-5 w-36 bg-base-300 rounded" />
                <div className="h-3 w-36 bg-base-300 rounded" />
              </div>
              <div className="mt-auto h-4 w-20 bg-base-300 rounded" />
            </div>
            <div className="bg-base-200 p-6 rounded-xl space-y-4 min-h-35 flex flex-col">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-base-300 rounded" />
                <div className="h-3 w-32 bg-base-300 rounded" />
              </div>
              <div className="mt-auto h-4 w-20 bg-base-300 rounded" />
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="md:col-span-2 space-y-6">
          <div className="h-7 w-48 bg-base-200 rounded px-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-base-200 p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-start">
                  <div className="h-3 w-24 bg-base-300 rounded" />
                  <div className="h-3 w-20 bg-base-300 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-base-300 rounded" />
                    <div className="h-4 w-16 bg-base-300 rounded" />
                  </div>
                  <div className="h-1.5 w-full bg-base-300 rounded-full" />
                  <div className="flex justify-between">
                    <div className="h-2 w-6 bg-base-300 rounded" />
                    <div className="h-2 w-8 bg-base-300 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
