'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Plus,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_COURSES } from '@/lib/mockData';
import { Course, CourseMaterial } from '@/types/database';
import { RoleBadge } from '@/components/RoleBadge';

export default function CoursesPage() {
  const { profile, role } = useAuth();
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course>(INITIAL_COURSES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [weekNumber, setWeekNumber] = useState(1);
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // Yetki Kontrolü: Yalnızca Sorumlu Hoca ve 2 Yönetici Öğrenci ders materyali ekleyebilir
  const canUploadMaterial = role === 'hoca' || role === 'yonetici';

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    const newMaterial: CourseMaterial = {
      id: `mat-${Date.now()}`,
      course_id: selectedCourse.id,
      week_number: Number(weekNumber),
      title: matTitle,
      description: matDesc || null,
      file_url: fileUrl || 'https://example.com/material.pdf',
      uploader_id: profile?.id || 'demo-user',
      created_at: new Date().toISOString(),
      uploader: profile || undefined,
    };

    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourse.id) {
        return {
          ...c,
          materials: [...(c.materials || []), newMaterial].sort((a, b) => a.week_number - b.week_number),
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find((c) => c.id === selectedCourse.id)!);
    setIsModalOpen(false);
    setMatTitle('');
    setMatDesc('');
    setFileUrl('');
  };

  return (
    <div className="space-y-8">
      {/* Üst Başlık ve Yetki Bildirimi */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>LİSANSÜSTÜ AKADEMİK DERS PORTALI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Lisansüstü Dersler & Materyaller
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Öğretim üyelerimizin verdiği yüksek lisans ve doktora derslerinin haftalık slaytları, syllabus belgeleri ve ek kaynakları.
          </p>
        </div>

        {canUploadMaterial ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ders Materyali Ekle</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Materyal ekleme yetkisi yalnızca hoca ve yöneticilerdedir.</span>
          </div>
        )}
      </div>

      {/* Ders Seçim Sekmeleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedCourse.id === course.id
                ? 'bg-slate-900 border-red-600 shadow-md ring-1 ring-red-600'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-red-400 font-bold">
                  {course.code}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{course.semester}</span>
              </div>
              <h2 className="text-base font-bold text-white font-serif">
                {course.name}
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Dersi Veren: <strong className="text-slate-200">{course.instructor?.full_name}</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{course.materials?.length || 0} Hafta Materyali</span>
              <span className="text-red-400 font-semibold text-[11px]">
                {selectedCourse.id === course.id ? 'Seçili Ders' : 'Görüntüle →'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Seçilen Ders Detayı ve Haftalık Materyaller */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs text-red-400 font-bold">[{selectedCourse.code}]</span>
              <h2 className="text-xl font-bold text-white font-serif">
                {selectedCourse.name} - {selectedCourse.instructor?.full_name}
              </h2>
            </div>
            <span className="px-3 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300">
              {selectedCourse.semester}
            </span>
          </div>

          {selectedCourse.syllabus && (
            <div className="mt-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
              <strong className="text-slate-200 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Ders İzlencesi (Syllabus):
              </strong>
              <p className="text-slate-400 leading-relaxed">{selectedCourse.syllabus}</p>
            </div>
          )}
        </div>

        {/* Hafta Hafta Materyaller Listesi */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Haftalık Ders Notları & Slaytlar
          </h3>

          {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
            selectedCourse.materials.map((mat) => (
              <div
                key={mat.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold font-mono border border-red-800/80">
                      Hafta {mat.week_number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      {mat.title}
                    </h4>
                  </div>
                  {mat.description && (
                    <p className="text-xs text-slate-400 leading-snug">
                      {mat.description}
                    </p>
                  )}
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ekleyen: {mat.uploader?.full_name} • {new Date(mat.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition shrink-0 self-start sm:self-center"
                >
                  <Download className="w-3.5 h-3.5 text-red-400" />
                  <span>Slayt / Not İndir (PDF)</span>
                </a>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              Bu ders için henüz haftalık materyal yüklenmemiştir.
            </div>
          )}
        </div>
      </div>

      {/* DERS MATERYALİ YÜKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" />
                Ders Materyali Ekle ({selectedCourse.code})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Yalnızca sorumlu hoca veya hoca adına asiste eden yönetici öğrenci ekleyebilir.
              </p>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hafta No *</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    required
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Ders Konusu / Başlık *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Bloch Teoremi ve Bant Yapısı"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Açıklama / Kapsam</label>
                <textarea
                  rows={2}
                  placeholder="Bu haftanın slayt içeriği veya okuma önerisi..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Materyal Dosya Bağlantısı (PDF Dosyası) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2026_10_DERS_FIZ601_Hafta4_HocaAdi.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Format standardı: <code>Yil_Ay_DERS_[DersKodu]_[Hafta]_[Ekleyen].pdf</code>
                </span>
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
                  Materyali Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
