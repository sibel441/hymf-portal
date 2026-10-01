'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  History,
  Lock,
  MessageSquare,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_PROFILES, INITIAL_WORKSPACES } from '@/lib/mockData';
import { StudentWorkspace, WorkspaceFile, WorkspaceLog } from '@/types/database';
import { RoleBadge } from '@/components/RoleBadge';

export default function WorkspacePage() {
  const { profile, role } = useAuth();
  const [workspaces, setWorkspaces] = useState<StudentWorkspace[]>(INITIAL_WORKSPACES);

  // Öğrenci listesi (Araştırmacı rolündeki üyeler)
  const students = INITIAL_PROFILES.filter((p) => p.role === 'arastirmaci');

  // Yetki Kontrolü:
  // Hoca veya Yönetici ise tüm öğrencileri seçebilir.
  // Normal araştırmacı ise SADECE KENDİ çalışma alanını görebilir.
  const isSupervisorOrAdmin = role === 'hoca' || role === 'yonetici';

  // Seçili öğrenci kimliği
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (isSupervisorOrAdmin) {
      return students[0]?.id || 'user-student-1';
    }
    return profile?.id || 'user-student-1';
  });

  // Aktif çalışma alanı
  const activeWorkspace = workspaces.find((w) => w.student_id === selectedStudentId);

  // Düzenleme formları state'i
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [thesisTitle, setThesisTitle] = useState(activeWorkspace?.thesis_title || '');
  const [summary, setSummary] = useState(activeWorkspace?.summary || '');
  const [simulationNotes, setSimulationNotes] = useState(activeWorkspace?.simulation_notes || '');

  // Dosya Yükleme Modalı
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileNotes, setFileNotes] = useState('');
  const [fileSize, setFileSize] = useState('2.5 MB');

  // Hoca/Yönetici Not Bırakma
  const [feedbackNote, setFeedbackNote] = useState('');

  // Güvenlik Kuralı İhlali Kontrolü (URL kurcalama koruması)
  if (!isSupervisorOrAdmin && profile?.id !== selectedStudentId) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-red-800 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-full bg-red-950 border border-red-700 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white font-serif">
          Erişim Engellendi (403 - Yetkisiz Erişim)
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          HYMF Gizlilik Politikası gereğince, diğer araştırmacıların kişisel çalışma alanlarını ve tez verilerini görüntüleme yetkiniz bulunmamaktadır.
        </p>
        <button
          onClick={() => setSelectedStudentId(profile?.id || 'user-student-1')}
          className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Kendi Çalışma Alanıma Dön
        </button>
      </div>
    );
  }

  // Notları Kaydetme ve Log Ekleme
  const handleSaveNotes = () => {
    if (!activeWorkspace) return;

    const actionText = `${profile?.full_name} (${profile?.academic_title}) çalışma alanı notlarını güncelledi.`;

    const newLog: WorkspaceLog = {
      id: `log-${Date.now()}`,
      workspace_id: activeWorkspace.id,
      actor_id: profile?.id || 'demo-actor',
      action: actionText,
      created_at: new Date().toISOString(),
      actor: profile || undefined,
    };

    const updated = workspaces.map((w) => {
      if (w.id === activeWorkspace.id) {
        return {
          ...w,
          thesis_title: thesisTitle,
          summary: summary,
          simulation_notes: simulationNotes,
          updated_at: new Date().toISOString(),
          logs: [newLog, ...(w.logs || [])],
        };
      }
      return w;
    });

    setWorkspaces(updated);
    setIsEditingNotes(false);
  };

  // Yeni Dosya / Simülasyon Verisi Ekleme
  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !activeWorkspace) return;

    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      workspace_id: activeWorkspace.id,
      file_name: fileName,
      file_url: 'https://example.com/download/' + encodeURIComponent(fileName),
      file_size: fileSize,
      uploaded_by: profile?.id || 'demo-user',
      notes: fileNotes || null,
      created_at: new Date().toISOString(),
      uploader: profile || undefined,
    };

    const newLog: WorkspaceLog = {
      id: `log-${Date.now()}`,
      workspace_id: activeWorkspace.id,
      actor_id: profile?.id || 'demo-actor',
      action: `${profile?.full_name} yeni dosya yükledi: ${fileName}`,
      created_at: new Date().toISOString(),
      actor: profile || undefined,
    };

    const updated = workspaces.map((w) => {
      if (w.id === activeWorkspace.id) {
        return {
          ...w,
          files: [newFile, ...(w.files || [])],
          logs: [newLog, ...(w.logs || [])],
          updated_at: new Date().toISOString(),
        };
      }
      return w;
    });

    setWorkspaces(updated);
    setIsFileModalOpen(false);
    setFileName('');
    setFileNotes('');
  };

  // Danışman Hoca / Yönetici Geri Bildirim Notu Bırakma
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim() || !activeWorkspace) return;

    const actionText = `${profile?.full_name} (${profile?.academic_title}) geri bildirim ekledi: "${feedbackNote}"`;

    const newLog: WorkspaceLog = {
      id: `log-${Date.now()}`,
      workspace_id: activeWorkspace.id,
      actor_id: profile?.id || 'demo-actor',
      action: actionText,
      created_at: new Date().toISOString(),
      actor: profile || undefined,
    };

    const updated = workspaces.map((w) => {
      if (w.id === activeWorkspace.id) {
        return {
          ...w,
          logs: [newLog, ...(w.logs || [])],
        };
      }
      return w;
    });

    setWorkspaces(updated);
    setFeedbackNote('');
  };

  return (
    <div className="space-y-8">
      {/* Üst Güvenlik ve RBAC Bildirim Başlığı */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>KORUMALI KİŞİSEL ÇALIŞMA ALANI (RBAC GİZLİ PANEL)</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yetki: {isSupervisorOrAdmin ? 'Tam İnceleme & Denetim' : 'Kişisel Erişim'}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Tez ve Simülasyon Çalışma Alanı
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Bu alan yalnızca öğrencinin kendisi, sorumlu hocalar ve 2 yetkili yönetici öğrenci tarafından görüntülenebilir. Grubun diğer üyeleri bu içeriğe erişemez.
        </p>
      </div>

      {/* Sorumlu Hoca & Yönetici İçin: Öğrenci Seçici */}
      {isSupervisorOrAdmin && (
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-slate-200">İncelenen Öğrencinin Çalışma Alanı:</span>
              <p className="text-[11px] text-slate-400">Hoca ve yönetici yetkinizle tüm öğrencilerin tez ilerlemelerini denetleyebilirsiniz.</p>
            </div>
          </div>

          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              const targetWs = workspaces.find((w) => w.student_id === e.target.value);
              if (targetWs) {
                setThesisTitle(targetWs.thesis_title);
                setSummary(targetWs.summary || '');
                setSimulationNotes(targetWs.simulation_notes || '');
              }
            }}
            className="px-3 py-2 bg-slate-950 border border-amber-600/50 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.academic_title})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Öğrenci Bilgileri ve Tez Özeti Kartı */}
      {activeWorkspace && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 shrink-0">
                <img
                  src={activeWorkspace.student?.avatar_url || ''}
                  alt={activeWorkspace.student?.full_name || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-serif">
                  {activeWorkspace.student?.full_name}
                </h2>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{activeWorkspace.student?.academic_title}</span>
                  <span>•</span>
                  <span>Danışman: <strong>{activeWorkspace.advisor}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFileModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Dosya / Veri Yükle</span>
              </button>

              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isEditingNotes ? 'Düzenlemeyi Kapat' : 'Notları Düzenle'}</span>
              </button>
            </div>
          </div>

          {/* Tez Başlığı & Simülasyon Notları */}
          {isEditingNotes ? (
            <div className="space-y-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tez Çalışması Başlığı</label>
                <input
                  type="text"
                  value={thesisTitle}
                  onChange={(e) => setThesisTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tez Araştırma Özeti</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Aktif Simülasyon ve Hesaplama Notları</label>
                <textarea
                  rows={3}
                  value={simulationNotes}
                  onChange={(e) => setSimulationNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Değişiklikleri Kaydet (Log Oluşturur)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-red-400 font-mono">Tez Konusu</span>
                <h3 className="text-sm font-bold text-white font-serif leading-snug">
                  {activeWorkspace.thesis_title}
                </h3>
                <p className="text-slate-300 mt-2 leading-relaxed">
                  {activeWorkspace.summary}
                </p>
              </div>

              {activeWorkspace.simulation_notes && (
                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                    Devam Eden Simülasyon Parametreleri & Cluster Durumu
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed font-mono text-[11px]">
                    {activeWorkspace.simulation_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dosyalar Bölümü */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Yüklenen Tez Taslakları ve Simülasyon Verileri</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {activeWorkspace.files?.length || 0} Dosya Depolandı
              </span>
            </div>

            <div className="space-y-2">
              {activeWorkspace.files && activeWorkspace.files.length > 0 ? (
                activeWorkspace.files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-xs font-semibold text-white font-mono">
                          {file.file_name}
                        </span>
                        {file.file_size && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                            {file.file_size}
                          </span>
                        )}
                      </div>
                      {file.notes && (
                        <p className="text-[11px] text-slate-400 pl-6">
                          {file.notes}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-500 pl-6 font-mono">
                        Yükleyen: {file.uploader?.full_name} • {new Date(file.created_at).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition self-start sm:self-center"
                    >
                      <Download className="w-3.5 h-3.5 text-red-400" />
                      <span>İndir</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  Henüz dosya yüklenmedi.
                </div>
              )}
            </div>
          </div>

          {/* Danışman Hoca Geri Bildirim Notu Bırakma Kutusu */}
          {isSupervisorOrAdmin && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Danışman / Yönetici Geri Bildirimi Bırak</span>
              </h3>
              <form onSubmit={handleAddFeedback} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Örn: 'Bant yapısında Fermi seviyesi kaymasını düzeltip tekrar çalıştır.'"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition shrink-0"
                >
                  Notu İlet (Logla)
                </button>
              </form>
            </div>
          )}

          {/* PDF Kuralı: Sürüm Kontrolü ve Denetim İzi (Audit Log) Tablosu */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>Sürüm Kontrolü ve İşlem Geçmişi (Audit Trail)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Bu alanda öğrenci, hoca veya yöneticiler tarafından yapılan her güncelleme ve dosya hareketi kayıt altına alınır.
            </p>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tarih & Saat</th>
                    <th className="py-2.5 px-4 font-semibold">İşlem Detayı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {activeWorkspace.logs?.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-2.5 px-4 text-slate-200 font-sans">
                        {log.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DOSYA YÜKLEME MODALI */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-400" />
                Gizli Çalışma Alanına Dosya Yükle
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Lütfen grup isimlendirme formatına uyunuz (<code>Yil_Ay_TEZ_Konu_AdSoyad.uzanti</code>).
              </p>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dosya Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2026_10_TEZ_FononDispersiyon_BurakYilmaz.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dosya Notu / Simülasyon Çıktısı Açıklaması
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: 2x2 süperhücre ile Phono3py hesaplaması termal iletkenlik grafiği."
                  value={fileNotes}
                  onChange={(e) => setFileNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFileModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md"
                >
                  Yükle ve Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
