import { Lock } from 'lucide-react';

export default function PasswordChangeLoading() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <header className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-base-200">
          <Lock className="w-6 h-6 text-base-content/20" />
        </div>
        <div className="h-6 w-48 bg-base-200 rounded" />
      </header>

      {/* Form Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        {/* Form Fields Skeleton */}
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-base-200 rounded" />
                <div className="h-4 w-32 bg-base-200 rounded" />
              </div>
              <div className="h-10 w-full bg-base-200 rounded" />
            </div>
          ))}
        </div>

        {/* Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-base-200 mt-6">
          <div className="h-10 w-full sm:w-24 bg-base-200 rounded" />
          <div className="h-10 w-full sm:w-40 bg-base-200 rounded" />
        </div>
      </section>
    </div>
  );
}
