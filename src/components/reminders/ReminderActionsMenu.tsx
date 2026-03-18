'use client';

import Link from 'next/link';
import { MoreVertical, Edit3, Pause, Play, Trash2 } from 'lucide-react';

interface ReminderActionsMenuProps {
  reminderId: string;
  reminderName: string;
  isActive: boolean;
}

export function ReminderActionsMenu({
  reminderId,
  isActive,
}: ReminderActionsMenuProps) {
  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm btn-circle"
        title="Más opciones"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-300 mt-1"
      >
        <li>
          <Link
            href={`/reminders/${reminderId}/edit`}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </Link>
        </li>
        <li>
          <button
            type="submit"
            form="toggle-status-form"
            className="flex items-center gap-2 w-full text-left"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Activar
              </>
            )}
          </button>
        </li>
        <div className="divider my-1"></div>
        <li>
          <button
            type="submit"
            form="delete-form"
            className="flex items-center gap-2 w-full text-left text-error hover:bg-error/10"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </li>
      </ul>
    </div>
  );
}
