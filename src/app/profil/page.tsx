'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  GraduationCap,
  Mail,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/RoleBadge';

export default function ProfilePage() {
  const { profile, role, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [academicTitle, setAcademicTitle] = useState(profile?.academic_title || '');
  const [department, setDepartment] = useState(profile?.department || 'Fizik Anabilim Dalı');
  const [scholarUrl, setScholarUrl] = useState(profile?.scholar_url || '');
  const [orcid, setOrcid] = useState(profile?.orcid || '');
  const [topicsInput, setTopicsInput] = useState(profile?.research_topics.join(', ') || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const topicsArray = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateProfile({
      full_name: fullName,
      academic_title: academicTitle,
      department,
      scholar_url: scholarUrl || null,
      orcid: orcid || null,
      research_topics: topicsArray,
      avatar_url: avatarUrl || null,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!profile) {
    return (
      <div className="text-center py-16 text-slate-400">
        Lütfen önce giriş yapınız.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Üst Başlık */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
          <User className="w-4 h-4" />
          <span>KİŞİSEL AKADEMİK PROFİL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Akademik Profilim
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Üye vitrininde ve portal içi paylaşımlarınızda görünen bilgilerinizi güncelleyin.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profil bilgileriniz başarıyla güncellendi!</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Kullanıcı Özeti */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-20 h-20 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 shrink-0">
            <img
              src={avatarUrl || profile.avatar_url || ''}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <RoleBadge role={role} />
            <h2 className="text-lg font-bold text-white font-serif">{profile.full_name}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Düzenleme Formu */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ad Soyad *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Akademik Unvan</label>
              <input
                type="text"
                value={academicTitle}
                onChange={(e) => setAcademicTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Anabilim Dalı</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ORCID Kimliği</label>
              <input
                type="text"
                placeholder="0000-0002-1825-0097"
                value={orcid}
                onChange={(e) => setOrcid(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Google Scholar URL</label>
              <input
                type="url"
                placeholder="https://scholar.google.com/citations?user=..."
                value={scholarUrl}
                onChange={(e) => setScholarUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Profil Fotoğrafı URL'i
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Araştırma Konuları (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
