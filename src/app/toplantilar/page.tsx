'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_MEETINGS } from '@/lib/mockData';
import { Meeting } from '@/types/database';

export default function MeetingsPage() {
  const { profile, role } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meetingDate) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title,
      meeting_date: new Date(meetingDate).toISOString(),
      notes: notes || null,
      presentation_url: presentationUrl || null,
      creator_id: profile?.id || 'demo-user',
      created_at: new Date().toISOString(),
      creator: profile || undefined,
    };

    setMeetings([newMeeting, ...meetings]);
    setIsModalOpen(false);
    setTitle('');
    setMeetingDate('');
    setNotes('');
    setPresentationUrl('');
  };

  const handleDelete = (id: string, creatorId: string) => {
    const canDelete = profile?.id === creatorId || role === 'hoca' || role === 'yonetici';
    if (!canDelete) {
      alert('Yalnızca kendi eklediğiniz toplantıyı veya hoca/yönetici iseniz silebilirsiniz.');
      return;
    }

    if (confirm('Bu toplantı kaydını silmek istediğinize emin misiniz?')) {
      setMeetings(meetings.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Üst Başlık ve Ekleme Butonu */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span>GRUP SEMİNERLERİ VE TOPLANTI ARŞİVİ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Toplantılar & Sunum Dokümanları
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Haftalık grup toplantısı notları, seminer sunumları, TRUBA kota değerlendirmeleri ve alınan aksiyon kararları.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Toplantı Notu / Sunum Ekle</span>
        </button>
      </div>

      {/* Toplantı Listesi */}
      <div className="space-y-4">
        {meetings.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Toplantı Tarihi: {new Date(m.meeting_date).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Kayıt: {new Date(m.created_at).toLocaleDateString('tr-TR')}</span>
                {(profile?.id === m.creator_id || role === 'hoca' || role === 'yonetici') && (
                  <button
                    onClick={() => handleDelete(m.id, m.creator_id)}
                    className="text-slate-500 hover:text-red-400 transition p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif leading-snug">
                {m.title}
              </h2>
              {m.notes && (
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                  {m.notes}
                </p>
              )}
            </div>

            {m.presentation_url && (
              <div className="pt-2">
                <a
                  href={m.presentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  <span>Sunum Dosyasını İndir (PDF)</span>
                  <Download className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekleyen: <strong>{m.creator?.full_name || 'Grup Üyesi'}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* YENİ TOPLANTI EKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" />
                Toplantı Notu / Sunumu Ekle
              </h2>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Toplantı Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2D Manyetik Malzemeler Semineri ve Tartışma"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Toplantı Tarihi ve Saati *</label>
                <input
                  type="datetime-local"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Toplantı Notları / Alınan Kararlar</label>
                <textarea
                  rows={4}
                  placeholder="Gündem maddeleri, tartışılan konular veya alınan kararlar..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sunum Dokümanı Dosya Adı / URL</label>
                <input
                  type="text"
                  placeholder="2026_10_TOPLANTI_Sunum_EkleyenKisi.pdf"
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
