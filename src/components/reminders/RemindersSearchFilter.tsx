'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_EMOJIS, REMINDER_CATEGORIES } from '@/config/constants';

interface RemindersSearchFilterProps {
  initialQuery: string;
  initialCategory: string | null;
}

export function RemindersSearchFilter({
  initialQuery,
  initialCategory,
}: RemindersSearchFilterProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [, setIsSearching] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);

    const queryString = params.toString();
    router.push(`/reminders${queryString ? `?${queryString}` : ''}`);
    setIsSearching(false);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);

    const queryString = params.toString();
    router.push(`/reminders${queryString ? `?${queryString}` : ''}`);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);

    const queryString = params.toString();
    router.push(`/reminders${queryString ? `?${queryString}` : ''}`);
    setIsSearching(false);
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setIsSearching(true);
    router.push('/reminders');
    setIsSearching(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Buscar recordatorios..."
              className="w-full bg-base-200 rounded-xl border-none px-4 py-3 pl-10 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-base-300 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-base-content/40" />
              </button>
            )}
          </div>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-primary/10 text-primary'
              : 'bg-base-200 text-base-content/60 hover:bg-base-300'
          }`}
          aria-label="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === null
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/60 hover:bg-base-300'
            }`}
          >
            Todos
          </button>

          {REMINDER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() =>
                handleCategoryChange(
                  selectedCategory === category ? null : category
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                selectedCategory === category
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              }`}
            >
              <span className="text-xs">{CATEGORY_EMOJIS[category] || '📦'}</span>
              <span>{category}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active filter indicator */}
      {!showFilters && hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <span>Filtros activos:</span>
          {searchQuery && (
            <span className="bg-base-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Search className="w-3 h-3" />
              &quot;{searchQuery}&quot;
            </span>
          )}
          {selectedCategory && (
            <span className="bg-base-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
              {CATEGORY_EMOJIS[selectedCategory]}
              {selectedCategory}
            </span>
          )}
          <button
            onClick={clearAll}
            className="text-accent hover:text-accent/80 transition-colors underline underline-offset-2"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
