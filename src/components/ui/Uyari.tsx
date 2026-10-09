import React from 'react';
import { cn } from '@/lib/cn';

type Ton = 'bilgi' | 'uyari' | 'basari' | 'tehlike';

const tonlar: Record<Ton, string> = {
  bilgi: 'bg-info-soft text-info',
  uyari: 'bg-warn-soft text-warn',
  basari: 'bg-ok-soft text-ok',
  tehlike: 'bg-danger-soft text-danger',
};

export function Uyari({
  tone = 'bilgi',
  baslik,
  className,
  children,
}: {
  tone?: Ton;
  baslik?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div role={tone === 'tehlike' ? 'alert' : 'status'} className={cn('rounded-md px-4 py-3 text-sm', tonlar[tone], className)}>
      {baslik && <p className="font-medium">{baslik}</p>}
      {children && <div className={baslik ? 'mt-1' : undefined}>{children}</div>}
    </div>
  );
}
