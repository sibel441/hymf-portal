'use client';

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { WorkspaceFile, PlanItem } from '@/types/database';
import type { IzleyiciBaglami } from '@/lib/yetki';
import { dosyaYukleyebilir, dosyaSilebilir } from '@/lib/yetki';
import { uploadFile, deleteFile, getDownloadUrl, DOSYA_SINIRI_BAYT } from '@/lib/data/files';
import { createClient } from '@/lib/supabase/client';
import { kisaAd } from '@/lib/etiketler';
import { kisaTarih, tarihSaat } from '@/lib/zaman';
import {
  Panel,
  BosDurum,
  Button,
  Alan,
  inputSinifi,
  selectSinifi,
  Uyari,
  buttonClass,
} from '@/components/ui';

function dosyaBoyutu(bytes: number | null): string {
  if (!bytes) return '?';
  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1).replace('.', ',')} MB`;
  }
  return `${Math.round(kb).toLocaleString('tr-TR')} KB`;
}

export function Dosyalar({
  workspaceId,
  files,
  planItems,
  izleyici,
}: {
  workspaceId: string;
  files: WorkspaceFile[];
  planItems: PlanItem[];
  izleyici: IzleyiciBaglami;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const sb = createClient();

  const fileInputId = useId();
  const itemSelectId = useId();
  const notesId = useId();

  if (!dosyaYukleyebilir(izleyici) && files.length === 0) {
    return (
      <Panel baslik="Dosyalar">
        <BosDurum
          baslik="Henüz dosya yok"
          aciklama="PDF, PNG, JPEG, CSV, TXT, DOCX veya XLSX yükleyebilirsiniz."
        />
      </Panel>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Dosya seçin.');
      return;
    }

    if (selectedFile.size > DOSYA_SINIRI_BAYT) {
      setError(`Dosya 25 MB'tan büyük. Büyük çıktılar için TRUBA yolunu plan maddesine yazın.`);
      return;
    }

    setIsUploading(true);

    const result = await uploadFile(sb, {
      workspaceId,
      file: selectedFile,
      planItemId: selectedItemId || null,
      notes: notes || null,
    });

    setIsUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSelectedFile(null);
    setSelectedItemId(null);
    setNotes('');
    setError(null);

    // Reset file input
    const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    router.refresh();
  };

  const handleDeleteFile = async (file: WorkspaceFile) => {
    if (!window.confirm(`"${file.file_name}" dosyasını silmek istediğinize emin misiniz?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteFile(sb, file);
    setIsDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  };

  const handleDownload = async (file: WorkspaceFile) => {
    if (!file.storage_path) {
      setError('Dosya bulunamadı.');
      return;
    }

    const result = await getDownloadUrl(sb, file.storage_path);
    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      window.open(result.data, '_blank', 'noopener');
    }
  };

  const openItems = planItems.filter((item) =>
    ['planlandi', 'devam_ediyor', 'takildi', 'incelemede'].includes(item.status),
  );

  return (
    <Panel
      baslik="Dosyalar"
      aciklama="PDF, PNG, JPEG, CSV, TXT, DOCX veya XLSX, en fazla 25 MB. Büyük VASP çıktılarını yüklemeyin; TRUBA yolunu plan maddesine yazın."
    >
      {error && <Uyari tone="tehlike">{error}</Uyari>}

      {dosyaYukleyebilir(izleyici) && (
        <form onSubmit={handleUpload} className="mb-6 border-b border-line pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-ink">Dosya</span>
              {/* Tarayıcının kendi (İngilizce) dosya düğmesi yerine Türkçe etiketli düğme. */}
              <label
                htmlFor={fileInputId}
                className={buttonClass({ variant: 'secondary', className: 'w-full cursor-pointer justify-start font-normal' })}
              >
                <span className="truncate">{selectedFile ? selectedFile.name : 'Dosya seç'}</span>
              </label>
              <input
                id={fileInputId}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.dat,.docx,.xlsx"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </div>

            <Alan etiket="İlgili madde" htmlFor={itemSelectId}>
              <select
                id={itemSelectId}
                value={selectedItemId || ''}
                onChange={(e) => setSelectedItemId(e.target.value || null)}
                className={selectSinifi}
              >
                <option value="">Yok</option>
                {openItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </Alan>

            <Alan etiket="Not" htmlFor={notesId}>
              <input
                id={notesId}
                type="text"
                maxLength={300}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputSinifi}
              />
            </Alan>

            <Button type="submit" variant="primary" disabled={isUploading || !selectedFile}>
              {isUploading ? 'Yükleniyor…' : 'Yükle'}
            </Button>
          </div>
        </form>
      )}

      {files.length === 0 ? (
        <BosDurum baslik="Henüz dosya yok" aciklama="Hesap çıktılarını, grafik ve tablo taslaklarını buraya yükleyebilirsiniz." />
      ) : (
        <ul className="divide-y divide-line">
          {files.map((file) => (
            <li key={file.id} className="flex items-start justify-between gap-4 py-3">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleDownload(file)}
                  className="text-link underline hover:text-link/90"
                >
                  {file.file_name}
                </button>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-ink-3">
                  {file.size_bytes !== null && (
                    <span>{dosyaBoyutu(file.size_bytes)}</span>
                  )}
                  {file.uploader && (
                    <span>{kisaAd(file.uploader.full_name)}</span>
                  )}
                  <span
                    title={tarihSaat(file.created_at)}
                    suppressHydrationWarning
                  >
                    {kisaTarih(file.created_at)}
                  </span>
                </div>
                {file.notes && (
                  <p className="mt-2 text-sm text-ink-2">{file.notes}</p>
                )}
              </div>

              {dosyaSilebilir(izleyici, file) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFile(file)}
                  disabled={isDeleting}
                  className="flex-shrink-0"
                  title="Sil"
                >
                  <Trash2 size={16} />
                  <span className="sr-only">Sil</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
