import React from 'react';
import { UserRole } from '@/types/database';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

const base =
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap';

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case 'hoca':
      return (
        <span className={`${base} bg-red-950/60 text-red-200 border-red-800/60`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          Sorumlu Hoca
        </span>
      );
    case 'yonetici':
      return (
        <span className={`${base} bg-amber-500/10 text-amber-200 border-amber-500/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Grup Yöneticisi
        </span>
      );
    case 'arastirmaci':
    default:
      return (
        <span className={`${base} bg-slate-800/80 text-slate-300 border-slate-700`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Araştırmacı
        </span>
      );
  }
}
