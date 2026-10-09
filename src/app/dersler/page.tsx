'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Plus,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_COURSES } from '@/lib/mockData';
import { Course, CourseMaterial } from '@/types/database';
import {
  SayfaBasligi,
  OrnekVeriNotu,
  Panel,
  Button,
} from '@/components/ui';

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
      <SayfaBasligi
        baslik="Lisansüstü dersler"
        aciklama="Yüksek lisans ve doktora derslerinin haftalık slaytları, syllabus belgeleri ve ek kaynakları."
        eylemler={
          canUploadMaterial ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Ders materyali ekle</span>
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sunken border border-line text-sm text-ink-3">
              <ShieldAlert className="w-4 h-4" />
              <span>Materyal ekleme yetkisi yalnızca hoca ve yöneticilerdedir.</span>
            </div>
          )
        }
      />

      <OrnekVeriNotu />

      {/* Ders Seçim Sekmeleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className={`p-5 rounded-lg border-2 text-left transition cursor-pointer flex flex-col justify-between ${
              selectedCourse.id === course.id
                ? 'bg-surface border-primary'
                : 'bg-surface border-line hover:border-line-strong'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-mono px-2 py-0.5 rounded bg-sunken text-ink font-semibold">
                  {course.code}
                </span>
                <span className="text-ink-3 font-mono text-xs">{course.semester}</span>
              </div>
              <h2 className="text-lg font-semibold text-ink">
                {course.name}
              </h2>
              <div className="text-sm text-ink-3 mt-2 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Dersi veren: {course.instructor?.full_name}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-sm text-ink-3">
              <span>{course.materials?.length || 0} hafta materyali</span>
              <span className="text-primary font-medium text-sm">
                {selectedCourse.id === course.id ? 'Seçili' : 'Görüntüle'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Seçilen Ders Detayı ve Haftalık Materyaller */}
      <Panel className="space-y-6">
        <div className="border-b border-line pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <span className="font-mono text-sm text-ink-3">{selectedCourse.code}</span>
              <h2 className="text-2xl font-semibold text-ink mt-1">
                {selectedCourse.name}
              </h2>
              <p className="text-sm text-ink-2 mt-1">
                Dersi veren: {selectedCourse.instructor?.full_name}
              </p>
            </div>
            <span className="px-3 py-1 rounded-md bg-sunken text-xs font-mono text-ink-3">
              {selectedCourse.semester}
            </span>
          </div>

          {selectedCourse.syllabus && (
            <div className="mt-4 p-4 rounded-md bg-sunken border border-line text-sm text-ink space-y-2">
              <strong className="text-ink font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Ders izlencesi (syllabus)
              </strong>
              <p className="text-ink-2 leading-relaxed">{selectedCourse.syllabus}</p>
            </div>
          )}
        </div>

        {/* Hafta Hafta Materyaller Listesi */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">
            Haftalık ders notları ve slaytlar
          </h3>

          {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
            <div className="space-y-2 border-t border-line pt-3">
              {selectedCourse.materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-md bg-sunken border border-line hover:border-line-strong transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium font-mono bg-warn-soft text-warn">
                        Hafta {mat.week_number}
                      </span>
                      <h4 className="text-sm font-semibold text-ink">
                        {mat.title}
                      </h4>
                    </div>
                    {mat.description && (
                      <p className="text-sm text-ink-2 leading-snug">
                        {mat.description}
                      </p>
                    )}
                    <div className="text-xs text-ink-3">
                      Ekleyen: {mat.uploader?.full_name} • {new Date(mat.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  <a
                    href={mat.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-on-primary text-sm font-medium transition shrink-0 self-start sm:self-center hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    <span>Slayt / not indir</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-ink-3 bg-sunken rounded-md border border-dashed border-line">
              Bu ders için henüz haftalık materyal yüklenmemiştir.
            </div>
          )}
        </div>
      </Panel>

      {/* DERS MATERYALİ YÜKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/80">
          <div className="bg-surface border border-line rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-semibold text-ink">
                Ders materyali ekle ({selectedCourse.code})
              </h2>
              <p className="text-sm text-ink-3 mt-1">
                Yalnızca sorumlu hoca veya hoca adına asiste eden yönetici ekleyebilir.
              </p>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-ink font-semibold mb-1">Hafta no *</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    required
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-ink font-semibold mb-1">Ders konusu / başlık *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Bloch teoremi ve bant yapısı"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Açıklama / kapsam</label>
                <textarea
                  rows={2}
                  placeholder="Bu haftanın slayt içeriği veya okuma önerisi..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">
                  Materyal dosya bağlantısı (PDF dosyası) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2026_10_DERS_FIZ601_Hafta4_HocaAdi.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-sunken border border-control rounded-md text-ink placeholder-ink-3 focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30"
                />
                <span className="text-xs text-ink-3 mt-1 block">
                  Format standardı: <code className="font-mono">Yil_Ay_DERS_[DersKodu]_[Hafta]_[Ekleyen].pdf</code>
                </span>
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
                  Materyali kaydet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
