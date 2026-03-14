import { User, Settings2 } from 'lucide-react';

export default function ProfileLoading() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <header className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-base-200">
          <Settings2 className="w-6 h-6 text-base-content/20" />
        </div>
        <div className="h-6 w-32 bg-base-200 rounded" />
      </header>

      {/* User Summary Card Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-base-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 bg-base-200 rounded" />
            <div className="h-4 w-56 bg-base-200 rounded" />
            <div className="h-4 w-32 bg-base-200 rounded" />
          </div>
        </div>
      </section>

      {/* Account Information Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-base-200">
            <User className="w-4 h-4 text-base-content/20" />
          </div>
          <div className="h-4 w-48 bg-base-200 rounded" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 py-2">
              <div className="p-2 rounded-lg bg-base-200 shrink-0">
                <div className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-base-200 rounded" />
                <div className="h-4 w-48 bg-base-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preferences Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-base-200">
              <div className="w-4 h-4" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-base-200 rounded" />
              <div className="h-3 w-40 bg-base-200 rounded" />
            </div>
          </div>
          <div className="h-8 w-20 bg-base-200 rounded" />
        </div>
      </section>

      {/* Actions Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-base-200">
              <div className="w-4 h-4" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-base-200 rounded" />
              <div className="h-3 w-48 bg-base-200 rounded" />
            </div>
          </div>
          <div className="h-8 w-20 bg-base-200 rounded" />
        </div>
      </section>
    </div>
  );
}
