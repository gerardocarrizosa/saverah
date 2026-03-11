'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function VisibilityToggle() {
  const [isVisible, setIsVisible] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardStatsVisible');
    if (saved !== null) {
      setIsVisible(saved === 'true');
    }
  }, []);

  // Save preference when changed
  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem('dashboardStatsVisible', newValue.toString());
    // Dispatch storage event to sync with other components
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'dashboardStatsVisible',
        newValue: newValue.toString(),
      }),
    );
  };

  return (
    <button
      onClick={toggleVisibility}
      className="btn btn-sm btn-ghost gap-2"
      title={isVisible ? 'Ocultar montos' : 'Mostrar montos'}
    >
      {isVisible ? (
        <>
          <span className="hidden sm:inline">Ocultar montos</span>
          <EyeOff className="w-5 h-5" />
        </>
      ) : (
        <>
          <span className="hidden sm:inline">Mostrar montos</span>
          <Eye className="w-5 h-5" />
        </>
      )}
    </button>
  );
}
