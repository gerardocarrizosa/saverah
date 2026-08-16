"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import api from "@/lib/axios";

interface DeleteIncomeButtonProps {
  incomeId: string;
  className?: string;
}

export function DeleteIncomeButton({
  incomeId,
  className,
}: DeleteIncomeButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (!isConfirming) {
      setIsConfirming(true);
      setTimeout(
        () => setIsConfirming((current) => (current ? false : current)),
        3000,
      );
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/budget/income/${incomeId}`);
      router.refresh();
    } catch {
      setError("No se pudo eliminar el ingreso.");
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isDeleting}
        className={`${className ?? ""} ${
          isConfirming
            ? "bg-error/10 text-error opacity-100"
            : "bg-base-300 text-base-content/60 opacity-100 sm:opacity-0 group-hover:sm:opacity-100"
        }`}
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        {isConfirming ? "Confirmar" : ""}
      </button>
      {error && <p className="max-w-44 text-right text-xs text-error">{error}</p>}
    </div>
  );
}
