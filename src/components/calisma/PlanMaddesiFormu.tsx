'use client';

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanItem, PlanDurum } from '@/types/database';
import type { PlanIzinleri } from '@/lib/yetki';
import { DURUM_ETIKETI, ONCELIK_ETIKETI } from '@/lib/etiketler';
import { createPlanItem, updatePlanItem } from '@/lib/data/plan';
import { createClient } from '@/lib/supabase/client';
import { Button, Alan, inputSinifi, textareaSinifi, selectSinifi, Uyari } from '@/components/ui';

export function PlanMaddesiFormu({
  mod,
  workspaceId,
  madde,
  izinler,
  onBitti,
}: {
  mod: 'ekle' | 'duzenle';
  workspaceId: string;
  madde?: PlanItem;
  izinler: PlanIzinleri;
  onBitti: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(madde?.title || '');
  const [description, setDescription] = useState(madde?.description || '');
  const [dueDate, setDueDate] = useState(madde?.due_date || '');
  const [priority, setPriority] = useState<1 | 2 | 3>(madde?.priority || 2);
  const [status, setStatus] = useState<PlanDurum>(madde?.status || 'planlandi');
  const [trubaRef, setTrubaRef] = useState(madde?.truba_ref || '');

  const router = useRouter();
  const sb = createClient();

  const titleId = useId();
  const descId = useId();
  const dateId = useId();
  const priorityId = useId();
  const statusId = useId();
  const trubaId = useId();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Başlık zorunludur.');
      return;
    }

    setIsSaving(true);

    if (mod === 'ekle') {
      const result = await createPlanItem(sb, {
        workspace_id: workspaceId,
        title: title.trim(),
        description: description || null,
        due_date: dueDate || null,
        priority,
        truba_ref: trubaRef || null,
      });

      setIsSaving(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onBitti();
    } else if (madde) {
      const patch: Record<string, unknown> = {};

      if (izinler.duzenle) {
        if (title !== madde.title) patch.title = title.trim();
        if (description !== (madde.description || '')) patch.description = description || null;
        if (dueDate !== (madde.due_date || '')) patch.due_date = dueDate || null;
        if (priority !== madde.priority) patch.priority = priority;
      }

      if (izinler.durumDegistir && status !== madde.status) {
        patch.status = status;
      }

      if (izinler.trubaDuzenle && trubaRef !== (madde.truba_ref || '')) {
        patch.truba_ref = trubaRef || null;
      }

      if (Object.keys(patch).length === 0) {
        onBitti();
        return;
      }

      const result = await updatePlanItem(sb, madde.id, patch);

      setIsSaving(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onBitti();
    }
  };

  const canEditMainFields = mod === 'ekle' || izinler.duzenle;
  const showRestrictedMessage = mod === 'duzenle' && madde && madde.created_by && !izinler.duzenle;

  return (
    <form onSubmit={handleSave} className="space-y-4 rounded-md border border-line bg-paper p-4">
      {showRestrictedMessage && (
        <p className="text-sm text-ink-3">
          Bu madde danışmanınız tarafından eklendi; yalnız TRUBA bilgisini değiştirebilirsiniz.
        </p>
      )}

      {error && <Uyari tone="tehlike">{error}</Uyari>}

      {canEditMainFields && (
        <>
          <Alan etiket="Başlık" htmlFor={titleId}>
            <input
              id={titleId}
              type="text"
              required
              maxLength={300}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputSinifi}
            />
          </Alan>

          <Alan etiket="Açıklama" htmlFor={descId}>
            <textarea
              id={descId}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaSinifi}
              rows={3}
            />
          </Alan>

          <div className="grid gap-4 sm:grid-cols-2">
            <Alan etiket="Son tarih" htmlFor={dateId}>
              <input
                id={dateId}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputSinifi}
              />
            </Alan>

            <Alan etiket="Öncelik" htmlFor={priorityId}>
              <select
                id={priorityId}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                className={selectSinifi}
              >
                <option value={1}>{ONCELIK_ETIKETI[1]}</option>
                <option value={2}>{ONCELIK_ETIKETI[2]}</option>
                <option value={3}>{ONCELIK_ETIKETI[3]}</option>
              </select>
            </Alan>
          </div>
        </>
      )}

      {izinler.durumDegistir && (
        <Alan etiket="Durum" htmlFor={statusId}>
          <select
            id={statusId}
            value={status}
            onChange={(e) => setStatus(e.target.value as PlanDurum)}
            className={selectSinifi}
          >
            {Object.entries(DURUM_ETIKETI).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Alan>
      )}

      <Alan
        etiket="TRUBA yolu veya iş numarası"
        htmlFor={trubaId}
        yardim="Büyük çıktılar (WAVECAR, CHGCAR) yüklenmez; TRUBA'daki yolunu veya iş numarasını yazın."
      >
        <input
          id={trubaId}
          type="text"
          maxLength={500}
          value={trubaRef}
          onChange={(e) => setTrubaRef(e.target.value)}
          placeholder="/arf/scratch/kullanici/hesap veya 1234567"
          className={`${inputSinifi} font-mono`}
        />
      </Alan>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
          {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onBitti}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
