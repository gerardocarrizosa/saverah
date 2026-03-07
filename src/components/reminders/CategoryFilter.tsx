'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { REMINDER_CATEGORIES } from '@/config/constants';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  isSearching: boolean;
}

const categoryEmojis: Record<string, string> = {
  'Tarjeta de Crédito': '💳',
  Servicios: '⚡',
  Suscripción: '📱',
  Alquiler: '🏠',
  Préstamo: '📊',
  Seguro: '🛡️',
  Impuestos: '📄',
  Otros: '📦',
};

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isSearching,
}: CategoryFilterProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const clearSearch = () => {
    onSearchChange('');
    onSearchSubmit();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div
          className={`flex items-center gap-2 input-group ${isFocused ? 'ring-2 ring-primary/50 rounded-lg' : ''}`}
        >
          <span className="input-group-text bg-base-200">
            <Search className="w-5 h-5 text-base-content/50" />
          </span>
          <input
            type="text"
            placeholder="Buscar recordatorios..."
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="btn btn-ghost btn-sm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSearching}
          >
            {isSearching ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Buscar'
            )}
          </button>
        </div>
      </form>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`btn btn-sm gap-2 ${selectedCategory === null ? 'btn-primary' : 'btn-ghost'}`}
        >
          <span>🗂️</span>
          Todos
        </button>

        {REMINDER_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() =>
              onCategoryChange(selectedCategory === category ? null : category)
            }
            className={`btn btn-sm gap-2 ${selectedCategory === category ? 'btn-primary' : 'btn-ghost'}`}
          >
            <span>{categoryEmojis[category] || '📦'}</span>
            <span className="hidden sm:inline">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
