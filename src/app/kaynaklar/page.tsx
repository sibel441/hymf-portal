'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Code,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Plus,
  Search,
  Tag,
  Trash2,
  UploadCloud,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_RESOURCES } from '@/lib/mockData';
import { Resource, ResourceCategory } from '@/types/database';
import { CodeBlock } from '@/components/CodeBlock';
import { RoleBadge } from '@/components/RoleBadge';

export default function ResourcesPage() {
  const { profile, role } = useAuth();
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('kod_script');
  const [language, setLanguage] = useState('python');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Tüm benzersiz tag'ler
  const allTags = Array.from(new Set(resources.flatMap((r) => r.tags)));

  const filteredResources = resources.filter((res) => {
    const matchesCategory =
      selectedCategory === 'all' || res.category === selectedCategory;

    const matchesTag = !selectedTag || res.tags.includes(selectedTag);

    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesTag && matchesSearch;
  });

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newResource: Resource = {
      id: `res-${Date.now()}`,
      title,
      description,
      category,
      language,
      code_snippet: codeSnippet || null,
      external_url: externalUrl || null,
      tags: tagsArray.length > 0 ? tagsArray : ['HYMF'],
      uploader_id: profile?.id || 'demo-user',
      created_at: new Date().toISOString(),
      uploader: profile || undefined,
    };

    setResources([newResource, ...resources]);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setCodeSnippet('');
    setExternalUrl('');
    setTagsInput('');
  };

  const handleDelete = (id: string, uploaderId: string) => {
    const canDelete = profile?.id === uploaderId || role === 'hoca' || role === 'yonetici';
    if (!canDelete) {
      alert('Yalnızca kendi yüklediğiniz kaynakları silebilirsiniz.');
      return;
    }

    if (confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
      setResources(resources.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Başlık ve Buton */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>ORTAK AKADEMİK VE KOD HAVUZU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Önerilen Kaynaklar & Script Havuzu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Kitaplar, makale PDF arşivi, faydalı veritabanı bağlantıları ve DFT / VASP / Python hesaplama scriptleri.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kaynak / Script Ekle</span>
        </button>
      </div>

      {/* PDF Kuralı: Dosya İsimlendirme Standardı Kutusu */}
      <div className="p-4 rounded-xl bg-slate-900 border border-amber-800/60 flex items-start gap-3 text-xs text-amber-200/90 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold block">
            Grup Kuralı: Dosya İsimlendirme Standardı (Standart Format)
          </strong>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Kütüphanenin düzeni için yüklenen PDF veya script dosyalarında şu format zorunludur:{' '}
            <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">
              Yil_Ay_Kategori_Konu_EkleyenKisi.uzanti
            </code>{' '}
            (Örn: <code>2026_10_SCRIPT_VaspBandPlot_CanOzdemir.py</code> veya <code>2026_10_KITAP_MartinDFT_AliKemal.pdf</code>)
          </p>
        </div>
      </div>

      {/* Filtreler ve Arama */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Kategori Butonları */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tüm Kaynaklar' },
            { id: 'kod_script', label: '💻 Kod ve Script Havuzu' },
            { id: 'kitap_makale', label: '📑 Kitaplar & Makaleler' },
            { id: 'faydali_link', label: '🌐 Faydalı Linkler & Veri Tabanları' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Arama Kutusu */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Başlık, script veya tag ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Etiketler (Tags) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 flex items-center gap-1 text-[11px] font-mono">
            <Tag className="w-3 h-3" />
            Etiketler:
          </span>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800 cursor-pointer"
            >
              Filtreyi Kaldır (✕)
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer border ${
                selectedTag === tag
                  ? 'bg-red-800 text-white border-red-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Kaynak Kartları */}
      <div className="space-y-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                {res.category === 'kod_script' && (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1 font-mono">
                    <Code className="w-3 h-3" />
                    {res.language.toUpperCase()} Script
                  </span>
                )}
                {res.category === 'kitap_makale' && (
                  <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Kitap / Makale PDF
                  </span>
                )}
                {res.category === 'faydali_link' && (
                  <span className="px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Veri Tabanı & Portal
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>{new Date(res.created_at).toLocaleDateString('tr-TR')}</span>
                {(profile?.id === res.uploader_id || role === 'hoca' || role === 'yonetici') && (
                  <button
                    onClick={() => handleDelete(res.id, res.uploader_id)}
                    className="text-slate-500 hover:text-red-400 transition p-1"
                    title="Kaynağı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-white font-serif leading-snug">
                {res.title}
              </h2>
              {res.description && (
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {res.description}
                </p>
              )}
            </div>

            {/* Kod Bloğu İçeriği */}
            {res.code_snippet && (
              <CodeBlock
                code={res.code_snippet}
                language={res.language}
                title={`${res.title} (${res.language})`}
              />
            )}

            {/* Dış Link veya Dosya */}
            {res.external_url && (
              <div className="pt-2">
                <a
                  href={res.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bağlantıyı Aç: {res.external_url}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            )}

            {res.file_url && (
              <div className="pt-2">
                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  <span>PDF Dokümanını İndir</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            )}

            {/* Alt Kısım: Tag'ler ve Yükleyen */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {res.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-500" />
                <span>Ekleyen: <strong>{res.uploader?.full_name || 'Grup Üyesi'}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* YENİ KAYNAK EKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" />
                Ortak Havuzuna Kaynak / Script Ekle
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Lütfen grup dosya isimlendirme kuralına (<code>Yil_Ay_Kategori_Konu_Ekleyen.uzanti</code>) dikkat ediniz.
              </p>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kategori *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kod_script', label: '💻 Kod / Script' },
                    { id: 'kitap_makale', label: '📑 Kitap / Makale' },
                    { id: 'faydali_link', label: '🌐 Link / Veri Tabanı' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id as ResourceCategory)}
                      className={`p-2 rounded-lg border text-center font-semibold transition cursor-pointer ${
                        category === c.id
                          ? 'bg-red-800 text-white border-red-700'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Başlık *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: VASP vasprun.xml DOS Çizici"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Açıklama / Notlar</label>
                <textarea
                  rows={2}
                  placeholder="Kaynağın kullanım amacı veya açıklaması..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
                />
              </div>

              {category === 'kod_script' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Yazılım Dili</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                      >
                        <option value="python">Python</option>
                        <option value="bash">Bash / Slurm</option>
                        <option value="fortran">Fortran</option>
                        <option value="matlab">MATLAB</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Kod / Script İçeriği *
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="#!/usr/bin/env python3&#10;# Betik kodunuzu buraya yapıştırın..."
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                </>
              )}

              {category === 'faydali_link' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Web Bağlantısı (URL) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://next-gen.materialsproject.org"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Etiketler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  placeholder="VASP, DFT, Pymatgen, Bant Yapisi"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
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
                  Kaydet ve Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
