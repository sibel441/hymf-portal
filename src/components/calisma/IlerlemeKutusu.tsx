'use client';

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanItem } from '@/types/database';
import type { IzleyiciBaglami } from '@/lib/yetki';
import { notYazabilir } from '@/lib/yetki';
import { addProgressUpdate } from '@/lib/data/progress';
import { createClient } from '@/lib/supabase/client';
import { Panel, Button, Alan, selectSinifi, textareaSinifi, Uyari } from '@/components/ui';

export function IlerlemeKutusu({
  workspaceId,
  planItems,
  izleyici,
}: {
  workspaceId: string;
  planItems: PlanItem[];
  izleyici: IzleyiciBaglami;
}) {
  const [body, setBody] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const sb = createClient();
  const bodyId = useId();
  const selectId = useId();

  if (!notYazabilir(izleyici)) {
    return null;
  }

  const openItems = planItems.filter((item) =>
    ['planlandi', 'devam_ediyor', 'takildi', 'incelemede'].includes(item.status),
  );

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!body.trim()) {
      setError('Not boş olamaz.');
      return;
    }

    setIsSaving(true);

    const result = await addProgressUpdate(sb, {
      workspace_id: workspaceId,
      body: body.trim(),
      plan_item_id: selectedItemId || null,
    });

    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setBody('');
    setSelectedItemId(null);
    setSuccess(true);

    // Hide success message after 3 seconds
    const timer = setTimeout(() => setSuccess(false), 3000);

    router.refresh();
    return () => clearTimeout(timer);
  };

  const isStudent = izleyici.isStudent;
  const panelTitle = isStudent ? 'Bu hafta ne yaptım' : 'Geri bildirim yaz';
  const fieldLabel = isStudent ? 'Kısa ilerleme notu' : 'Geri bildiriminiz';

  return (
    <Panel baslik={panelTitle}>
      {error && <Uyari tone="tehlike">{error}</Uyari>}
      {success && <Uyari tone="basari">Kaydedildi.</Uyari>}

      <div className="space-y-4">
        <Alan etiket={fieldLabel} htmlFor={bodyId}>
          <textarea
            id={bodyId}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isStudent ? 'Bu hafta neler yaptınız?' : 'Geri bildiriminizi yazın'}
            className={textareaSinifi}
            rows={4}
          />
        </Alan>

        <Alan etiket="İlgili madde" htmlFor={selectId}>
          <select
            id={selectId}
            value={selectedItemId || ''}
            onChange={(e) => setSelectedItemId(e.target.value || null)}
            className={selectSinifi}
          >
            <option value="">Madde seçmeyin</option>
            {openItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </Alan>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Kaydediliyor…' : isStudent ? 'Notu kaydet' : 'Geri bildirimi kaydet'}
        </Button>
      </div>
    </Panel>
  );
}
