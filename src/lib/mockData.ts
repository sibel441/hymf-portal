import { Announcement, Course, Meeting, Profile, Resource, StudentWorkspace } from '@/types/database';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-hoca-1',
    email: 'hoca@ankara.edu.tr',
    full_name: 'Prof. Dr. Ali Kemal Arslan',
    role: 'hoca',
    academic_title: 'Grup Lideri & Profesör',
    department: 'Fizik Anabilim Dalı',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    research_topics: ['Yoğun Madde Fiziği', 'DFT Hesaplamaları', '2D Malzemeler', 'Topolojik Yalıtkanlar'],
    scholar_url: 'https://scholar.google.com',
    orcid: '0000-0002-1825-0097',
    is_approved: true,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'user-admin-1',
    email: 'can.ozdemir@ankara.edu.tr',
    full_name: 'Can Özdemir',
    role: 'yonetici',
    academic_title: 'Doktora Araştırmacısı (Grup Yöneticisi)',
    department: 'Fizik Mühendisliği Anabilim Dalı',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    research_topics: ['VASP', 'Fonon Hesaplamaları', 'Grafen Türevleri', 'TRUBA Cluster Yönetimi'],
    scholar_url: 'https://scholar.google.com',
    orcid: '0000-0003-4512-8821',
    is_approved: true,
    created_at: '2026-02-01T11:00:00Z',
  },
  {
    id: 'user-admin-2',
    email: 'zeynep.kaya@ankara.edu.tr',
    full_name: 'Zeynep Kaya',
    role: 'yonetici',
    academic_title: 'Doktora Araştırmacısı (Grup Yöneticisi)',
    department: 'Fizik Anabilim Dalı',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    research_topics: ['Moleküler Dinamik (LAMMPS)', 'Termoelektrik Malzemeler', 'Python ile Veri Analizi'],
    scholar_url: 'https://scholar.google.com',
    orcid: '0000-0001-9921-3342',
    is_approved: true,
    created_at: '2026-02-15T09:30:00Z',
  },
  {
    id: 'user-student-1',
    email: 'burak.yilmaz@ankara.edu.tr',
    full_name: 'Burak Yılmaz',
    role: 'arastirmaci',
    academic_title: 'Yüksek Lisans Öğrencisi',
    department: 'Fizik Anabilim Dalı',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    research_topics: ['Manyetik İki Boyutlu Malzemeler', 'Spin Polarizasyonlu DFT'],
    scholar_url: 'https://scholar.google.com',
    orcid: '0009-0004-7128-4491',
    is_approved: true,
    created_at: '2026-03-01T14:00:00Z',
  },
  {
    id: 'user-student-2',
    email: 'elif.demir@ankara.edu.tr',
    full_name: 'Elif Demir',
    role: 'arastirmaci',
    academic_title: 'Doktora Öğrencisi',
    department: 'Fizik Mühendisliği Anabilim Dalı',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    research_topics: ['Perovskit Güneş Hücreleri', 'Optik Özellikler', 'HSE06 Hibrit Fonksiyoneller'],
    scholar_url: 'https://scholar.google.com',
    orcid: '0009-0002-3391-1120',
    is_approved: true,
    created_at: '2026-03-10T10:00:00Z',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'TRUBA Barbun ve Sarıyer Kümeleri Bakım Çalışması',
    content: 'TÜBİTAK ULAKBİM TRUBA kümesinde 5 Ekim Cumartesi günü saat 09:00 - 18:00 arasında planlı bakım yapılacaktır. Çalışan VASP işlerinizin checkpoint dosyalarını kontrol etmeyi unutmayınız.',
    priority: 'acil',
    author_id: 'user-admin-1',
    telegram_sent: true,
    created_at: '2026-10-01T08:30:00Z',
    author: INITIAL_PROFILES[1],
  },
  {
    id: 'ann-2',
    title: 'Haftalık Grup Semineri: 2D Manyetizmada Güncel Gelişmeler',
    content: 'Bu haftaki grup seminerimiz 3 Ekim Cuma saat 14:00’te B-302 nolu seminer salonunda ve Zoom üzerinden hibrit yapılacaktır. Sunum: Burak Yılmaz. Katılım zorunludur.',
    priority: 'toplanti',
    author_id: 'user-hoca-1',
    telegram_sent: true,
    created_at: '2026-09-30T14:15:00Z',
    author: INITIAL_PROFILES[0],
  },
  {
    id: 'ann-3',
    title: 'VASP 6.4.2 Kurulumu ve Wannier90 Kütüphanesi Bağlantısı',
    content: 'Yerel hesaplama sunucumuzda VASP 6.4.2 derlemesi tamamlanmıştır. Wannier fonksiyonları hesaplamak isteyenler `module load vasp/6.4.2-wannier` komutunu kullanabilir.',
    priority: 'kaynak_paylasimi',
    author_id: 'user-admin-2',
    telegram_sent: false,
    created_at: '2026-09-28T16:00:00Z',
    author: INITIAL_PROFILES[2],
  },
  {
    id: 'ann-4',
    title: 'LAMMPS ReaxFF Potansiyeli İçin Parametre Seçimi',
    content: 'Oksit yüzeylerde su molekülü adsorpsiyonu çalışırken ReaxFF potansiyelinde aşırı sıcaklık dalgalanması yaşayan var mı? Hangi zaman adımını (timestep) önerirsiniz?',
    priority: 'soru_yardim',
    author_id: 'user-student-2',
    telegram_sent: false,
    created_at: '2026-09-25T11:45:00Z',
    author: INITIAL_PROFILES[4],
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'VASP Bant Yapısı ve DOS Çizim Scripti (Pymatgen / Matplotlib)',
    description: 'VASP hesaplaması sonucunda oluşan vasprun.xml dosyasından doğrudan yayın kalitesinde elektronik bant yapısı ve durum yoğunluğu (DOS) çizen Python betiği.',
    category: 'kod_script',
    language: 'python',
    tags: ['VASP', 'DFT', 'Bant Yapısı', 'DOS', 'Python', 'Pymatgen'],
    uploader_id: 'user-admin-1',
    code_snippet: `#!/usr/bin/env python3
# HYMF - VASP Band & DOS Plotter
# Standard naming: 2026_10_SCRIPT_VaspBandPlot_CanOzdemir.py

from pymatgen.io.vasp import Vasprun, BSVasprun
from pymatgen.electronic_structure.plotter import BSPlotter
import matplotlib.pyplot as plt

vasprun_path = "vasprun.xml"
print("[HYMF] vasprun.xml okunuyor...")

run = BSVasprun(vasprun_path, parse_projected_eigen=True)
bs = run.get_band_structure(line_mode=True)

plotter = BSPlotter(bs)
plt = plotter.get_plot(ylim=[-4, 4], zero_to_efermi=True)
plt.title("HYMF Grup - Elektronik Bant Yapisi (E_F = 0 eV)", fontsize=12)
plt.savefig("band_structure.pdf", dpi=300, bbox_inches='tight')
print("[HYMF] band_structure.pdf basariyla olusturuldu.")
`,
    created_at: '2026-09-20T10:00:00Z',
    uploader: INITIAL_PROFILES[1],
  },
  {
    id: 'res-2',
    title: 'TRUBA Barbun / Sarıyer Slurm VASP İş Betiği Şablonu',
    description: 'TRUBA kümelerinde OpenMPI ve Intel derleyicisi ile VASP koşmak için standart Slurm betiği. Barındırdığı parametreler bellek aşımını önleyecek şekilde optimize edilmiştir.',
    category: 'kod_script',
    language: 'bash',
    tags: ['TRUBA', 'Slurm', 'HPC', 'Bash', 'VASP'],
    uploader_id: 'user-admin-1',
    code_snippet: `#!/bin/bash
#SBATCH -p barbun
#SBATCH -A your_hymf_account
#SBATCH -J vasp_opt
#SBATCH -N 2
#SBATCH -n 80
#SBATCH --time=48:00:00
#SBATCH --output=slurm-%j.out
#SBATCH --error=slurm-%j.err

echo "[HYMF] Is baslatiliyor: $(date)"
module purge
module load centos7.9/comp/intel/compilers-2021.4.0
module load centos7.9/app/vasp/6.3.2-int-mkl-mpi

ulimit -s unlimited
export OMP_NUM_THREADS=1

srun vasp_std > vasp.out
echo "[HYMF] Is tamamlandi: $(date)"
`,
    created_at: '2026-09-22T14:30:00Z',
    uploader: INITIAL_PROFILES[1],
  },
  {
    id: 'res-3',
    title: 'Richard M. Martin - Electronic Structure: Basic Theory and Practical Methods',
    description: 'Yoğun madde fiziğinde DFT ve elektronik yapı hesaplamalarının temel başvuru kaynağı. Grup seminerleri için zorunlu referans kitaptır.',
    category: 'kitap_makale',
    file_url: 'https://example.com/books/Electronic_Structure_Martin.pdf',
    tags: ['Kitap', 'DFT', 'Elektronik Yapi', 'Temel Teori'],
    uploader_id: 'user-hoca-1',
    language: 'bash',
    created_at: '2026-09-15T09:00:00Z',
    uploader: INITIAL_PROFILES[0],
  },
  {
    id: 'res-4',
    title: 'Materials Project Veri Tabanı ve API Rehberi',
    description: 'Kristal yapıları, faz diyagramları ve hesaplanmış bant aralıkları için birincil açık kaynak veritabanı.',
    category: 'faydali_link',
    external_url: 'https://next-gen.materialsproject.org',
    tags: ['Veritabanı', 'Kristal Yapi', 'Materials Project', 'Açık Veri'],
    uploader_id: 'user-student-1',
    language: 'bash',
    created_at: '2026-09-18T16:20:00Z',
    uploader: INITIAL_PROFILES[3],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'FIZ601',
    name: 'İleri Yoğun Madde Fiziği',
    instructor_id: 'user-hoca-1',
    semester: '2026-2027 Güz',
    syllabus: 'Kristal simetrileri, Bloch teoremi, periyodik potansiyeller, elektron-elektron etkileşimi, Hartree-Fock ve Yoğunluk Fonksiyoneli Teorisi (DFT), fononlar ve kristal örgü dinamikleri.',
    created_at: '2026-09-01T10:00:00Z',
    instructor: INITIAL_PROFILES[0],
    materials: [
      {
        id: 'mat-1',
        course_id: 'course-1',
        week_number: 1,
        title: 'Hafta 1: Kristal Örgüler ve Karşıt Örgü (Reciprocal Lattice)',
        description: 'Bravais örgüleri, Brillouin bölgeleri ve Wigner-Seitz hücresi.',
        file_url: 'https://example.com/materials/2026_10_DERS_FIZ601_Hafta1_AliKemalArslan.pdf',
        uploader_id: 'user-hoca-1',
        created_at: '2026-09-15T08:00:00Z',
        uploader: INITIAL_PROFILES[0],
      },
      {
        id: 'mat-2',
        course_id: 'course-1',
        week_number: 2,
        title: 'Hafta 2: Bloch Teoremi ve Serbest Elektron Gazı Yaklaşımı',
        description: 'Kristal elektronunun dalga fonksiyonu ve bant enerjisi sınırları.',
        file_url: 'https://example.com/materials/2026_10_DERS_FIZ601_Hafta2_AliKemalArslan.pdf',
        uploader_id: 'user-hoca-1',
        created_at: '2026-09-22T08:00:00Z',
        uploader: INITIAL_PROFILES[0],
      },
      {
        id: 'mat-3',
        course_id: 'course-1',
        week_number: 3,
        title: 'Hafta 3: Yoğunluk Fonksiyoneli Teorisine Giriş (Hohenberg-Kohn ve Kohn-Sham)',
        description: 'Değişimsel prensip ve tek elektron denkliği denklemleri.',
        file_url: 'https://example.com/materials/2026_10_DERS_FIZ601_Hafta3_CanOzdemir.pdf',
        uploader_id: 'user-admin-1',
        created_at: '2026-09-29T08:00:00Z',
        uploader: INITIAL_PROFILES[1],
      },
    ],
  },
  {
    id: 'course-2',
    code: 'FIZ614',
    name: 'Hesaplamalı Malzeme Fiziği ve DFT Uygulamaları',
    instructor_id: 'user-hoca-1',
    semester: '2026-2027 Güz',
    syllabus: 'VASP ve Quantum ESPRESSO yazılımları ile uygulamalı simülasyon adımları: Geometri optimizasyonu, k-noktası yakınsama testleri, kesme enerjisi (ENCUT) testleri ve fonon dispersiyonları.',
    created_at: '2026-09-01T10:00:00Z',
    instructor: INITIAL_PROFILES[0],
    materials: [
      {
        id: 'mat-4',
        course_id: 'course-2',
        week_number: 1,
        title: 'Hafta 1: Pseudopotansiyeller ve Düzlem Dalga Kesme Enerjisi Yakınsaması',
        description: 'PAW potansiyelleri ve ENCUT yakınsama grafikleri hazırlama.',
        file_url: 'https://example.com/materials/2026_10_DERS_FIZ614_Hafta1_AliKemalArslan.pdf',
        uploader_id: 'user-hoca-1',
        created_at: '2026-09-18T08:00:00Z',
        uploader: INITIAL_PROFILES[0],
      },
    ],
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Güz Dönemi Açılış ve TRUBA Kota Paylaşımı Toplantısı',
    meeting_date: '2026-09-22T13:00:00Z',
    notes: 'Yeni dönemde TRUBA üzerinde kullanılacak CPU saati kotası projeler bazında dağıtıldı. Doktora öğrencilerine aylık 100.000 çekirdek/saat, Y.Lisans öğrencilerine 40.000 çekirdek/saat tanımlandı.',
    presentation_url: 'https://example.com/slides/2026_09_TOPLANTI_GuzDonemiAcilis.pdf',
    creator_id: 'user-hoca-1',
    created_at: '2026-09-22T15:00:00Z',
    creator: INITIAL_PROFILES[0],
  },
  {
    id: 'meet-2',
    title: 'Burak Yılmaz - 2D Manyetik Malzemeler Semineri',
    meeting_date: '2026-10-03T11:00:00Z',
    notes: 'CrI3 ve Cr2Ge2Te6 tabakalarında manyetik anizotropi hesaplamaları sunulacak.',
    creator_id: 'user-student-1',
    created_at: '2026-09-30T10:00:00Z',
    creator: INITIAL_PROFILES[3],
  },
];

export const INITIAL_WORKSPACES: StudentWorkspace[] = [
  {
    id: 'ws-student-1',
    student_id: 'user-student-1',
    thesis_title: 'İki Boyutlu Ferromanyetik Yarıiletkenlerde Manyetik Anizotropi ve Dış Gerinim Etkisi',
    advisor: 'Prof. Dr. Ali Kemal Arslan',
    summary: 'Bu tez çalışmasında tek tabakalı geçiş metali trihalojenürlerin (CrX3) düzlem içi ve düzlem dışı gerinim altında manyetik düzenlerinin DFT ve Monte Carlo yöntemleriyle incelenmesi hedeflenmektedir.',
    simulation_notes: 'TRUBA barbun kümesinde spin-yörünge etkileşimi (SOC) açık hesaplamalar yapılıyor. GGA+U için U_eff=3.0 eV seçildi.',
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-09-29T16:45:00Z',
    student: INITIAL_PROFILES[3],
    files: [
      {
        id: 'file-1',
        workspace_id: 'ws-student-1',
        file_name: '2026_09_TEZ_CrI3_BantYapisi_BurakYilmaz.pdf',
        file_url: 'https://example.com/workspaces/student-1/CrI3_Bant.pdf',
        file_size: '2.4 MB',
        uploaded_by: 'user-student-1',
        notes: 'Spin yukarı ve aşağı bant ayrışması kontrol edildi.',
        created_at: '2026-09-25T14:00:00Z',
        uploader: INITIAL_PROFILES[3],
      },
      {
        id: 'file-2',
        workspace_id: 'ws-student-1',
        file_name: '2026_09_VERI_MagneticAnisotropyEnergy_BurakYilmaz.csv',
        file_url: 'https://example.com/workspaces/student-1/MAE_data.csv',
        file_size: '120 KB',
        uploaded_by: 'user-student-1',
        notes: '001 ve 100 doğrultuları arasındaki enerji farkı tablosu.',
        created_at: '2026-09-28T11:30:00Z',
        uploader: INITIAL_PROFILES[3],
      },
    ],
    logs: [
      {
        id: 'log-1',
        workspace_id: 'ws-student-1',
        actor_id: 'user-student-1',
        action: 'Yeni MAE simülasyon çıktıları ve CSV verisi yüklendi.',
        created_at: '2026-09-28T11:31:00Z',
        actor: INITIAL_PROFILES[3],
      },
      {
        id: 'log-2',
        workspace_id: 'ws-student-1',
        actor_id: 'user-hoca-1',
        action: 'Prof. Dr. Ali Kemal Arslan verileri inceledi: "U değerini 3.5 eV ile de test edip farkı raporla" notunu ekledi.',
        created_at: '2026-09-29T16:45:00Z',
        actor: INITIAL_PROFILES[0],
      },
    ],
  },
  {
    id: 'ws-student-2',
    student_id: 'user-student-2',
    thesis_title: 'Kurşunsuz Halojenür Perovskitlerde Kusur Fiziği ve Optoelektronik Özellikler',
    advisor: 'Prof. Dr. Ali Kemal Arslan',
    summary: 'Cs2AgBiBr6 çift perovskit yapısının kararlılığı ve nokta kusurlarının (noktasal boşluk ve arayer atomları) oluşum enerjilerinin HSE06 hibrit yoğunluk fonksiyoneli ile hesaplanması.',
    simulation_notes: 'Kusur hesaplamalarında süperhücre boyutu 2x2x2 (80 atom) olarak seçildi. Kimyasal potansiyel sınırları belirlendi.',
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-09-30T10:15:00Z',
    student: INITIAL_PROFILES[4],
    files: [
      {
        id: 'file-3',
        workspace_id: 'ws-student-2',
        file_name: '2026_09_TEZ_Perovskit_Defect_Formation_ElifDemir.pdf',
        file_url: 'https://example.com/workspaces/student-2/Defect_Formation.pdf',
        file_size: '4.1 MB',
        uploaded_by: 'user-student-2',
        notes: 'Fermi seviyesine bağlı kusur geçiş seviyeleri çizimi.',
        created_at: '2026-09-27T09:00:00Z',
        uploader: INITIAL_PROFILES[4],
      },
    ],
    logs: [
      {
        id: 'log-3',
        workspace_id: 'ws-student-2',
        actor_id: 'user-student-2',
        action: 'Kusur oluşum enerjisi grafiği ve taslak rapor yüklendi.',
        created_at: '2026-09-27T09:02:00Z',
        actor: INITIAL_PROFILES[4],
      },
      {
        id: 'log-4',
        workspace_id: 'ws-student-2',
        actor_id: 'user-admin-1',
        action: 'Can Özdemir (Yönetici) VASP INCAR parametrelerini kontrol etti.',
        created_at: '2026-09-28T14:20:00Z',
        actor: INITIAL_PROFILES[1],
      },
    ],
  },
];
