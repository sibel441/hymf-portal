'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  Mail,
  Search,
  Users,
  X,
} from 'lucide-react';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { Profile } from '@/types/database';
import { RoleBadge } from '@/components/RoleBadge';

export default function MembersPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  const filteredMembers = INITIAL_PROFILES.filter((member) => {
    const matchesRole =
      selectedRole === 'all' ||
      (selectedRole === 'hoca' && member.role === 'hoca') ||
      (selectedRole === 'yonetici' && member.role === 'yonetici') ||
      (selectedRole === 'arastirmaci' && member.role === 'arastirmaci');

    const matchesSearch =
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.research_topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.academic_title ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
          <Users className="w-4 h-4" />
          <span>AKADEMİK KADRO VE ARAŞTIRMACILAR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Üye Vitrini (Directory)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl">
          Hesaplamalı Yoğun Madde Fiziği grubumuzun öğretim üyeleri, araştırmacıları ve lisansüstü tez öğrencileri.
        </p>
      </div>

      {/* Arama ve Filtre Çubuğu */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tüm Üyeler' },
            { id: 'hoca', label: 'Sorumlu Hocalar' },
            { id: 'yonetici', label: 'Yöneticiler' },
            { id: 'arastirmaci', label: 'Y.L. / Doktora Araştırmacıları' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedRole === tab.id
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="İsim veya konu ara (örn: VASP, DFT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Üye Kartları Grid'i */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-slate-700 group-hover:border-red-500 transition overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={member.avatar_url || ''}
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <RoleBadge role={member.role} />
                  <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition font-serif">
                    {member.full_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {member.academic_title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {member.department}
                  </p>
                </div>
              </div>

              {/* Araştırma Konuları */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                  Çalışma Konuları
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.research_topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-red-400 group-hover:text-red-300">
              <span className="text-[11px] font-semibold">Detaylı Profili Görüntüle</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Profil Detay Modalı */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-red-500 overflow-hidden bg-slate-800 shrink-0">
                <img
                  src={selectedMember.avatar_url || ''}
                  alt={selectedMember.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <RoleBadge role={selectedMember.role} />
                <h2 className="text-lg font-bold text-white font-serif">
                  {selectedMember.full_name}
                </h2>
                <p className="text-xs text-slate-400">{selectedMember.academic_title}</p>
                <p className="text-xs text-slate-500 font-mono">{selectedMember.department}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wide block mb-1">
                  Araştırma ve Uzmanlık Alanları
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.research_topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wide block">
                  İletişim ve Akademik Kimlikler
                </span>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-red-400" />
                  <a href={`mailto:${selectedMember.email}`} className="hover:underline">
                    {selectedMember.email}
                  </a>
                </div>
                {selectedMember.orcid && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="font-mono text-emerald-400 font-bold">ORCID:</span>
                    <a
                      href={`https://orcid.org/${selectedMember.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>{selectedMember.orcid}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                )}
                {selectedMember.scholar_url && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <a
                      href={selectedMember.scholar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>Google Scholar Profili</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
