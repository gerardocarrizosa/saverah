import { User } from 'lucide-react';

export default function ProfileEditLoading() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <header className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-base-200">
          <User className="w-6 h-6 text-base-content/20" />
        </div>
        <div className="h-6 w-40 bg-base-200 rounded" />
      </header>

      {/* Form Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        {/* Avatar Upload Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-base-200" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-32 bg-base-200 rounded" />
            <div className="h-4 w-48 bg-base-200 rounded" />
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-base-200 rounded" />
              <div className="h-10 w-full bg-base-200 rounded" />
            </div>
          ))}
        </div>

        {/* Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-base-200 mt-6">
          <div className="h-10 w-full sm:w-32 bg-base-200 rounded" />
          <div className="h-10 w-full sm:w-40 bg-base-200 rounded" />
        </div>
      </section>

      {/* Password Section Skeleton */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-base-200">
            <User className="w-4 h-4 text-base-content/20" />
          </div>
          <div className="h-4 w-40 bg-base-200 rounded" />
        </div>
        <div className="h-4 w-full bg-base-200 rounded mb-4" />
        <div className="h-10 w-48 bg-base-200 rounded" />
      </section>
    </div>
  );
}
