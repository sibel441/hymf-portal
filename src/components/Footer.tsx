import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/70 bg-slate-950/60 backdrop-blur text-slate-400 text-[13px] pt-14 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Kolon 1: Grup Tanıtımı */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl text-slate-100">Ψ HYMF</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">Ankara Üniversitesi</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Hesaplamalı Yoğun Madde Fiziği Araştırma Grubu; yoğunluk fonksiyoneli teorisi (DFT), moleküler dinamik ve elektronik yapı hesaplamaları üzerine odaklanan lisansüstü araştırma merkezidir.
            </p>
          </div>

          {/* Kolon 2: Hızlı Bağlantılar */}
          <div>
            <h4 className="text-slate-500 font-semibold mb-4 tracking-[0.14em] uppercase text-[10px]">Hızlı Erişim</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/kilavuzlar" className="hover:text-white transition">TRUBA & VASP Kılavuzları</Link>
              </li>
              <li>
                <Link href="/formlar" className="hover:text-white transition">Enstitü Resmi Formları</Link>
              </li>
              <li>
                <Link href="/kaynaklar" className="hover:text-white transition">Kod ve Script Havuzu</Link>
              </li>
              <li>
                <Link href="/dersler" className="hover:text-white transition">Lisansüstü Ders Materyalleri</Link>
              </li>
            </ul>
          </div>

          {/* Kolon 3: Resmi Kurumlar */}
          <div>
            <h4 className="text-slate-500 font-semibold mb-4 tracking-[0.14em] uppercase text-[10px]">Resmi Bağlantılar</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="http://hymf.ankara.edu.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition"
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
                  className="inline-flex items-center gap-1 hover:text-white transition"
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
                  className="inline-flex items-center gap-1 hover:text-white transition"
                >
                  <span>TÜBİTAK ULAKBİM TRUBA</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Kolon 4: Güvenlik ve RBAC */}
          <div>
            <h4 className="text-slate-500 font-semibold mb-4 tracking-[0.14em] uppercase text-[10px]">Gizlilik & Güvenlik</h4>
            <p className="text-slate-400 leading-relaxed">
              Bu portal HYMF araştırma grubu üyelerine özel, rol tabanlı erişim kontrolü (RBAC) ile korunmaktadır. Kişisel tez ve simülasyon verileri şifrelenmiş özel alanlarda tutulur.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/70 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
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
