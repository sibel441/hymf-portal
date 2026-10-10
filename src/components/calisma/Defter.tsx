'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { PlanItem, ProgressUpdate } from '@/types/database';
import type { IzleyiciBaglami } from '@/lib/yetki';
import { notDuzenleyebilir } from '@/lib/yetki';
import { deleteProgressUpdate, updateProgressUpdate } from '@/lib/data/progress';
import { createClient } from '@/lib/supabase/client';
import { kisaAd } from '@/lib/etiketler';
import { kisaTarih, tarihSaat } from '@/lib/zaman';
import { Panel, BosDurum, Button, Uyari, textareaSinifi } from '@/components/ui';

export function Defter({
  updates,
  planItems,
  izleyici,
}: {
  updates: ProgressUpdate[];
  planItems: PlanItem[];
  izleyici: IzleyiciBaglami;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const sb = createClient();

  if (updates.length === 0) {
    return (
      <Panel baslik="Defter">
        <BosDurum
          baslik="Henüz not yok"
          aciklama="Haftalık ilerleme notları ve danışman geri bildirimleri burada tarih sırasıyla görünür."
        />
      </Panel>
    );
  }

  const handleDeleteUpdate = async (id: string) => {
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return;

    const result = await deleteProgressUpdate(sb, id);
    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  };

  const handleEditStart = (update: ProgressUpdate) => {
    setEditingId(update.id);
    setEditBody(update.body);
  };

  const handleSaveEdit = async (id: string) => {
    setError(null);

    if (!editBody.trim()) {
      setError('Not boş olamaz.');
      return;
    }

    setIsSaving(true);

    const result = await updateProgressUpdate(sb, id, editBody.trim());

    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditingId(null);
    router.refresh();
  };

  const planItemMap = new Map(planItems.map((item) => [item.id, item]));

  return (
    <Panel baslik="Defter">
      {error && <Uyari tone="tehlike">{error}</Uyari>}

      <div className="grid gap-x-4" style={{ gridTemplateColumns: '4.5rem 1fr' }}>
        {updates.map((update) => {
          const isEditing = editingId === update.id;
          const isGeribildrim = update.tur === 'geri_bildirim';
          const planItem = update.plan_item_id ? planItemMap.get(update.plan_item_id) : null;
          const canEdit = notDuzenleyebilir(izleyici, update);

          return (
            <React.Fragment key={update.id}>
              {/* Date column */}
              <div className="text-sm text-ink-3 tabular-nums pt-0.5" title={tarihSaat(update.created_at)} suppressHydrationWarning>
                {kisaTarih(update.created_at)}
              </div>

              {/* Content column */}
              <div className={`border-l pb-6 pl-4 ${isGeribildrim ? 'border-l-2 border-pen' : 'border-line-strong'}`}>
                {isGeribildrim && (
                  <p className="text-sm font-medium text-pen">
                    Geri bildirim, {update.author && kisaAd(update.author.full_name)}
                  </p>
                )}

                {!isGeribildrim && update.author && (
                  <p className="text-sm text-ink-2">{kisaAd(update.author.full_name)}</p>
                )}

                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      maxLength={5000}
                      className={textareaSinifi}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveEdit(update.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Vazgeç
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-ink">
                      {update.body}
                    </p>

                    {planItem && (
                      <p className="mt-2 text-sm text-ink-3">Madde: {planItem.title}</p>
                    )}

                    {canEdit && (
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(update)}
                         
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUpdate(update.id)}
                         
                          title="Sil"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Panel>
  );
}
