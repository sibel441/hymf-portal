'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Plus,
  Send,
  Share2,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/mockData';
import { Announcement, AnnouncementPriority } from '@/types/database';
import { RoleBadge } from '@/components/RoleBadge';

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
      {/* Üst Başlık ve Aksiyon */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
            <Bell className="w-4 h-4" />
            <span>TOPLULUK AKIŞI VE BİLDİRİMLER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Duyuru Panosu & Telegram Bildirimleri
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Tüm grup üyelerinin ortak akışı. Acil ve toplantı duyuruları doğrudan HYMF Telegram grubuna düşer.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Duyuru Yap</span>
        </button>
      </div>

      {/* Geri Bildirim Bildirimi */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Öncelik Filtreleme Butonları */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Tüm Duyurular' },
          { id: 'acil', label: '🚨 Acil' },
          { id: 'toplanti', label: '📅 Toplantılar' },
          { id: 'soru_yardim', label: '💬 Soru / Yardım' },
          { id: 'kaynak_paylasimi', label: '📚 Kaynak Paylaşımı' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterPriority(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterPriority === tab.id
                ? 'bg-red-800 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Duyuru Kartları */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 transition hover:border-slate-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                {ann.priority === 'acil' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800 animate-pulse">
                    🚨 Acil Duyuru (Telegram Anlık)
                  </span>
                )}
                {ann.priority === 'toplanti' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    <Calendar className="w-3 h-3" />
                    📅 Toplantı (Telegram Anlık)
                  </span>
                )}
                {ann.priority === 'soru_yardim' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <HelpCircle className="w-3 h-3" />
                    💬 Soru & Destek (Portal)
                  </span>
                )}
                {ann.priority === 'kaynak_paylasimi' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <Share2 className="w-3 h-3" />
                    📚 Kaynak Paylaşımı
                  </span>
                )}

                {ann.telegram_sent && (
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    Telegram'a İletildi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(ann.created_at).toLocaleString('tr-TR')}
                </span>

                {/* Silme Butonu (Yetki Kontrollü) */}
                {(profile?.id === ann.author_id || role === 'hoca' || role === 'yonetici') && (
                  <button
                    onClick={() => handleDelete(ann.id, ann.author_id)}
                    className="text-slate-500 hover:text-red-400 transition p-1"
                    title="Duyuruyu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif leading-snug">
                {ann.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekleyen: <strong>{ann.author?.full_name || 'Grup Üyesi'}</strong></span>
                {ann.author && <RoleBadge role={ann.author.role} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* YENİ DUYURU MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Send className="w-4 h-4 text-red-400" />
                Yeni Duyuru Paylaşımı
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Öncelik seçiminiz Telegram bildirim davranışını doğrudan belirler.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Öncelik ve Kategori Seçimi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer flex flex-col justify-between ${
                      priority === 'toplanti'
                        ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value="toplanti"
                      checked={priority === 'toplanti'}
                      onChange={() => setPriority('toplanti')}
                      className="sr-only"
                    />
                    <span className="font-bold flex items-center gap-1">📅 Toplantı</span>
                    <span className="text-[10px] text-amber-400/90 mt-1">Telegram Gruba Bildirilir</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer flex flex-col justify-between ${
                      priority === 'acil'
                        ? 'bg-red-950/40 border-red-600 text-red-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value="acil"
                      checked={priority === 'acil'}
                      onChange={() => setPriority('acil')}
                      className="sr-only"
                    />
                    <span className="font-bold flex items-center gap-1">🚨 Acil Duyuru</span>
                    <span className="text-[10px] text-red-400/90 mt-1">Telegram Gruba Anında Bildirim</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer flex flex-col justify-between ${
                      priority === 'soru_yardim'
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value="soru_yardim"
                      checked={priority === 'soru_yardim'}
                      onChange={() => setPriority('soru_yardim')}
                      className="sr-only"
                    />
                    <span className="font-bold">💬 Soru / Yardım</span>
                    <span className="text-[10px] text-slate-500 mt-1">Sadece portal içi akış</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer flex flex-col justify-between ${
                      priority === 'kaynak_paylasimi'
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value="kaynak_paylasimi"
                      checked={priority === 'kaynak_paylasimi'}
                      onChange={() => setPriority('kaynak_paylasimi')}
                      className="sr-only"
                    />
                    <span className="font-bold">📚 Kaynak Paylaşımı</span>
                    <span className="text-[10px] text-slate-500 mt-1">Sadece portal içi akış</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Duyuru Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2026 Güz Dönemi VASP Kota Paylaşımı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Duyuru İçeriği *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detaylı bilgi, tarih veya talimatlar..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Yayınla ve Bildir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
