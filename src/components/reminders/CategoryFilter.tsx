'use client';

import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { categoryEmojis, REMINDER_CATEGORIES } from '@/config/constants';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  isSearching: boolean;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: CategoryFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const clearSearch = () => {
    onSearchChange('');
    onSearchSubmit();
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="space-y-3">
      {/* Search Row - Compact and inline */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Buscar recordatorios..."
              className="input input-bordered w-full pl-9 pr-8 rounded-lg"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-base-200 rounded"
              >
                <X className="w-3 h-3 text-base-content/40" />
              </button>
            )}
          </div>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-sm btn-ghost gap-2 ${showFilters || hasActiveFilters ? 'btn-active' : ''}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="badge badge-sm badge-primary">!</span>
          )}
        </button>
      </div>

      {/* Category Pills - Collapsible */}
      {showFilters && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-base-200">
          <button
            onClick={() => onCategoryChange(null)}
            className={`btn btn-xs gap-1.5 ${selectedCategory === null ? 'btn-primary' : 'btn-ghost bg-base-200/50'}`}
          >
            Todos
          </button>

          {REMINDER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() =>
                onCategoryChange(
                  selectedCategory === category ? null : category,
                )
              }
              className={`btn btn-xs gap-1.5 ${selectedCategory === category ? 'btn-primary' : 'btn-ghost bg-base-200/50'}`}
            >
              <span className="text-xs">
                {categoryEmojis[category] || '📦'}
              </span>
              <span>{category}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active filter indicator - Subtle */}
      {!showFilters && hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <span>Filtros activos:</span>
          {searchQuery && (
            <span className="badge badge-ghost badge-sm gap-1">
              <Search className="w-3 h-3" />
              &quot;{searchQuery}&quot;
            </span>
          )}
          {selectedCategory && (
            <span className="badge badge-ghost badge-sm gap-1">
              {categoryEmojis[selectedCategory]}
              {selectedCategory}
            </span>
          )}
          <button
            onClick={() => {
              onCategoryChange(null);
              onSearchChange('');
              onSearchSubmit();
            }}
            className="link link-hover text-error"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
