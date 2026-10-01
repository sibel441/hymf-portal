'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Download,
  ExternalLink,
  FileCode,
  HardDrive,
  Key,
  Layers,
  Network,
  Terminal,
  Wrench,
} from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';

export default function GuidesPage() {
  const [activeTab, setActiveTab] = useState<'truba' | 'vasp' | 'lammps' | 'vpn'>('truba');

  return (
    <div className="space-y-8">
      {/* Başlık ve Açıklama */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
          <Wrench className="w-4 h-4" />
          <span>TEKNİK ALTYAPI VE HESAPLAMA KILAVUZLARI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Hızlı Kılavuzlar (Manuals)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl">
          TÜBİTAK ULAKBİM TRUBA süperbilgisayar aktivasyonu, VASP/LAMMPS hesaplama betikleri ve Ankara Üniversitesi yerleşke dışı VPN kurulum yönergeleri.
        </p>
      </div>

      {/* Sekmeler (Tabs) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('truba')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'truba'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>TRUBA Aktivasyonu & Slurm</span>
        </button>

        <button
          onClick={() => setActiveTab('vasp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'vasp'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>VASP Kılavuzu & INCAR</span>
        </button>

        <button
          onClick={() => setActiveTab('lammps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'lammps'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>LAMMPS Moleküler Dinamik</span>
        </button>

        <button
          onClick={() => setActiveTab('vpn')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'vpn'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Okul VPN & Veri Tabanları</span>
        </button>
      </div>

      {/* SEKME 1: TRUBA */}
      {activeTab === 'truba' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              1. TRUBA Hesap Aktivasyonu ve SSH Bağlantısı
            </h2>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                TÜBİTAK ULAKBİM TRUBA hesapları grup liderimiz Prof. Dr. danışmanlığındaki araştırma projesi kapsamında tanımlanır. Hesabınız açıldıktan sonra aşağıdaki adımları izleyiniz:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-white">SSH Anahtarı Oluşturma:</strong> Terminalinizde (Linux / macOS / PowerShell) SSH anahtar çifti oluşturun:
                </li>
              </ol>
            </div>

            <CodeBlock
              title="SSH Anahtarı Oluşturma Komutu"
              language="bash"
              code={`# 4096 bit RSA veya Ed25519 anahtarı oluşturun
ssh-keygen -t ed25519 -C "ad.soyad@ankara.edu.tr"

# Oluşturulan genel anahtarı görüntüleyin ve TRUBA portalına yükleyin:
cat ~/.ssh/id_ed25519.pub`}
            />

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Genel anahtarınızı (public key) <a href="https://portal.truba.gov.tr" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">portal.truba.gov.tr</a> adresine giriş yaparak profilinizdeki SSH anahtarları bölümüne ekleyiniz.
              </p>
              <p>Anahtar onaylandıktan sonra bağlantı komutu:</p>
            </div>

            <CodeBlock
              title="TRUBA Kullanıcı Arayüzüne Bağlantı (172.16.7.1)"
              language="bash"
              code={`ssh -i ~/.ssh/id_ed25519 kullanici_adiniz@172.16.7.1`}
            />
          </div>

          {/* Standart Barbun VASP Slurm Betiği */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              2. Standart TRUBA Barbun VASP Slurm İş Betiği
            </h2>
            <p className="text-xs text-slate-400">
              Aşağıdaki Slurm betiğini hesaplama klasörünüzde <code>run_vasp.sh</code> adıyla kaydedip <code>sbatch run_vasp.sh</code> komutu ile sıraya gönderebilirsiniz:
            </p>

            <CodeBlock
              title="run_vasp.sh (Standart HYMF Barbun Slurm Betiği)"
              language="bash"
              code={`#!/bin/bash
# ==============================================================================
# HYMF - TRUBA Barbun Kümesi VASP Hesaplama Betiği
# ==============================================================================
#SBATCH -p barbun
#SBATCH -A your_hymf_group_code
#SBATCH -J vasp_geometry_opt
#SBATCH -N 2
#SBATCH -n 80
#SBATCH --time=72:00:00
#SBATCH --output=slurm-%j.out
#SBATCH --error=slurm-%j.err

echo "[HYMF] Baslama Zamani: $(date)"
echo "[HYMF] Calisan Dugumler: $SLURM_JOB_NODELIST"

# Modülleri temizle ve VASP modülünü yükle
module purge
module load centos7.9/comp/intel/compilers-2021.4.0
module load centos7.9/app/vasp/6.3.2-int-mkl-mpi

# Bellek ve iş parçacığı ayarları
ulimit -s unlimited
export OMP_NUM_THREADS=1

# VASP Standart çalıştırıcı
srun vasp_std > vasp.out

echo "[HYMF] Bitis Zamani: $(date)"`}
            />
          </div>
        </div>
      )}

      {/* SEKME 2: VASP */}
      {activeTab === 'vasp' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <FileCode className="w-5 h-5 text-red-400" />
              VASP 4 Temel Giriş Dosyası ve INCAR Şablonu
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              VASP çalıştırmak için çalışma dizininde 4 dosya bulunmalıdır: <strong>INCAR</strong> (hesaplama parametreleri), <strong>POSCAR</strong> (atomik koordinatlar), <strong>KPOINTS</strong> (Brillouin bölgesi örneklemesi) ve <strong>POTCAR</strong> (pseudopotansiyeller).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200">KPOINTS (Monkhorst-Pack Şablonu)</span>
                <CodeBlock
                  title="KPOINTS Dosyası"
                  language="text"
                  code={`Automatic mesh
0
Monkhorst-Pack
 12  12   1
 0   0   0`}
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200">POTCAR Birleştirme Komutu</span>
                <CodeBlock
                  title="POTCAR Hazırlama (Örn: Mo ve S için)"
                  language="bash"
                  code={`cat ~/potcar_PBE/Mo_pv/POTCAR ~/potcar_PBE/S/POTCAR > POTCAR`}
                />
              </div>
            </div>

            <div className="pt-3">
              <h3 className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-wide">
                Önerilen Geometri Optimizasyonu INCAR Parametreleri
              </h3>
              <CodeBlock
                title="INCAR (Geometri Relaksasyonu)"
                language="text"
                code={`# HYMF Standart Geometri Optimizasyonu INCAR
SYSTEM = HYMF_MoS2_Optimization

# Elektronik Rahatlama
ENCUT  = 520       # Düzlem dalga kesme enerjisi (eV)
PREC   = Accurate  # Hassasiyet derecesi
EDIFF  = 1E-6      # SCF yakınsama toleransı
NELM   = 100       # Maksimum SCF adım sayısı
ISMEAR = 0         # Gaussian smearing (yarıiletken ve yalıtkanlar için)
SIGMA  = 0.05

# İyonik Rahatlama
IBRION = 2         # Eşlenik gradyan algoritması
ISIF   = 3         # Hücre hacmi ve iyonik pozisyonlar birlikte gevşetilir
NSW    = 200       # Maksimum iyonik adım sayısı
EDIFFG = -0.01     # İyonik kuvvet yakınsama kriteri (-0.01 eV/Angstrom)

# Performans ve Paralelleştirme
NCORE  = 4         # Düğüm başına çekirdek dağılımı (Barbun için NCORE=4 veya 8)
LREAL  = Auto      # Gerçek uzay projeksiyonu
LWAVE  = .FALSE.   # WAVECAR çıktısını disk tasarrufu için kapat
LCHARG = .TRUE.    # CHGCAR çıktısını al`}
              />
            </div>
          </div>
        </div>
      )}

      {/* SEKME 3: LAMMPS */}
      {activeTab === 'lammps' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              LAMMPS Moleküler Dinamik ve Simülasyon Kılavuzu
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Büyük atomik sistemlerin termal iletkenlik, difüzyon ve faz dönüşümü analizleri için LAMMPS yazılımı kullanılır.
            </p>

            <CodeBlock
              title="in.nvt (Standart NVT Termal Dengeleme Giriş Betiği)"
              language="text"
              code={`# HYMF - LAMMPS NVT Equilibration
units          metal
atom_style     atomic
boundary       p p p

read_data      structure.data

pair_style     tersoff
pair_coeff     * * SiC.tersoff C Si

velocity       all create 300.0 4928459 rot yes dist gaussian

timestep       0.001   # 1 fs

thermo         1000
thermo_style   custom step temp pe etotal press

fix            1 all nvt temp 300.0 300.0 0.1

dump           1 all custom 2000 traj.lammpstrj id type x y z vx vy vz

run            50000   # 50 ps`}
            />
          </div>
        </div>
      )}

      {/* SEKME 4: VPN */}
      {activeTab === 'vpn' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" />
              Ankara Üniversitesi Kampüs Dışı Erişim (VPN & Proxy)
            </h2>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                Kampüs dışından makale indirirken (ScienceDirect, APS Physical Review, AIP, Nature, IEEE) okul IP adresinden görünmek için FortiClient VPN veya Vetis portalı kullanılır:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">FortiClient SSL-VPN:</strong> Ankara Üniversitesi Bilgi İşlem Daire Başkanlığı sayfasından FortiClient yazılımını indirin. Sunucu adresi: <code>vpn.ankara.edu.tr</code>, Port: <code>10443</code>. Kullanıcı adı ve şifreniz olarak kurumsal e-posta bilgilerinizi giriniz.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">VETİS (Uzaktan Kütüphane Portalı):</strong> Herhangi bir yazılım kurmadan <a href="https://kutuphane.ankara.edu.tr" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">kutuphane.ankara.edu.tr</a> üzerinden VETİS sistemine giriş yaparak akademik veri tabanlarına doğrudan erişebilirsiniz.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
