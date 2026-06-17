export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Hero: Total Balance */}
      <section className="space-y-2">
        <div className="flex items-center gap-3 ml-1">
          <div className="h-3 w-24 bg-base-200 rounded" />
          <div className="w-5 h-5 rounded-full bg-base-200" />
        </div>
        <div className="h-14 w-56 bg-base-200 rounded" />
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Budget Overview Card Skeleton */}
        <div className="md:col-span-7 bg-base-200 rounded-xl p-8 flex flex-col justify-between min-h-80 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-base-300 rounded" />
              <div className="h-3 w-32 bg-base-300 rounded" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-6 w-12 bg-base-300 rounded ml-auto" />
              <div className="h-2 w-16 bg-base-300 rounded ml-auto" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-6 bg-base-300 rounded-xl" />
            <div className="flex justify-between">
              <div className="h-2 w-6 bg-base-300 rounded" />
              <div className="h-2 w-6 bg-base-300 rounded" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-base-content/10">
            <div className="space-y-2">
              <div className="h-2 w-16 bg-base-300 rounded" />
              <div className="h-5 w-24 bg-base-300 rounded" />
            </div>
            <div className="h-4 w-24 bg-base-300 rounded" />
          </div>
        </div>

        {/* Reminders Card Skeleton */}
        <div className="md:col-span-5 bg-base-200 rounded-xl p-6 flex flex-col min-h-80">
          <div className="flex items-center justify-between mb-8">
            <div className="h-5 w-32 bg-base-300 rounded" />
            <div className="w-5 h-5 bg-base-300 rounded" />
          </div>

          <div className="space-y-6 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-base-300 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-base-300 rounded" />
                  <div className="h-2 w-20 bg-base-300 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <div className="h-12 bg-base-300 rounded-lg" />
          </div>
        </div>

        {/* Quick Actions Banner Skeleton */}
        <div className="md:col-span-12 bg-base-200 rounded-xl p-10 flex flex-col md:flex-row items-center justify-between min-h-[180px] gap-8">
          <div className="max-w-md text-center md:text-left space-y-2 mb-0">
            <div className="h-6 w-40 bg-base-300 rounded" />
            <div className="h-3 w-64 bg-base-300 rounded" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-12 w-40 bg-base-300 rounded-full" />
            <div className="h-12 w-40 bg-base-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Wealth Stream Skeleton */}
      <section className="mt-16 pb-12 space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-base-200 rounded" />
            <div className="h-3 w-32 bg-base-200 rounded" />
          </div>
          <div className="h-3 w-24 bg-base-200 rounded" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-base-200 rounded-xl p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="h-3 w-12 bg-base-300 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-base-300 rounded" />
                  <div className="h-2 w-20 bg-base-300 rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-20 bg-base-300 rounded ml-auto" />
                <div className="h-2 w-16 bg-base-300 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
