'use client';

import React, { useState } from 'react';
import {
  Download,
  FileText,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_MEETINGS } from '@/lib/mockData';
import { Meeting } from '@/types/database';
import {
  SayfaBasligi,
  OrnekVeriNotu,
  Panel,
  Button,
  Rozet,
} from '@/components/ui';

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
      <SayfaBasligi
        baslik="Toplantılar"
        aciklama="Haftalık grup toplantısı notları, seminer sunumları, TRUBA değerlendirmeleri ve alınan kararlar."
        eylemler={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Toplantı notu ekle</span>
          </Button>
        }
      />

      <OrnekVeriNotu />

      {/* Toplantı Listesi */}
      <div className="space-y-4">
        {meetings.map((m) => (
          <Panel key={m.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Rozet tone="bilgi">
                {new Date(m.meeting_date).toLocaleDateString('tr-TR')}
              </Rozet>

              <div className="flex items-center gap-2 text-sm text-ink-3">
                Kayıt: {new Date(m.created_at).toLocaleDateString('tr-TR')}
                {(profile?.id === m.creator_id || role === 'hoca' || role === 'yonetici') && (
                  <button
                    onClick={() => handleDelete(m.id, m.creator_id)}
                    className="text-ink-3 hover:text-danger transition p-1"
                    title="Sil"
                    aria-label="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-ink">
                {m.title}
              </h2>
              {m.notes && (
                <p className="text-sm text-ink-2 mt-2 leading-relaxed whitespace-pre-line">
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
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sunken hover:bg-sunken/80 text-ink text-sm font-medium transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Sunum dosyasını indir</span>
                  <Download className="w-3.5 h-3.5 text-ink-3" />
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-line flex items-center justify-between text-sm text-ink-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{m.creator?.full_name || 'Grup üyesi'}</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* YENİ TOPLANTI EKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/80">
          <div className="bg-surface border border-line rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-semibold text-ink">
                Toplantı notu / sunumu ekle
              </h2>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-4 text-sm">
              <div>
                <label className="block text-ink font-semibold mb-1">Toplantı başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2D manyetik malzemeler semineri"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Toplantı tarihi ve saati *</label>
                <input
                  type="datetime-local"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Toplantı notları / alınan kararlar</label>
                <textarea
                  rows={4}
                  placeholder="Gündem maddeleri, tartışılan konular veya alınan kararlar..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Sunum dokümanı dosya adı / URL</label>
                <input
                  type="text"
                  placeholder="2026_10_TOPLANTI_Sunum_EkleyenKisi.pdf"
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
