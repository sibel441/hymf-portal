'use client';

import React, { useState } from 'react';
import { Panel, Button, Uyari, selectSinifi } from '@/components/ui';
import type { Profile, Yetki } from '@/types/database';
import { YETKILER } from '@/types/database';
import { YETKI_ETIKETI, KADRO_ETIKETI } from '@/lib/etiketler';
import { yetkiVer } from '@/app/yonetim/actions';

interface YetkilerYonetimiProps {
  profiles: Profile[];
  superadminCount: number;
}

export function YetkilerYonetimi({ profiles, superadminCount }: YetkilerYonetimiProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Yetki>>({});

  const uyeler = profiles.filter((p) => p.is_approved && p.is_active);
  const isSonSuperadmin = (p: Profile) => {
    return (
      p.yetki === 'superadmin' &&
      superadminCount === 1
    );
  };

  const handleChangeYetki = async (id: string, yetki: Yetki) => {
    setLoading(true);
    try {
      const result = await yetkiVer(id, yetki);
      if (result.ok) {
        setMessage({ type: 'success', text: 'Yetki güncellendi' });
        setEditingId(null);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <Uyari
          tone={message.type === 'success' ? 'basari' : 'tehlike'}
        >
          {message.text}
        </Uyari>
      )}

      <Uyari tone="bilgi">
        <div className="text-sm">
          <p>
            Yöneticiler üyeleri onaylayabilir, kadro ve danışman atayabilir. Çalışma alanlarını göremezler;
            bir çalışma alanını yalnız öğrenci ve danışmanı görür.
          </p>
        </div>
      </Uyari>

      <Panel baslik="Yetkiler">
        <div className="divide-y divide-line">
          {uyeler.map((p) => {
            const isSon = isSonSuperadmin(p);
            const isEditing = editingId === p.id;
            const selectedYetki = formData[p.id] || p.yetki;

            return (
              <div key={p.id} className="flex gap-3 items-center py-3 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{p.full_name}</div>
                  <div className="text-sm text-ink-3">{p.email}</div>
                  <div className="text-sm text-ink-3">{p.kadro ? KADRO_ETIKETI[p.kadro] : 'Belirlenmedi'}</div>
                </div>
                {isEditing && !isSon ? (
                  <div className="flex gap-2 items-center">
                    <select
                      className={selectSinifi}
                      value={selectedYetki}
                      onChange={(e) => {
                        const yetki = e.target.value as Yetki;
                        setFormData({ ...formData, [p.id]: yetki });
                      }}
                    >
                      {YETKILER.map((y) => (
                        <option key={y} value={y}>{YETKI_ETIKETI[y]}</option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={loading || selectedYetki === p.yetki}
                      onClick={() => handleChangeYetki(p.id, selectedYetki)}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      İptal
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <div className="text-sm text-ink-2 min-w-32 text-right">
                      {YETKI_ETIKETI[p.yetki]}
                    </div>
                    {isSon ? (
                      <div className="text-sm text-ink-3" title="Son sistem yöneticisi yetkisini bırakamaz">
                        (sabit)
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(p.id);
                          setFormData({ ...formData, [p.id]: p.yetki });
                        }}
                      >
                        Değiştir
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
