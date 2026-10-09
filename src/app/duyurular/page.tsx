'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/mockData';
import { Announcement, AnnouncementPriority } from '@/types/database';
import {
  SayfaBasligi,
  OrnekVeriNotu,
  Panel,
  Button,
  Rozet,
  YetkiRozeti,
} from '@/components/ui';

export default function AnnouncementsPage() {
  const { profile, role } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form alanları
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('toplanti');

  const filtered = announcements.filter((ann) => {
    if (filterPriority === 'all') return true;
    return ann.priority === filterPriority;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setFeedbackMessage(null);

    // 1. Telegram API route'una istek at
    let telegramSent = false;
    let messageId: string | undefined;

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          priority,
          authorName: profile?.full_name || 'HYMF Araştırmacısı',
          authorTitle: profile?.academic_title || 'Araştırmacı',
        }),
      });
      const data = await res.json();
      if (data.success) {
        telegramSent = true;
        messageId = data.messageId;
      }
    } catch (err) {
      console.warn('Telegram bildirim hatası:', err);
    }

    // 2. Yeni duyuruyu listeye ekle
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      priority,
      author_id: profile?.id || 'demo-user',
      telegram_sent: telegramSent,
      telegram_message_id: messageId,
      created_at: new Date().toISOString(),
      author: profile || undefined,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setTitle('');
    setContent('');

    setFeedbackMessage(
      telegramSent
        ? 'Duyuru başarıyla yayınlandı ve Telegram grubuna anında iletildi!'
        : priority === 'acil' || priority === 'toplanti'
        ? 'Duyuru yayınlandı (Telegram bot anahtarı henüz eklenmediği için simüle edildi).'
        : 'Duyuru başarıyla portalda yayınlandı (Sessiz kategori).'
    );

    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleDelete = (id: string, authorId: string) => {
    // RBAC Kontrolü: Kendi duyurusu veya Hoca/Yönetici
    const canDelete = profile?.id === authorId || role === 'hoca' || role === 'yonetici';
    if (!canDelete) {
      alert('Yalnızca kendi duyurunuzu veya hoca/yönetici iseniz silebilirsiniz.');
      return;
    }

    if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <SayfaBasligi
        baslik="Duyurular"
        aciklama="Tüm grup üyelerinin ortak akışı. Acil ve toplantı duyuruları doğrudan Telegram grubuna iletilir."
        eylemler={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Duyuru ekle</span>
          </Button>
        }
      />

      <OrnekVeriNotu />

      {/* Geri Bildirim Bildirimi */}
      {feedbackMessage && (
        <div className="p-4 rounded-lg bg-ok-soft border border-ok text-ok text-sm flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Öncelik Filtreleme Butonları */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Tüm duyurular' },
          { id: 'acil', label: 'Acil' },
          { id: 'toplanti', label: 'Toplantılar' },
          { id: 'soru_yardim', label: 'Soru ve yardım' },
          { id: 'kaynak_paylasimi', label: 'Kaynak paylaşımı' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterPriority(tab.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
              filterPriority === tab.id
                ? 'bg-primary text-on-primary'
                : 'bg-sunken text-ink-2 hover:bg-sunken border border-line'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Duyuru Kartları */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <Panel key={ann.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Rozet
                  tone={
                    ann.priority === 'acil'
                      ? 'uyari'
                      : ann.priority === 'toplanti'
                        ? 'bilgi'
                        : ann.priority === 'soru_yardim'
                          ? 'notr'
                          : 'basari'
                  }
                >
                  {ann.priority === 'acil'
                    ? 'Acil'
                    : ann.priority === 'toplanti'
                      ? 'Toplantı'
                      : ann.priority === 'soru_yardim'
                        ? 'Soru ve yardım'
                        : 'Kaynak paylaşımı'}
                </Rozet>

                {ann.telegram_sent && (
                  <span className="text-sm text-ok flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    Telegram&apos;a iletildi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-3">
                {new Date(ann.created_at).toLocaleDateString('tr-TR')}
                {(profile?.id === ann.author_id || role === 'hoca' || role === 'yonetici') && (
                  <button
                    onClick={() => handleDelete(ann.id, ann.author_id)}
                    className="text-ink-3 hover:text-danger transition p-1"
                    title="Duyuruyu sil"
                    aria-label="Duyuruyu sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-ink">
                {ann.title}
              </h2>
              <p className="text-sm text-ink-2 mt-2 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-ink-3 border-t border-line pt-3">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>
                  {ann.author?.full_name || 'Grup üyesi'}
                </span>
                {ann.author && <YetkiRozeti yetki={ann.author.yetki} />}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* YENİ DUYURU MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/80">
          <div className="bg-surface border border-line rounded-lg max-w-lg w-full p-6 space-y-5">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-semibold text-ink">
                Yeni duyuru paylaşımı
              </h2>
              <p className="text-sm text-ink-3 mt-1">
                Öncelik seçiminiz Telegram bildirim davranışını belirler.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-ink font-semibold mb-2">
                  Öncelik ve kategori *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'toplanti', label: 'Toplantı', desc: 'Telegram gruba bildirilir' },
                    { value: 'acil', label: 'Acil duyuru', desc: 'Telegram gruba anında' },
                    { value: 'soru_yardim', label: 'Soru / yardım', desc: 'Portal içi akış' },
                    { value: 'kaynak_paylasimi', label: 'Kaynak paylaşımı', desc: 'Portal içi akış' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`p-3 rounded-md border cursor-pointer flex flex-col justify-between ${
                        priority === opt.value
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-sunken text-ink-2 border-line'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={opt.value}
                        checked={priority === opt.value}
                        onChange={() => setPriority(opt.value as AnnouncementPriority)}
                        className="sr-only"
                      />
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-xs mt-1 text-ink-3">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">
                  Duyuru başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2026 Güz dönemi VASP kota paylaşımı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">
                  Duyuru içeriği *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detaylı bilgi, tarih veya talimatlar..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Yayınla ve bildir'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
