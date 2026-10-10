'use client';

import React, { useState } from 'react';
import { Panel, Button, Alan, inputSinifi, selectSinifi, Uyari } from '@/components/ui';
import type { MemberAllowlistEntry, PendingAdvisorAssignment, Profile, Kadro, Yetki } from '@/types/database';
import { KADROLAR, YETKILER, DANISMANLI_KADROLAR } from '@/types/database';
import { KADRO_ETIKETI, YETKI_ETIKETI } from '@/lib/etiketler';
import { kisaTarih } from '@/lib/zaman';
import { davetEkle, davetSil, bekleyenDanismanSil } from '@/app/yonetim/actions';

interface DavetYonetimiProps {
  allowlist: MemberAllowlistEntry[];
  pendingAdvisors: PendingAdvisorAssignment[];
  hokaProfiles: Profile[];
  allowlistHokas: MemberAllowlistEntry[];
  superadminDegilse: boolean;
}

export function DavetYonetimi({
  allowlist,
  pendingAdvisors,
  hokaProfiles,
  allowlistHokas,
  superadminDegilse,
}: DavetYonetimiProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    kadro: '' as Kadro | '',
    yetki: 'uye' as Yetki | '',
    danismanEmail: '' as string,
    sifre: '',
  });

  const sifreUret = () => {
    // Karışan karakterler (0/O, 1/l/I) yok; 12 karakter.
    const harfler = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rastgele = crypto.getRandomValues(new Uint32Array(12));
    setFormData((f) => ({ ...f, sifre: Array.from(rastgele, (n) => harfler[n % harfler.length]).join('') }));
  };

  const handleAddInvite = async () => {
    if (!formData.email || !formData.full_name || !formData.kadro || !formData.yetki || !formData.sifre) {
      setMessage({ type: 'error', text: 'Tüm zorunlu alanları doldurunuz.' });
      return;
    }

    setLoading(true);
    try {
      const result = await davetEkle({
        email: formData.email,
        full_name: formData.full_name,
        kadro: formData.kadro as Kadro,
        yetki: formData.yetki as Yetki,
        danismanEmail: formData.danismanEmail || undefined,
        sifre: formData.sifre,
      });

      if (result.ok) {
        setMessage({
          type: 'success',
          text: `Hesap açıldı. Giriş bilgilerini kişiye iletin: ${formData.email.trim().toLowerCase()} / ${formData.sifre}`,
        });
        setFormData({ email: '', full_name: '', kadro: '', yetki: 'uye', danismanEmail: '', sifre: '' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInvite = async (email: string) => {
    const onay = confirm('Daveti silmek istediğinize emin misiniz?');
    if (!onay) return;

    setLoading(true);
    try {
      const result = await davetSil(email);
      if (result.ok) {
        setMessage({ type: 'success', text: 'Daveti silindi' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePendingAdvisor = async (studentEmail: string, advisorEmail: string) => {
    const onay = confirm('Bekleyen eşleşmeyi kaldırmak istediğinize emin misiniz?');
    if (!onay) return;

    setLoading(true);
    try {
      const result = await bekleyenDanismanSil(studentEmail, advisorEmail);
      if (result.ok) {
        setMessage({ type: 'success', text: 'Eşleşme kaldırıldı' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDanismanOptions = () => {
    return [
      ...hokaProfiles.map((p) => ({ label: p.full_name, value: p.email })),
      ...allowlistHokas.map((a) => ({ label: a.full_name, value: a.email })),
    ];
  };

  const isDanismanliKadro = formData.kadro && DANISMANLI_KADROLAR.includes(formData.kadro);

  return (
    <div className="space-y-6">
      {message && (
        <Uyari
          tone={message.type === 'success' ? 'basari' : 'tehlike'}
        >
          {message.text}
        </Uyari>
      )}

      <Panel
        baslik="Üye ekle"
        aciklama="Hesap hemen açılır ve onaylanır; kişi buradaki kadro ve yetkiyi alır. Geçici şifreyi kişiye iletin, ilk girişten sonra Profil'den değiştirebilir. Listede olup hesabı olmayan biri için aynı e-postayla formu doldurun."
      >
        <div className="space-y-4">
          <Alan etiket="E-posta" htmlFor="invite-email">
            <input
              id="invite-email"
              type="email"
              className={inputSinifi}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ornek@example.com"
            />
          </Alan>

          <Alan etiket="Ad Soyad" htmlFor="invite-name">
            <input
              id="invite-name"
              type="text"
              className={inputSinifi}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Tam ad"
            />
          </Alan>

          <Alan etiket="Kadro" htmlFor="invite-kadro">
            <select
              id="invite-kadro"
              className={selectSinifi}
              value={formData.kadro}
              onChange={(e) => setFormData({ ...formData, kadro: e.target.value as Kadro })}
            >
              <option value="">Kadro seçin</option>
              {KADROLAR.filter((k) => !superadminDegilse || k !== 'hoca').map((k) => (
                <option key={k} value={k}>{KADRO_ETIKETI[k]}</option>
              ))}
            </select>
          </Alan>

          <Alan etiket="Yetki" htmlFor="invite-yetki">
            <select
              id="invite-yetki"
              className={selectSinifi}
              value={formData.yetki}
              onChange={(e) => setFormData({ ...formData, yetki: e.target.value as Yetki })}
              disabled={superadminDegilse}
            >
              {superadminDegilse ? (
                <option value="uye">{YETKI_ETIKETI.uye}</option>
              ) : (
                YETKILER.map((y) => (
                  <option key={y} value={y}>{YETKI_ETIKETI[y]}</option>
                ))
              )}
            </select>
          </Alan>

          {isDanismanliKadro && (
            <Alan etiket="Danışman (opsiyonel)" htmlFor="invite-danisman">
              <select
                id="invite-danisman"
                className={selectSinifi}
                value={formData.danismanEmail}
                onChange={(e) => setFormData({ ...formData, danismanEmail: e.target.value })}
              >
                <option value="">Danışman seçin</option>
                {getDanismanOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Alan>
          )}

          <Alan etiket="Geçici şifre" htmlFor="invite-sifre">
            <div className="flex gap-2">
              <input
                id="invite-sifre"
                type="text"
                autoComplete="off"
                className={inputSinifi}
                value={formData.sifre}
                onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
                placeholder="En az 8 karakter"
              />
              <Button type="button" variant="secondary" onClick={sifreUret}>
                Üret
              </Button>
            </div>
          </Alan>

          <Button
            variant="primary"
            disabled={loading || !formData.email || !formData.full_name || !formData.kadro || formData.sifre.length < 8}
            onClick={handleAddInvite}
          >
            Hesabı aç
          </Button>
        </div>
      </Panel>

      <Panel baslik="Davet listesi">
        {allowlist.length === 0 ? (
          <div className="text-sm text-ink-3">Davet listesi boş.</div>
        ) : (
          <div className="divide-y divide-line">
            {allowlist.map((entry) => (
              <div key={entry.email} className="flex gap-3 items-center py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{entry.email}</div>
                  <div className="text-sm text-ink-3">{entry.full_name}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="rounded bg-sunken px-1.5 py-0.5 text-xs font-medium text-ink-2">{KADRO_ETIKETI[entry.kadro]}</span>
                    <span className="rounded bg-sunken px-1.5 py-0.5 text-xs font-medium text-ink-2">{YETKI_ETIKETI[entry.yetki]}</span>
                    <span className="text-sm text-ink-3">{kisaTarih(entry.created_at)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleRemoveInvite(entry.email)}
                >
                  Çıkar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {pendingAdvisors.length > 0 && (
        <Panel
          baslik="Bekleyen danışman eşleşmeleri"
          aciklama="İki taraf da hesap açınca otomatik danışman ataması yapılır."
        >
          <div className="divide-y divide-line">
            {pendingAdvisors.map((pa) => (
              <div key={`${pa.student_email}-${pa.advisor_email}`} className="flex gap-3 items-center py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink">
                    {pa.student_email} <span className="text-ink-2">→</span> {pa.advisor_email}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleRemovePendingAdvisor(pa.student_email, pa.advisor_email)}
                >
                  Kaldır
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
