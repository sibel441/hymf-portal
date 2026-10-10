'use client';

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import type { StudentWorkspace, ProfileSummary } from '@/types/database';
import type { IzleyiciBaglami } from '@/lib/yetki';
import { tezBilgisiDuzenleyebilir } from '@/lib/yetki';
import { kisaAd } from '@/lib/etiketler';
import { updateWorkspaceInfo } from '@/lib/data/workspaces';
import { createClient } from '@/lib/supabase/client';
import { Panel, Button, Alan, inputSinifi, textareaSinifi, Uyari } from '@/components/ui';

export function TezBilgisi({
  workspace,
  advisors,
  izleyici,
}: {
  workspace: StudentWorkspace;
  advisors: ProfileSummary[];
  izleyici: IzleyiciBaglami;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState(workspace.thesis_title || '');
  const [formSummary, setFormSummary] = useState(workspace.summary || '');
  const [formDriveUrl, setFormDriveUrl] = useState(workspace.drive_url || '');

  const router = useRouter();
  const sb = createClient();

  const titleId = useId();
  const summaryId = useId();
  const driveId = useId();

  const duzenleyebilir = tezBilgisiDuzenleyebilir(izleyici);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    // URL doğrulama
    if (formDriveUrl && !formDriveUrl.startsWith('https://')) {
      setError('Drive bağlantısı https:// ile başlamalı.');
      setIsSaving(false);
      return;
    }

    const result = await updateWorkspaceInfo(sb, workspace.id, {
      thesis_title: formTitle || null,
      summary: formSummary || null,
      drive_url: formDriveUrl || null,
    });

    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
    router.refresh();
  };

  const advisorText =
    advisors.length === 0
      ? 'Danışman atanmadı'
      : advisors.length === 1
        ? `Danışman: ${kisaAd(advisors[0].full_name)}`
        : `Danışmanlar: ${advisors.map((a) => kisaAd(a.full_name)).join(', ')}`;

  if (isEditing && duzenleyebilir) {
    return (
      <Panel baslik="Tez bilgileri">
        <form onSubmit={handleSave} className="space-y-4">
        {error && <Uyari tone="tehlike">{error}</Uyari>}

        <Alan etiket="Tez başlığı" htmlFor={titleId}>
          <input
            id={titleId}
            type="text"
            maxLength={300}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Tez başlığınızı girin"
            className={inputSinifi}
          />
        </Alan>

        <Alan etiket="Özet" htmlFor={summaryId} yardim="En fazla 2000 karakter.">
          <textarea
            id={summaryId}
            maxLength={2000}
            value={formSummary}
            onChange={(e) => setFormSummary(e.target.value)}
            placeholder="Tez özeti"
            className={textareaSinifi}
            rows={4}
          />
        </Alan>

        <Alan
          etiket="Drive klasörü bağlantısı"
          htmlFor={driveId}
          yardim="Google Drive'da paylaşılan klasörün bağlantısı. https:// ile başlamalı."
        >
          <input
            id={driveId}
            type="url"
            value={formDriveUrl}
            onChange={(e) => setFormDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className={inputSinifi}
          />
        </Alan>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving}
          >
            {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setError(null);
            }}
          >
            Vazgeç
          </Button>
        </div>
        </form>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          {workspace.thesis_title ? (
            <h2 className="font-serif italic text-xl text-ink sm:text-2xl">
              {workspace.thesis_title}
            </h2>
          ) : (
            <p className="text-ink-3 italic">Tez başlığı henüz girilmedi</p>
          )}

          <p className="mt-2 text-sm text-ink-2">{advisorText}</p>

          {workspace.summary && (
            <p className="mt-4 max-w-prose text-base leading-7 text-ink-2">
              {workspace.summary}
            </p>
          )}

          {workspace.drive_url && workspace.drive_url.startsWith('https://') && (
            <a
              href={workspace.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-link underline hover:text-link/90"
            >
              Drive klasörü
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {duzenleyebilir && (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            Düzenle
          </Button>
        )}
      </div>
    </div>
  );
}
