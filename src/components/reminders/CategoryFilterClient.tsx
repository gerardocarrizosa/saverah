'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryFilter as CategoryFilterUI } from '@/components/reminders/CategoryFilter';

interface CategoryFilterClientProps {
  initialQuery: string;
  initialCategory: string | null;
}

export function CategoryFilterClient({ 
  initialQuery, 
  initialCategory 
}: CategoryFilterClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = () => {
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

  return (
    <CategoryFilterUI
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      isSearching={isSearching}
    />
  );
}
