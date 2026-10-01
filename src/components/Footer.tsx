import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Kolon 1: Grup Tanıtımı */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-slate-100">Ψ HYMF</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">Ankara Üniversitesi</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Hesaplamalı Yoğun Madde Fiziği Araştırma Grubu; yoğunluk fonksiyoneli teorisi (DFT), moleküler dinamik ve elektronik yapı hesaplamaları üzerine odaklanan lisansüstü araştırma merkezidir.
            </p>
          </div>

          {/* Kolon 2: Hızlı Bağlantılar */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Hızlı Erişim</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/kilavuzlar" className="hover:text-slate-200 transition">TRUBA & VASP Kılavuzları</Link>
              </li>
              <li>
                <Link href="/formlar" className="hover:text-slate-200 transition">Enstitü Resmi Formları</Link>
              </li>
              <li>
                <Link href="/kaynaklar" className="hover:text-slate-200 transition">Kod ve Script Havuzu</Link>
              </li>
              <li>
                <Link href="/dersler" className="hover:text-slate-200 transition">Lisansüstü Ders Materyalleri</Link>
              </li>
            </ul>
          </div>

          {/* Kolon 3: Resmi Kurumlar */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Resmi Bağlantılar</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a
                  href="http://hymf.ankara.edu.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-slate-200 transition"
                >
                  <span>HYMF Web Sitesi</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://fenbilimleri.ankara.edu.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-slate-200 transition"
                >
                  <span>Fen Bilimleri Enstitüsü</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://truba.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-slate-200 transition"
                >
                  <span>TÜBİTAK ULAKBİM TRUBA</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Kolon 4: Güvenlik ve RBAC */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Gizlilik & Güvenlik</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bu portal HYMF araştırma grubu üyelerine özel, rol tabanlı erişim kontrolü (RBAC) ile korunmaktadır. Kişisel tez ve simülasyon verileri şifrelenmiş özel alanlarda tutulur.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} HYMF Araştırma Grubu • Ankara Üniversitesi Fen Fakültesi
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-[10px]">
            Sürüm: 1.0.0-academic (Next.js & Supabase)
          </div>
        </div>
      </div>
    </footer>
  );
}
